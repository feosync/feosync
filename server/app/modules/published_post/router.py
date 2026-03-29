from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.published_post.schemas import (
    PublishedPostResponse,
    ManualPublishRequest,
)
from app.modules.published_post.service import PublishedPostService

from app.shared.pagination.paginator import Pagination, PaginatedResponse


published_post_router = APIRouter()


# ── Lecture ───────────────────────────────────────────────────────────────────

@published_post_router.get(
    "/org/{org_id}",
    response_model=PaginatedResponse[PublishedPostResponse],
    summary="Posts publiés d'une organisation (filtrés + paginés)",
)

@published_post_router.get("/post/{post_id}", response_model=PublishedPostResponse, summary="Détail d'un post publié")
async def get_published_post(
    post_id: str,
    db: Session = Depends(get_db),
):
    return PublishedPostService.get_by_post_id(db, post_id)

async def get_published_posts(
    org_id: UUID,
    params: Pagination,
    search: str | None = Query(None, description="Recherche sur post_id ou channel"),
    year: int | None = Query(None, description="Filtrer par année"),
    month: int | None = Query(None, description="Filtrer par mois"),
    week: int | None = Query(None, description="Filtrer par semaine ISO"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    posts, total = PublishedPostService.get_all_by_org(
        db, org_id, params,
        search=search, year=year, month=month, week=week,
    )
    items = [PublishedPostResponse.model_validate(p) for p in posts]
    return PaginatedResponse.build(items, total, params)


@published_post_router.get(
    "/page/{facebook_page_id}",
    response_model=list[PublishedPostResponse],
    summary="Posts publiés sur une page Facebook",
)
async def get_posts_by_page(
    facebook_page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PublishedPostService.get_by_page(db, facebook_page_id, org_id)


@published_post_router.get(
    "/{post_id}",
    response_model=PublishedPostResponse,
    summary="Détail d'un post publié",
)
async def get_published_post(
    post_id_model: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PublishedPostService.get_by_id(db, post_id_model)


# ── Publication ───────────────────────────────────────────────────────────────

@published_post_router.post(
    "/publish",
    response_model=PublishedPostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publication manuelle d'un scheduled post",
)
async def publish_post(
    payload: ManualPublishRequest,
    background_tasks: BackgroundTasks ,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Publie immédiatement un ScheduledPost sur Facebook.
    Normalement appelé par le scheduler — mais disponible manuellement pour les tests.
    """
    return await PublishedPostService.publish_to_facebook(
        db,
        payload.scheduled_post_id,
        background_tasks=background_tasks,    
        user_id=current_user.id,              
        user_email=current_user.email,    
    )


@published_post_router.post(
    "/{post_id}/sync-metrics",
    response_model=PublishedPostResponse,
    summary="Synchroniser les métriques initiales depuis Meta",
)
async def sync_metrics(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Récupère reach et impressions initiaux depuis Meta API"""
    return await PublishedPostService.sync_initial_metrics(db, post_id)


@published_post_router.delete(
    "/{post_id}",
    summary="Supprimer un post publié (local uniquement)",
)
async def delete_published_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Supprime le record local — ne supprime PAS le post sur Facebook"""
    return PublishedPostService.delete(db, post_id)