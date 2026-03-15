from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db

from .schema import (
    PostAnalyticsCreate,
    PostAnalyticsResponse,
)
from .service import PostAnalyticsService

post_analytics_router = APIRouter()


# ------------------------------------------------------------------ #
#  Dependency                                                          #
# ------------------------------------------------------------------ #



# ------------------------------------------------------------------ #
#  CREATE                                                              #
# ------------------------------------------------------------------ #

@post_analytics_router.post(
    "/",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a single analytics snapshot",
)
def create_analytics(
    payload: PostAnalyticsCreate,
    db:Session=Depends(get_db),
) -> PostAnalyticsResponse:
    service = PostAnalyticsService()
    return  service.create(db=db, post_analytics_create=payload )


# ------------------------------------------------------------------ #
#  READ — single record                                                #
# ------------------------------------------------------------------ #

@post_analytics_router.get(
    "/{analytics_id}",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a snapshot by ID",
)
def get_analytics_by_id(
    analytics_id: UUID,
    db: Session = Depends(get_db),
) -> PostAnalyticsResponse:
    service = PostAnalyticsService()
    return service.get_by_id(db=db, analytics_id=analytics_id)

@post_analytics_router.get("/published/{published_id}")
def get_by_published(published_id:UUID, db:Session=Depends(get_db))->list[PostAnalyticsResponse]:
    service = PostAnalyticsService()
    return service.get_by_published(db=db,published_id=published_id)