"""Scheduled Posts – full CRUD + manual publish trigger."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import PostStatus, PublishedChannel, ScheduledPost
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import ForbiddenError, NotFoundError
from src.app.shared.pagination.paginator import PaginatedResponse, PaginationParams

router = APIRouter(prefix="/posts", tags=["Posts"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ScheduledPostCreate(BaseModel):
    caption: str | None = None
    image_url: str | None = None
    content: dict[str, Any] = {}
    publish_at: datetime
    channels: list[str] = [PublishedChannel.FACEBOOK]
    page_ids: list[str] = []
    template_id: uuid.UUID | None = None
    ai_gen_id: uuid.UUID | None = None


class ScheduledPostUpdate(BaseModel):
    caption: str | None = None
    image_url: str | None = None
    content: dict[str, Any] | None = None
    publish_at: datetime | None = None
    status: PostStatus | None = None
    channels: list[str] | None = None
    page_ids: list[str] | None = None


class ScheduledPostResponse(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    caption: str | None
    image_url: str | None
    publish_at: datetime
    status: PostStatus
    channels: list[str]
    page_ids: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Repository ────────────────────────────────────────────────────────────────

class PostRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, org_id: uuid.UUID, data: ScheduledPostCreate) -> ScheduledPost:
        post = ScheduledPost(
            org_id=org_id,
            **data.model_dump(),
        )
        self.db.add(post)
        await self.db.flush()
        return post

    async def get(self, post_id: uuid.UUID, org_id: uuid.UUID) -> ScheduledPost | None:
        result = await self.db.execute(
            select(ScheduledPost).where(
                ScheduledPost.id == post_id,
                ScheduledPost.org_id == org_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_org(
        self,
        org_id: uuid.UUID,
        status: PostStatus | None,
        limit: int,
        offset: int,
    ) -> tuple[list[ScheduledPost], int]:
        from sqlalchemy import func

        query = select(ScheduledPost).where(ScheduledPost.org_id == org_id)
        if status:
            query = query.where(ScheduledPost.status == status)

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar_one()

        items = (
            await self.db.execute(
                query.order_by(ScheduledPost.publish_at.asc()).limit(limit).offset(offset)
            )
        ).scalars().all()
        return list(items), total

    async def update(self, post: ScheduledPost, data: dict) -> ScheduledPost:
        for k, v in data.items():
            setattr(post, k, v)
        await self.db.flush()
        return post

    async def delete(self, post: ScheduledPost) -> None:
        await self.db.delete(post)
        await self.db.flush()

    async def get_due_posts(self) -> list[ScheduledPost]:
        """Return all scheduled posts whose publish_at is now or in the past."""
        from datetime import timezone
        now = datetime.now(tz=timezone.utc)
        result = await self.db.execute(
            select(ScheduledPost).where(
                ScheduledPost.status == PostStatus.SCHEDULED,
                ScheduledPost.publish_at <= now,
            )
        )
        return list(result.scalars())


# ── Service ───────────────────────────────────────────────────────────────────

class PostService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = PostRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def _org(self, user) -> Any:
        org = await self.org_repo.get_by_user_id(user.id)
        if not org:
            raise NotFoundError("Organization")
        return org

    async def create(self, user, payload: ScheduledPostCreate) -> ScheduledPost:
        org = await self._org(user)
        from src.app.modules.plans.service import PlanService
        await PlanService(self.db).check_post_limit(user, org)
        return await self.repo.create(org.id, payload)

    async def list_posts(
        self, user, params: PaginationParams, status: PostStatus | None
    ) -> tuple[list[ScheduledPost], int]:
        org = await self._org(user)
        return await self.repo.list_by_org(org.id, status, params.limit, params.offset)

    async def get_post(self, user, post_id: uuid.UUID) -> ScheduledPost:
        org = await self._org(user)
        post = await self.repo.get(post_id, org.id)
        if not post:
            raise NotFoundError("ScheduledPost")
        return post

    async def update_post(
        self, user, post_id: uuid.UUID, payload: ScheduledPostUpdate
    ) -> ScheduledPost:
        post = await self.get_post(user, post_id)
        if post.status == PostStatus.PUBLISHED:
            raise ForbiddenError("Cannot edit a published post")
        return await self.repo.update(post, payload.model_dump(exclude_none=True))

    async def delete_post(self, user, post_id: uuid.UUID) -> None:
        post = await self.get_post(user, post_id)
        if post.status == PostStatus.PUBLISHING:
            raise ForbiddenError("Cannot delete a post that is being published")
        await self.repo.delete(post)


# ── Router ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ScheduledPostResponse, status_code=201)
async def create_post(
    payload: ScheduledPostCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> ScheduledPost:
    return await PostService(db).create(current_user, payload)


@router.get("", response_model=PaginatedResponse[ScheduledPostResponse])
async def list_posts(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: PostStatus | None = Query(None),
) -> PaginatedResponse[ScheduledPostResponse]:
    params = PaginationParams(page=page, page_size=page_size)
    posts, total = await PostService(db).list_posts(current_user, params, status)
    items = [ScheduledPostResponse.model_validate(p) for p in posts]
    return PaginatedResponse.build(items, total, params)


@router.get("/{post_id}", response_model=ScheduledPostResponse)
async def get_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> ScheduledPost:
    return await PostService(db).get_post(current_user, post_id)


@router.patch("/{post_id}", response_model=ScheduledPostResponse)
async def update_post(
    post_id: uuid.UUID,
    payload: ScheduledPostUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ScheduledPost:
    return await PostService(db).update_post(current_user, post_id, payload)


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    await PostService(db).delete_post(current_user, post_id)
