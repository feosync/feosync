from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate, ScheduledPostResponse,
    CaptionPatchRequest, CaptionPatchResponse,
    ImagePatchRequest, AddImageResponse,
    ReorderRequest, ConfirmRequest,
)
from app.modules.scheduled_post.service import ScheduledPostService
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus
from app.shared.pagination.paginator import Pagination, PaginatedResponse

scheduled_post_router = APIRouter()


# ── CREATE ────────────────────────────────────────────────────────────────────

@scheduled_post_router.post(
    "/",
    response_model=ScheduledPostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un post (DRAFT)",
)
def create(
    payload: ScheduledPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.create(db, payload, current_user)


# ── READ ──────────────────────────────────────────────────────────────────────

@scheduled_post_router.get(
    "/org/{org_id}",
    response_model=PaginatedResponse[ScheduledPostResponse],
    summary="Posts d'une organisation (filtrés + paginés)",
)
def get_by_org(
    org_id: UUID,
    params: Pagination ,
    status: PostStatus | None = Query(None),
    search: str | None = Query(None),
    year: int | None = Query(None),
    month: int | None = Query(None),
    week: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    posts, total = ScheduledPostService.get_by_org(
        db, org_id, current_user, params,
        status=status, search=search,
        year=year, month=month, week=week,
    )
    items = [ScheduledPostService._build_post_response(p) for p in posts]
    return PaginatedResponse.build(items, total, params)


@scheduled_post_router.get(
    "/{post_id}",
    response_model=ScheduledPostResponse,
    summary="Détail d'un post",
)
def get_by_id(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    post = ScheduledPostService.get_by_id(db, post_id, current_user)
    return ScheduledPostService._build_post_response(post)


# ── PATCH caption ─────────────────────────────────────────────────────────────

@scheduled_post_router.patch(
    "/{post_id}/caption",
    response_model=CaptionPatchResponse,
    summary="Modifier le caption (manuel ou LLM)",
)
async def patch_caption(
    post_id: UUID,
    payload: CaptionPatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await ScheduledPostService.patch_caption(db, post_id, payload, current_user)


# ── IMAGES ────────────────────────────────────────────────────────────────────

@scheduled_post_router.post(
    "/{post_id}/images",
    response_model=AddImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une image (url ou llm)",
)
async def add_image(
    post_id: UUID,
    payload: ImagePatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await ScheduledPostService.add_image(db, post_id, payload, current_user)


@scheduled_post_router.post(
    "/{post_id}/images/upload",
    response_model=AddImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une image par upload (multipart)",
)
async def add_image_upload(
    post_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await ScheduledPostService.add_image_upload(db, post_id, file, current_user)


@scheduled_post_router.delete(
    "/{post_id}/images/{image_id}",
    response_model=ScheduledPostResponse,
    summary="Supprimer une image du post",
)
def remove_image(
    post_id: UUID,
    image_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.remove_image(db, post_id, image_id, current_user)


@scheduled_post_router.patch(
    "/{post_id}/images/reorder",
    response_model=ScheduledPostResponse,
    summary="Réordonner les images (carrousel)",
)
def reorder_images(
    post_id: UUID,
    payload: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.reorder_images(db, post_id, payload, current_user)


# ── CONFIRM ───────────────────────────────────────────────────────────────────

@scheduled_post_router.patch(
    "/{post_id}/confirm",
    response_model=ScheduledPostResponse,
    summary="Confirmer la planification (DRAFT → SCHEDULED)",
)
def confirm(
    post_id: UUID,
    payload: ConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    post = ScheduledPostService.confirm(db, post_id, payload, current_user)
    return ScheduledPostService._build_post_response(post)


# ── DELETE ────────────────────────────────────────────────────────────────────

@scheduled_post_router.delete(
    "/{post_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer un post",
)
def delete(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.delete(db, post_id, current_user)