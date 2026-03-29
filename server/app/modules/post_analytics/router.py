from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User

from .schemas import PostAnalyticsCreate, PostAnalyticsResponse, PageAnalysisResponse, PostsWithReactionsResponse
from .service import PostAnalyticsService

post_analytics_router = APIRouter()


# ── CREATE ────────────────────────────────────────────────────────────────────

@post_analytics_router.post(
    "/",
    response_model=PostAnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un snapshot analytics",
)
def create_analytics(
    payload: PostAnalyticsCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> PostAnalyticsResponse:
    return PostAnalyticsService().create(db=db, data=payload)


# ── READ — snapshots DB ───────────────────────────────────────────────────────

@post_analytics_router.get(
    "/org/{organisation_id}",
    response_model=list[PostAnalyticsResponse],
    summary="Dernier snapshot par published_post pour une organisation",
)
def get_latest_by_org(
    organisation_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> list[PostAnalyticsResponse]:
    return PostAnalyticsService().get_latest_analytics_by_org(
        db=db, organisation_id=organisation_id
    )


@post_analytics_router.get(
    "/published/{published_id}",
    response_model=list[PostAnalyticsResponse],
    summary="Tous les snapshots d'un published_post",
)
def get_by_published(
    published_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> list[PostAnalyticsResponse]:
    return PostAnalyticsService().get_by_published(db=db, published_id=published_id)


# ── READ — Meta Live ──────────────────────────────────────────────────────────

@post_analytics_router.get(
    "/page/{fb_model_id}/analysis",
    response_model=PageAnalysisResponse,
    summary="Analyse complète d'une page (métriques Meta agrégées en temps réel)",
)
async def get_page_analysis(
    fb_model_id: UUID,
    org_id: UUID,
    period: str = Query(
        default="week",
        pattern="^(day|week|days_28)$",
        description="Fenêtre temporelle : day | week | days_28",
    ),
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> PageAnalysisResponse:
    return await PostAnalyticsService().get_page_analysis(
        fb_model_id=fb_model_id, org_id=org_id, db=db, period=period,
    )


@post_analytics_router.get(
    "/page/{fb_model_id}/posts",
    response_model=PostsWithReactionsResponse,
    summary="Posts de la page avec réactions (curseur Meta)",
)
async def get_posts_with_reactions(
    fb_model_id: UUID,
    org_id: UUID,
    limit: int = Query(default=10, ge=1, le=50),
    after: str | None = Query(default=None, description="Curseur Meta pour page suivante"),
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> PostsWithReactionsResponse:
    return await PostAnalyticsService().get_posts_with_reactions(
        fb_model_id=fb_model_id, org_id=org_id, db=db, limit=limit, after=after,
    )


# ── READ — par ID ─────────────────────────────────────────────────────────────

@post_analytics_router.get(
    "/{analytics_id}",
    response_model=PostAnalyticsResponse,
    summary="Snapshot analytics par ID",
)
def get_by_id(
    analytics_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user),
) -> PostAnalyticsResponse:
    return PostAnalyticsService().get_by_id(db=db, analytics_id=analytics_id)