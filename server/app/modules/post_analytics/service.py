from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status

from .model import PostAnalytics
from .repository import PostAnalyticsRepository
from .schema import (
    PostAnalyticsBulkCreate,
    PostAnalyticsBulkResponse,
    PostAnalyticsCreate,
    PostAnalyticsDeleteResponse,
    PostAnalyticsPaginatedResponse,
    PostAnalyticsResponse,
    PostAnalyticsTotalsResponse,
    PostAnalyticsUpdate,
)


class PostAnalyticsService:
    """Business-logic layer for PostAnalytics."""

    def __init__(self, repository: PostAnalyticsRepository) -> None:
        self.repo = repository

    # ------------------------------------------------------------------ #
    #  Internal helper                                                     #
    # ------------------------------------------------------------------ #

    async def _get_or_404(self, analytics_id: UUID) -> PostAnalytics:
        record = await self.repo.get_by_id(analytics_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PostAnalytics '{analytics_id}' not found.",
            )
        return record

    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #

    async def create(self, payload: PostAnalyticsCreate) -> PostAnalyticsResponse:
        """Create a single analytics snapshot."""
        record = PostAnalytics(**payload.model_dump())
        saved = await self.repo.create(record)
        return PostAnalyticsResponse.model_validate(saved)

    async def bulk_create(
        self, payload: PostAnalyticsBulkCreate
    ) -> PostAnalyticsBulkResponse:
        """Create multiple analytics snapshots in one shot."""
        records = [PostAnalytics(**item.model_dump()) for item in payload.items]
        saved = await self.repo.bulk_create(records)
        return PostAnalyticsBulkResponse(
            created_count=len(saved),
            items=[PostAnalyticsResponse.model_validate(r) for r in saved],
        )

    # ------------------------------------------------------------------ #
    #  READ — single record                                                #
    # ------------------------------------------------------------------ #

    async def get_by_id(self, analytics_id: UUID) -> PostAnalyticsResponse:
        """Return a snapshot by its ID or raise 404."""
        record = await self._get_or_404(analytics_id)
        return PostAnalyticsResponse.model_validate(record)

    async def get_latest_for_post(
        self, published_post_id: UUID
    ) -> PostAnalyticsResponse:
        """Return the most recent snapshot for a post or raise 404."""
        record = await self.repo.get_latest_for_post(published_post_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No analytics found for post '{published_post_id}'.",
            )
        return PostAnalyticsResponse.model_validate(record)

    # ------------------------------------------------------------------ #
    #  READ — collections                                                  #
    # ------------------------------------------------------------------ #

    async def get_all_for_post(
        self,
        published_post_id: UUID,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> PostAnalyticsPaginatedResponse:
        """Return a paginated list of snapshots for a post."""
        records = await self.repo.get_all_for_post(
            published_post_id, limit=limit, offset=offset
        )
        total = await self.repo.count_snapshots_for_post(published_post_id)
        return PostAnalyticsPaginatedResponse(
            total=total,
            limit=limit,
            offset=offset,
            items=[PostAnalyticsResponse.model_validate(r) for r in records],
        )

    async def get_by_date_range(
        self,
        published_post_id: UUID,
        start: datetime,
        end: datetime,
    ) -> list[PostAnalyticsResponse]:
        """Return snapshots measured between *start* and *end*."""
        if start > end:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="'start' must be before 'end'.",
            )
        records = await self.repo.get_by_date_range(published_post_id, start, end)
        return [PostAnalyticsResponse.model_validate(r) for r in records]

    async def get_top_posts_by_reach(
        self,
        post_ids: list[UUID],
        *,
        limit: int = 10,
    ) -> list[PostAnalyticsResponse]:
        """Return the top-N latest snapshots ordered by reach descending."""
        if not post_ids:
            return []
        records = await self.repo.get_top_posts_by_reach(post_ids, limit=limit)
        return [PostAnalyticsResponse.model_validate(r) for r in records]

    # ------------------------------------------------------------------ #
    #  AGGREGATES                                                          #
    # ------------------------------------------------------------------ #

    async def get_totals_for_post(
        self, published_post_id: UUID
    ) -> PostAnalyticsTotalsResponse:
        """Return summed metrics across all snapshots for a post."""
        totals = await self.repo.get_totals_for_post(published_post_id)
        return PostAnalyticsTotalsResponse(
            published_post_id=published_post_id,
            **totals,
        )

    # ------------------------------------------------------------------ #
    #  UPDATE                                                              #
    # ------------------------------------------------------------------ #

    async def update(
        self, analytics_id: UUID, payload: PostAnalyticsUpdate
    ) -> PostAnalyticsResponse:
        """Partially update an existing snapshot (PATCH semantics)."""
        record = await self._get_or_404(analytics_id)
        updated = await self.repo.update(record, **payload.to_update_dict())
        return PostAnalyticsResponse.model_validate(updated)

    # ------------------------------------------------------------------ #
    #  DELETE                                                              #
    # ------------------------------------------------------------------ #

    async def delete(self, analytics_id: UUID) -> PostAnalyticsDeleteResponse:
        """Delete a single snapshot by ID."""
        record = await self._get_or_404(analytics_id)
        await self.repo.delete(record)
        return PostAnalyticsDeleteResponse(deleted_count=1)

    async def delete_all_for_post(
        self, published_post_id: UUID
    ) -> PostAnalyticsDeleteResponse:
        """Delete every snapshot tied to a post."""
        count = await self.repo.delete_all_for_post(published_post_id)
        return PostAnalyticsDeleteResponse(
            deleted_count=count,
            message=f"{count} analytics record(s) deleted for post '{published_post_id}'.",
        )