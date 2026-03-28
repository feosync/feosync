from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User

from .schemas.schema import (
    PageInsightsResponse,
    PostAnalyticsCreate,
    PostAnalyticsResponse,
)
from .schemas.engagement import PagePostEngagementsResponse
from .schemas.follows import PageFollowsResponse
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
    user:User=Depends(get_active_user)
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
    user:User=Depends(get_active_user)

) -> list[PostAnalyticsResponse]:
    service = PostAnalyticsService()
    return service.get_by_published(db=db, published_id=published_id)


@post_analytics_router.get("/page/{fb_model_id}/posts-reactions")
async def get_posts_reactions(
    fb_model_id: UUID,
    org_id: UUID,
    limit: int = Query(default=10, ge=1, le=50),
    after: str | None = Query(default=None),   # ✅ curseur optionnel
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user)
):
    service = PostAnalyticsService()
    return await service.get_all_posts_with_reactions(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db,
        limit=limit,
        after=after
    )
    
# 🔥 Réactions
@post_analytics_router.get("/reaction/{fb_model_id}", response_model=PageInsightsResponse)
async def get_page_actions_post_reactions_total(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    """
    Total par jour et par type des réactions sur une page.
    """
    service = PostAnalyticsService()
    return await service.get_page_actions_post_reactions_total(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db
    )


# 📊 Engagements
@post_analytics_router.get("/engagement/{fb_model_id}",response_model=PagePostEngagementsResponse)
async def get_page_post_engagements(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    """
    Nombre d'interactions (likes, commentaires, partages, etc.)
    """
    service = PostAnalyticsService()
    return await service.get_page_post_engagements(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db
    )


# 👀 Vues
@post_analytics_router.get("/views/{fb_model_id}", response_model=PagePostEngagementsResponse)
async def get_page_views_total(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    """
    Nombre total de vues de la page.
    """
    service = PostAnalyticsService()
    return await service.get_page_views_total(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db
    )


# ➕ Followers
@post_analytics_router.get("/follows/{fb_model_id}", response_model=PageFollowsResponse)
async def get_page_follows(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    """
    Nombre de nouveaux abonnés.
    """
    service = PostAnalyticsService()
    return await service.get_page_follows(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db
    )


# ➖ Unfollows
@post_analytics_router.get("/unfollows/{fb_model_id}", response_model=PageFollowsResponse)
async def get_page_daily_unfollows_unique(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    """
    Nombre de désabonnements par jour.
    """
    service = PostAnalyticsService()
    return await service.get_page_daily_unfollows_unique(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db
    )

@post_analytics_router.get(
    "/page/{fb_model_id}/full",
    summary="Toutes les métriques d'une page en une requête",
    description="Appels Meta en parallèle — réactions, engagements, vues, follows, unfollows",
)
async def get_full_analytics(
    fb_model_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
):
    service = PostAnalyticsService()
    return await service.get_full_page_analytics(
        fb_model_id=fb_model_id,
        org_id=org_id,
        db=db,
    )


@post_analytics_router.get(
    "/{analytics_id}",                        
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a snapshot by ID",
)
def get_analytics_by_id(
    analytics_id: UUID,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

) -> PostAnalyticsResponse:
    service = PostAnalyticsService()
    return service.get_by_id(db=db, analytics_id=analytics_id)
