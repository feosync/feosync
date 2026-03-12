"""Scheduler – manage publication rules (cron-based auto-posting)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from croniter import croniter
from fastapi import APIRouter
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import Schedule, ScheduleRuleType
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import BadRequestError, NotFoundError

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ScheduleCreate(BaseModel):
    name: str
    rule_type: ScheduleRuleType
    cron_expr: str | None = None
    data_source_config: dict[str, Any] = {}
    template_id: uuid.UUID | None = None
    channels: list[str] = ["facebook"]
    page_ids: list[str] = []

    @field_validator("cron_expr")
    @classmethod
    def validate_cron(cls, v: str | None) -> str | None:
        if v and not croniter.is_valid(v):
            raise ValueError(f"Invalid cron expression: {v}")
        return v


class ScheduleUpdate(BaseModel):
    name: str | None = None
    cron_expr: str | None = None
    active: bool | None = None
    template_id: uuid.UUID | None = None
    page_ids: list[str] | None = None


class ScheduleResponse(BaseModel):
    id: uuid.UUID
    name: str
    rule_type: ScheduleRuleType
    cron_expr: str | None
    active: bool
    last_run_at: datetime | None
    next_run_at: datetime | None
    page_ids: list[str]
    channels: list[str]

    model_config = {"from_attributes": True}


# ── Repository ────────────────────────────────────────────────────────────────

class ScheduleRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, org_id: uuid.UUID, data: ScheduleCreate) -> Schedule:
        next_run = None
        if data.cron_expr:
            next_run = croniter(data.cron_expr).get_next(datetime)

        schedule = Schedule(
            org_id=org_id,
            name=data.name,
            rule_type=data.rule_type,
            cron_expr=data.cron_expr,
            data_source_config=data.data_source_config,
            template_id=data.template_id,
            channels=data.channels,
            page_ids=data.page_ids,
            next_run_at=next_run,
        )
        self.db.add(schedule)
        await self.db.flush()
        return schedule

    async def list_by_org(self, org_id: uuid.UUID) -> list[Schedule]:
        result = await self.db.execute(
            select(Schedule).where(Schedule.org_id == org_id).order_by(Schedule.created_at.desc())
        )
        return list(result.scalars())

    async def get(self, schedule_id: uuid.UUID, org_id: uuid.UUID) -> Schedule | None:
        result = await self.db.execute(
            select(Schedule).where(
                Schedule.id == schedule_id, Schedule.org_id == org_id
            )
        )
        return result.scalar_one_or_none()

    async def update(self, schedule: Schedule, data: dict) -> Schedule:
        for k, v in data.items():
            setattr(schedule, k, v)
        if "cron_expr" in data and data["cron_expr"]:
            schedule.next_run_at = croniter(data["cron_expr"]).get_next(datetime)
        await self.db.flush()
        return schedule

    async def delete(self, schedule: Schedule) -> None:
        await self.db.delete(schedule)
        await self.db.flush()


# ── Router ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ScheduleResponse, status_code=201)
async def create_schedule(
    payload: ScheduleCreate, current_user: CurrentUser, db: DbSession
) -> Schedule:
    org = await OrganizationRepository(db).get_by_user_id(current_user.id)
    if not org:
        raise NotFoundError("Organization")
    return await ScheduleRepository(db).create(org.id, payload)


@router.get("", response_model=list[ScheduleResponse])
async def list_schedules(current_user: CurrentUser, db: DbSession) -> list[Schedule]:
    org = await OrganizationRepository(db).get_by_user_id(current_user.id)
    if not org:
        raise NotFoundError("Organization")
    return await ScheduleRepository(db).list_by_org(org.id)


@router.patch("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: uuid.UUID,
    payload: ScheduleUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> Schedule:
    org = await OrganizationRepository(db).get_by_user_id(current_user.id)
    if not org:
        raise NotFoundError("Organization")
    repo = ScheduleRepository(db)
    schedule = await repo.get(schedule_id, org.id)
    if not schedule:
        raise NotFoundError("Schedule")
    return await repo.update(schedule, payload.model_dump(exclude_none=True))


@router.delete("/{schedule_id}", status_code=204)
async def delete_schedule(
    schedule_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> None:
    org = await OrganizationRepository(db).get_by_user_id(current_user.id)
    if not org:
        raise NotFoundError("Organization")
    repo = ScheduleRepository(db)
    schedule = await repo.get(schedule_id, org.id)
    if not schedule:
        raise NotFoundError("Schedule")
    await repo.delete(schedule)
