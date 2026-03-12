"""Analytics – post analytics and page insights endpoints."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import FacebookPage, PageInsight, PostAnalytic, PublishedPost
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import NotFoundError

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class PostAnalyticResponse(BaseModel):
    id: uuid.UUID
    published_post_id: uuid.UUID
    measured_at: datetime
    reach: int
    impressions: int
    reactions: dict[str, Any]
    comments_count: int
    shares_count: int
    clicks: int

    model_config = {"from_attributes": True}


class PageInsightResponse(BaseModel):
    id: uuid.UUID
    facebook_page_id: uuid.UUID
    date: date
    fans_total: int
    impressions_unique: int
    engaged_users: int
    new_followers: int
    reach: int

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    total_posts_published: int
    total_reach: int
    total_impressions: int
    avg_engagement_rate: float
    new_followers_30d: int


# ── Service ───────────────────────────────────────────────────────────────────

class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.org_repo = OrganizationRepository(db)

    async def _org(self, user) -> Any:
        org = await self.org_repo.get_by_user_id(user.id)
        if not org:
            raise NotFoundError("Organization")
        return org

    async def get_post_analytics(
        self, user, published_post_id: uuid.UUID
    ) -> list[PostAnalytic]:
        org = await self._org(user)
        # Verify ownership
        result = await self.db.execute(
            select(PublishedPost)
            .join(PublishedPost.scheduled_post)
            .where(PublishedPost.id == published_post_id)
        )
        pub_post = result.scalar_one_or_none()
        if not pub_post:
            raise NotFoundError("PublishedPost")

        result = await self.db.execute(
            select(PostAnalytic)
            .where(PostAnalytic.published_post_id == published_post_id)
            .order_by(PostAnalytic.measured_at.desc())
        )
        return list(result.scalars())

    async def get_page_insights(
        self,
        user,
        page_id: uuid.UUID,
        since: date | None,
        until: date | None,
    ) -> list[PageInsight]:
        org = await self._org(user)
        query = select(PageInsight).where(PageInsight.facebook_page_id == page_id)
        if since:
            query = query.where(PageInsight.date >= since)
        if until:
            query = query.where(PageInsight.date <= until)
        result = await self.db.execute(query.order_by(PageInsight.date.desc()))
        return list(result.scalars())

    async def get_dashboard_summary(self, user) -> DashboardSummary:
        from sqlalchemy import func
        org = await self._org(user)

        # Total published posts
        pp_result = await self.db.execute(
            select(func.count(PublishedPost.id))
            .join(PublishedPost.scheduled_post)
            .where(PublishedPost.scheduled_post.has(org_id=org.id))
        )
        total_published = pp_result.scalar_one() or 0

        # Aggregate analytics
        agg_result = await self.db.execute(
            select(
                func.sum(PostAnalytic.reach),
                func.sum(PostAnalytic.impressions),
            )
            .join(PostAnalytic.published_post)
            .join(PublishedPost.scheduled_post)
            .where(PublishedPost.scheduled_post.has(org_id=org.id))
        )
        row = agg_result.one_or_none()
        total_reach = int(row[0] or 0)
        total_impressions = int(row[1] or 0)
        avg_er = (total_reach / total_impressions * 100) if total_impressions else 0.0

        # New followers last 30 days
        from datetime import timedelta
        since_30d = datetime.now(tz=timezone.utc).date() - timedelta(days=30)
        followers_result = await self.db.execute(
            select(func.sum(PageInsight.new_followers))
            .join(PageInsight.facebook_page)
            .where(
                FacebookPage.org_id == org.id,
                PageInsight.date >= since_30d,
            )
        )
        new_followers = int(followers_result.scalar_one() or 0)

        return DashboardSummary(
            total_posts_published=total_published,
            total_reach=total_reach,
            total_impressions=total_impressions,
            avg_engagement_rate=round(avg_er, 2),
            new_followers_30d=new_followers,
        )


# ── Router ────────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard_summary(current_user: CurrentUser, db: DbSession) -> DashboardSummary:
    return await AnalyticsService(db).get_dashboard_summary(current_user)


@router.get("/posts/{published_post_id}", response_model=list[PostAnalyticResponse])
async def get_post_analytics(
    published_post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> list[PostAnalytic]:
    return await AnalyticsService(db).get_post_analytics(current_user, published_post_id)


@router.get("/pages/{page_id}/insights", response_model=list[PageInsightResponse])
async def get_page_insights(
    page_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    since: date | None = Query(None),
    until: date | None = Query(None),
) -> list[PageInsight]:
    return await AnalyticsService(db).get_page_insights(current_user, page_id, since, until)
