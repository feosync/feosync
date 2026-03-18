from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate, ScheduledPostResponse,
    CaptionPatchRequest, CaptionPatchResponse,
    ImagePatchRequest, ImagePatchResponse,
    ConfirmRequest,
)
from app.modules.scheduled_post.service import ScheduledPostService

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
    response_model=list[ScheduledPostResponse],
    summary="Tous les posts d'une organisation",
)
def get_by_org(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.get_by_org(db, org_id, current_user)


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
    return ScheduledPostService.get_by_id(db, post_id, current_user)


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


# ── PATCH image ───────────────────────────────────────────────────────────────

@scheduled_post_router.patch(
    "/{post_id}/image",
    response_model=ImagePatchResponse,
    summary="Modifier l'image (URL ou LLM)",
)
async def patch_image(
    post_id: UUID,
    payload: ImagePatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await ScheduledPostService.patch_image(db, post_id, payload, current_user)


@scheduled_post_router.patch(
    "/{post_id}/image/upload",
    response_model=ImagePatchResponse,
    summary="Upload une image (multipart)",
)
async def patch_image_upload(
    post_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await ScheduledPostService.patch_image_upload(db, post_id, file, current_user)


# ── PATCH confirm ─────────────────────────────────────────────────────────────

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
    """
    Valide le post.
    Vérifie que caption est présent.
    """
    return ScheduledPostService.confirm(db, post_id, payload, current_user)


# ── DELETE ────────────────────────────────────────────────────────────────────

@scheduled_post_router.delete(
    "/{post_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer un post (annule la task Celery si SCHEDULED)",
)
def delete(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.delete(db, post_id, current_user)
