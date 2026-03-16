from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User

from .schema import (
    PostAnalyticsCreate,
    PostAnalyticsResponse,
)
from .service import PostAnalyticsService

post_analytics_router = APIRouter()



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
    db: Session = Depends(get_db),
) -> PostAnalyticsResponse:
    service = PostAnalyticsService()
    return service.create(db=db, post_analytics_create=payload)


# ------------------------------------------------------------------ #
#  READ — routes statiques AVANT les routes dynamiques                #
# ------------------------------------------------------------------ #

@post_analytics_router.get(
    "/all_post/{organisation_id}", 
    response_model=list[PostAnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get latest snapshot per published post for an organisation",
)
async def get_analyse_for_published_post_by_organisation(
    organisation_id: UUID,
    db: Session = Depends(get_db),
    user:User= Depends(get_active_user)
) -> list[PostAnalyticsResponse]:
    service = PostAnalyticsService()
    return await service.get_single_analyse_by_published_post(db=db, organisation_id=organisation_id)


@post_analytics_router.get(
    "/published/{published_id}",              # ✅ dynamique → après
    response_model=list[PostAnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all snapshots for a published post",
)
def get_by_published(
    published_id: UUID,
    db: Session = Depends(get_db),
) -> list[PostAnalyticsResponse]:
    service = PostAnalyticsService()
    return service.get_by_published(db=db, published_id=published_id)


@post_analytics_router.get(
    "/{analytics_id}",                        # ✅ dynamique générique → en dernier
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