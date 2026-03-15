from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
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
from .service import PostAnalyticsService

post_analytics_router = APIRouter()


# ------------------------------------------------------------------ #
#  Dependency                                                          #
# ------------------------------------------------------------------ #

async def get_service(session: AsyncSession = Depends(get_db)) -> PostAnalyticsService:
    return PostAnalyticsService(PostAnalyticsRepository(session))


# ------------------------------------------------------------------ #
#  CREATE                                                              #
# ------------------------------------------------------------------ #

@post_analytics_router.post(
    "/",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a single analytics snapshot",
)
async def create_analytics(
    payload: PostAnalyticsCreate,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsResponse:
    return await service.create(payload)


@post_analytics_router.post(
    "/bulk",
    response_model=PostAnalyticsBulkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create multiple analytics snapshots at once",
)
async def bulk_create_analytics(
    payload: PostAnalyticsBulkCreate,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsBulkResponse:
    return await service.bulk_create(payload)


# ------------------------------------------------------------------ #
#  READ — single record                                                #
# ------------------------------------------------------------------ #

@post_analytics_router.get(
    "/{analytics_id}",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a snapshot by ID",
)
async def get_analytics_by_id(
    analytics_id: UUID,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsResponse:
    return await service.get_by_id(analytics_id)


@post_analytics_router.get(
    "/posts/{published_post_id}/latest",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get the most recent snapshot for a post",
)
async def get_latest_for_post(
    published_post_id: UUID,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsResponse:
    return await service.get_latest_for_post(published_post_id)


# ------------------------------------------------------------------ #
#  READ — collections                                                  #
# ------------------------------------------------------------------ #

@post_analytics_router.get(
    "/posts/{published_post_id}",
    response_model=PostAnalyticsPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="List all snapshots for a post (paginated)",
)
async def get_all_for_post(
    published_post_id: UUID,
    limit: int = Query(100, ge=1, le=500, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsPaginatedResponse:
    return await service.get_all_for_post(published_post_id, limit=limit, offset=offset)


@post_analytics_router.get(
    "/posts/{published_post_id}/range",
    response_model=list[PostAnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get snapshots for a post within a date range",
)
async def get_by_date_range(
    published_post_id: UUID,
    start: datetime = Query(..., description="Start datetime (ISO 8601)"),
    end: datetime = Query(..., description="End datetime (ISO 8601)"),
    service: PostAnalyticsService = Depends(get_service),
) -> list[PostAnalyticsResponse]:
    return await service.get_by_date_range(published_post_id, start, end)


@post_analytics_router.post(
    "/posts/top-by-reach",
    response_model=list[PostAnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get top-N posts by reach from a list of post IDs",
)
async def get_top_posts_by_reach(
    post_ids: list[UUID],
    limit: int = Query(10, ge=1, le=100, description="Max number of posts to return"),
    service: PostAnalyticsService = Depends(get_service),
) -> list[PostAnalyticsResponse]:
    return await service.get_top_posts_by_reach(post_ids, limit=limit)


# ------------------------------------------------------------------ #
#  AGGREGATES                                                          #
# ------------------------------------------------------------------ #

@post_analytics_router.get(
    "/posts/{published_post_id}/totals",
    response_model=PostAnalyticsTotalsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get aggregated metric totals for a post",
)
async def get_totals_for_post(
    published_post_id: UUID,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsTotalsResponse:
    return await service.get_totals_for_post(published_post_id)


# ------------------------------------------------------------------ #
#  UPDATE                                                              #
# ------------------------------------------------------------------ #

@post_analytics_router.patch(
    "/{analytics_id}",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update an analytics snapshot",
)
async def update_analytics(
    analytics_id: UUID,
    payload: PostAnalyticsUpdate,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsResponse:
    return await service.update(analytics_id, payload)


# ------------------------------------------------------------------ #
#  DELETE                                                              #
# ------------------------------------------------------------------ #

@post_analytics_router.delete(
    "/{analytics_id}",
    response_model=PostAnalyticsDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a single analytics snapshot",
)
async def delete_analytics(
    analytics_id: UUID,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsDeleteResponse:
    return await service.delete(analytics_id)


@post_analytics_router.delete(
    "/posts/{published_post_id}",
    response_model=PostAnalyticsDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete all analytics snapshots for a post",
)
async def delete_all_for_post(
    published_post_id: UUID,
    service: PostAnalyticsService = Depends(get_service),
) -> PostAnalyticsDeleteResponse:
    return await service.delete_all_for_post(published_post_id)