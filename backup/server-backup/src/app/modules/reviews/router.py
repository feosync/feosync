"""Reviews – import, list, respond to, and publish as posts."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import Review, ReviewSource
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import NotFoundError
from src.app.shared.pagination.paginator import PaginatedResponse, PaginationParams

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    source: ReviewSource
    external_id: str | None = None
    reviewer_name: str | None = None
    rating: int | None = None
    review_text: str | None = None
    review_date: datetime | None = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    source: ReviewSource
    reviewer_name: str | None
    rating: int | None
    review_text: str | None
    review_date: datetime | None
    handled: bool
    response_text: str | None
    published_as_post_id: uuid.UUID | None

    model_config = {"from_attributes": True}


class ReviewRespondRequest(BaseModel):
    response_text: str


# ── Repository ────────────────────────────────────────────────────────────────

class ReviewRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, org_id: uuid.UUID, data: ReviewCreate) -> Review:
        review = Review(org_id=org_id, **data.model_dump())
        self.db.add(review)
        await self.db.flush()
        return review

    async def list_by_org(
        self,
        org_id: uuid.UUID,
        handled: bool | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Review], int]:
        from sqlalchemy import func
        query = select(Review).where(Review.org_id == org_id)
        if handled is not None:
            query = query.where(Review.handled == handled)
        total = (await self.db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
        items = (
            await self.db.execute(
                query.order_by(Review.review_date.desc().nulls_last()).limit(limit).offset(offset)
            )
        ).scalars().all()
        return list(items), total

    async def get(self, review_id: uuid.UUID, org_id: uuid.UUID) -> Review | None:
        result = await self.db.execute(
            select(Review).where(Review.id == review_id, Review.org_id == org_id)
        )
        return result.scalar_one_or_none()

    async def mark_handled(self, review_id: uuid.UUID, response: str | None = None) -> None:
        vals: dict[str, Any] = {"handled": True}
        if response:
            vals["response_text"] = response
        await self.db.execute(update(Review).where(Review.id == review_id).values(**vals))


# ── Service ───────────────────────────────────────────────────────────────────

class ReviewService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = ReviewRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def _org(self, user) -> Any:
        org = await self.org_repo.get_by_user_id(user.id)
        if not org:
            raise NotFoundError("Organization")
        return org

    async def create(self, user, payload: ReviewCreate) -> Review:
        org = await self._org(user)
        return await self.repo.create(org.id, payload)

    async def list_reviews(
        self, user, params: PaginationParams, handled: bool | None
    ) -> tuple[list[Review], int]:
        org = await self._org(user)
        return await self.repo.list_by_org(org.id, handled, params.limit, params.offset)

    async def respond(self, user, review_id: uuid.UUID, response_text: str) -> None:
        org = await self._org(user)
        review = await self.repo.get(review_id, org.id)
        if not review:
            raise NotFoundError("Review")
        await self.repo.mark_handled(review_id, response_text)

    async def publish_as_post(self, user, review_id: uuid.UUID) -> Any:
        """Turn a positive review into a scheduled post draft."""
        from src.app.modules.posts.router import PostService, ScheduledPostCreate
        from datetime import timezone, timedelta

        org = await self._org(user)
        review = await self.repo.get(review_id, org.id)
        if not review:
            raise NotFoundError("Review")

        caption = (
            f'⭐️ Avis client\n\n"{review.review_text}"\n'
            f"— {review.reviewer_name or 'Un client satisfait'}\n\n"
            f"Merci pour votre confiance ! 🙏"
        )
        publish_at = datetime.now(tz=timezone.utc) + timedelta(hours=1)
        post_payload = ScheduledPostCreate(caption=caption, publish_at=publish_at)
        post = await PostService(self.db).create(user, post_payload)
        await self.repo.mark_handled(review_id)
        return post


# ── Router ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    payload: ReviewCreate, current_user: CurrentUser, db: DbSession
) -> Review:
    return await ReviewService(db).create(current_user, payload)


@router.get("", response_model=PaginatedResponse[ReviewResponse])
async def list_reviews(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    handled: bool | None = Query(None),
) -> PaginatedResponse[ReviewResponse]:
    params = PaginationParams(page=page, page_size=page_size)
    reviews, total = await ReviewService(db).list_reviews(current_user, params, handled)
    items = [ReviewResponse.model_validate(r) for r in reviews]
    return PaginatedResponse.build(items, total, params)


@router.post("/{review_id}/respond", status_code=204)
async def respond_to_review(
    review_id: uuid.UUID,
    payload: ReviewRespondRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    await ReviewService(db).respond(current_user, review_id, payload.response_text)


@router.post("/{review_id}/publish-as-post", status_code=201)
async def publish_review_as_post(
    review_id: uuid.UUID, current_user: CurrentUser, db: DbSession
) -> Any:
    return await ReviewService(db).publish_as_post(current_user, review_id)
