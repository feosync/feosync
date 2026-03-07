"""Plans service – quota checks and plan management."""
from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.modules.models import Organization, Plan, User
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import NotFoundError, PlanLimitExceededError


class PlanResponse(BaseModel):
    id: uuid.UUID
    name: str
    price_ariary: int
    max_pages: int
    max_posts_month: int
    max_ai_gen: int
    max_schedules: int
    features: dict[str, Any]

    model_config = {"from_attributes": True}


class PlanService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_plans(self) -> list[Plan]:
        result = await self.db.execute(
            select(Plan).where(Plan.is_active == True)  # noqa: E712
        )
        return list(result.scalars())

    async def get_user_plan(self, user: User) -> Plan | None:
        if not user.plan_id:
            return None
        result = await self.db.execute(select(Plan).where(Plan.id == user.plan_id))
        return result.scalar_one_or_none()

    # ── Quota enforcement ─────────────────────────────────────────────────────

    async def check_page_limit(self, user: User, org: Organization) -> None:
        plan = await self.get_user_plan(user)
        if not plan:
            return  # Free tier / unlimited during trial
        from src.app.modules.facebook_pages.router import FacebookPageRepository
        repo = FacebookPageRepository(self.db)
        count = await repo.count_active(org.id)
        if count >= plan.max_pages:
            raise PlanLimitExceededError("Facebook pages")

    async def check_post_limit(self, user: User, org: Organization) -> None:
        plan = await self.get_user_plan(user)
        if not plan:
            return
        from datetime import datetime, timezone
        from sqlalchemy import func, extract
        from src.app.modules.models import ScheduledPost
        now = datetime.now(tz=timezone.utc)
        result = await self.db.execute(
            select(func.count()).where(
                ScheduledPost.org_id == org.id,
                extract("year", ScheduledPost.created_at) == now.year,
                extract("month", ScheduledPost.created_at) == now.month,
            )
        )
        count = result.scalar_one()
        if count >= plan.max_posts_month:
            raise PlanLimitExceededError("posts this month")

    async def check_ai_gen_limit(self, user: User, org: Organization) -> None:
        plan = await self.get_user_plan(user)
        if not plan:
            return
        from datetime import datetime, timezone
        from sqlalchemy import func, extract
        from src.app.modules.models import AIGeneration
        now = datetime.now(tz=timezone.utc)
        result = await self.db.execute(
            select(func.count()).where(
                AIGeneration.org_id == org.id,
                extract("year", AIGeneration.created_at) == now.year,
                extract("month", AIGeneration.created_at) == now.month,
            )
        )
        count = result.scalar_one()
        if count >= plan.max_ai_gen:
            raise PlanLimitExceededError("AI generations this month")
