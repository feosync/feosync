from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate,
    ScheduledPostUpdate,
    ScheduledPostResponse,
    ScheduledPostAiPatchRequest,
    ScheduledPostAiPatchResponse,
)
from app.modules.scheduled_post.service import ScheduledPostService

scheduled_post_router = APIRouter()


@scheduled_post_router.post(
    "/",
    response_model=ScheduledPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    payload: ScheduledPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.create(db, payload)


@scheduled_post_router.get(
    "/org/{org_id}",
    response_model=list[ScheduledPostResponse],
)
def get_by_org(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.get_by_org(db, org_id)


@scheduled_post_router.get(
    "/{post_id}",
    response_model=ScheduledPostResponse,
)
def get_by_id(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.get_by_id(db, post_id)


@scheduled_post_router.patch(
    "/{post_id}",
    response_model=ScheduledPostResponse,
)
def update(
    post_id: UUID,
    payload: ScheduledPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.update(db, post_id, payload)


@scheduled_post_router.patch(
    "/{post_id}/ai-suggest",
    response_model=ScheduledPostAiPatchResponse,
    summary="Générer caption/image IA et mettre à jour le post",
)
async def ai_suggest(
    post_id: UUID,
    payload: ScheduledPostAiPatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Génère caption et/ou image via Gemini
    et met à jour directement le ScheduledPost.

    generate_caption=true → nouveau caption injecté
    generate_image=true   → nouvelle image IA + lien dans ScheduledPostAiImage
    """
    return await ScheduledPostService.apply_ai_suggestion(
        db=db,
        post_id=post_id,
        payload=payload,
        current_user=current_user,
    )


@scheduled_post_router.delete(
    "/{post_id}",
    status_code=status.HTTP_200_OK,
)
def delete(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return ScheduledPostService.delete(db, post_id)
