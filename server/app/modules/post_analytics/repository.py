from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_, between
from sqlalchemy.ext.asyncio import AsyncSession

from .model import PostAnalytics


class PostAnalyticsRepository:
    """Repository for PostAnalytics — all DB operations in one place."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #

    async def create(self, analytics: PostAnalytics) -> PostAnalytics:
        """Persist a new PostAnalytics record."""
        self.session.add(analytics)
        await self.session.flush()
        await self.session.refresh(analytics)
        return analytics

    async def bulk_create(self, analytics_list: list[PostAnalytics]) -> list[PostAnalytics]:
        """Persist multiple PostAnalytics records at once."""
        self.session.add_all(analytics_list)
        await self.session.flush()
        for item in analytics_list:
            await self.session.refresh(item)
        return analytics_list

    # ------------------------------------------------------------------ #
    #  READ — single record                                                #
    # ------------------------------------------------------------------ #

    async def get_by_id(self, analytics_id: UUID) -> Optional[PostAnalytics]:
        """Return a single record by primary key, or None."""
        result = await self.session.execute(
            select(PostAnalytics).where(PostAnalytics.id == analytics_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_for_post(self, published_post_id: UUID) -> Optional[PostAnalytics]:
        """Return the most recent analytics snapshot for a given post."""
        result = await self.session.execute(
            select(PostAnalytics)
            .where(PostAnalytics.published_post_id == published_post_id)
            .order_by(PostAnalytics.mesured_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    # ------------------------------------------------------------------ #
    #  READ — collections                                                  #
    # ------------------------------------------------------------------ #

    async def get_all_for_post(
        self,
        published_post_id: UUID,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[PostAnalytics]:
        """Return all analytics snapshots for a post, newest first."""
        result = await self.session.execute(
            select(PostAnalytics)
            .where(PostAnalytics.published_post_id == published_post_id)
            .order_by(PostAnalytics.mesured_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_by_date_range(
        self,
        published_post_id: UUID,
        start: datetime,
        end: datetime,
    ) -> list[PostAnalytics]:
        """Return analytics snapshots measured within [start, end] for a post."""
        result = await self.session.execute(
            select(PostAnalytics)
            .where(
                and_(
                    PostAnalytics.published_post_id == published_post_id,
                    between(PostAnalytics.mesured_at, start, end),
                )
            )
            .order_by(PostAnalytics.mesured_at.asc())
        )
        return list(result.scalars().all())

    async def get_top_posts_by_reach(
        self,
        post_ids: list[UUID],
        *,
        limit: int = 10,
    ) -> list[PostAnalytics]:
        """
        For each post in *post_ids*, grab its latest snapshot and return
        the top-N ordered by reach descending.
        """
        # Subquery: latest mesured_at per post
        sub = (
            select(
                PostAnalytics.published_post_id,
                func.max(PostAnalytics.mesured_at).label("latest"),
            )
            .where(PostAnalytics.published_post_id.in_(post_ids))
            .group_by(PostAnalytics.published_post_id)
            .subquery()
        )

        result = await self.session.execute(
            select(PostAnalytics)
            .join(
                sub,
                and_(
                    PostAnalytics.published_post_id == sub.c.published_post_id,
                    PostAnalytics.mesured_at == sub.c.latest,
                ),
            )
            .order_by(PostAnalytics.reach.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------ #
    #  AGGREGATES                                                          #
    # ------------------------------------------------------------------ #

    async def get_totals_for_post(self, published_post_id: UUID) -> dict:
        """
        Return summed metrics (reach, impressions, comments, shares, clicks)
        across all snapshots for a post.
        """
        result = await self.session.execute(
            select(
                func.sum(PostAnalytics.reach).label("total_reach"),
                func.sum(PostAnalytics.impressions).label("total_impressions"),
                func.sum(PostAnalytics.comments).label("total_comments"),
                func.sum(PostAnalytics.shares).label("total_shares"),
                func.sum(PostAnalytics.clicks).label("total_clicks"),
                func.count(PostAnalytics.id).label("snapshot_count"),
            ).where(PostAnalytics.published_post_id == published_post_id)
        )
        row = result.one()
        return {
            "total_reach": row.total_reach or 0,
            "total_impressions": row.total_impressions or 0,
            "total_comments": row.total_comments or 0,
            "total_shares": row.total_shares or 0,
            "total_clicks": row.total_clicks or 0,
            "snapshot_count": row.snapshot_count or 0,
        }

    async def count_snapshots_for_post(self, published_post_id: UUID) -> int:
        """Return the total number of analytics snapshots for a given post."""
        result = await self.session.execute(
            select(func.count(PostAnalytics.id)).where(
                PostAnalytics.published_post_id == published_post_id
            )
        )
        return result.scalar_one()

    # ------------------------------------------------------------------ #
    #  UPDATE                                                              #
    # ------------------------------------------------------------------ #

    async def update(self, analytics: PostAnalytics, **fields) -> PostAnalytics:
        """
        Apply *fields* to an existing record and flush.

        Example:
            await repo.update(record, reach=5000, impressions=12000)
        """
        for key, value in fields.items():
            setattr(analytics, key, value)
        analytics.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(analytics)
        return analytics

    # ------------------------------------------------------------------ #
    #  DELETE                                                              #
    # ------------------------------------------------------------------ #

    async def delete(self, analytics: PostAnalytics) -> None:
        """Delete a single analytics record."""
        await self.session.delete(analytics)
        await self.session.flush()

    async def delete_all_for_post(self, published_post_id: UUID) -> int:
        """
        Delete every analytics snapshot tied to *published_post_id*.
        Returns the number of deleted rows.
        """
        rows = await self.get_all_for_post(published_post_id, limit=10_000)
        count = len(rows)
        for row in rows:
            await self.session.delete(row)
        await self.session.flush()
        return count