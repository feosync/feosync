from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.user.model import User
from app.modules.auth.dependencies import get_active_user
from uuid import UUID

from .schemas.scheduled_post_schema import (
    ScheduledPostCreate,
    ScheduledPostUpdate,
    ScheduledPostResponse,
)
from .services.scheduled_post_service import ScheduledPostService
from .services.update_by_service import AiUpdateService as ai_update_service

scheduled_post_router = APIRouter()

# ─── STATIC ROUTES FIRST ─────────────────────────────────────────────────────

@scheduled_post_router.post("/", response_model=ScheduledPostResponse, status_code=201)
def create_scheduled_post(
    scheduled_create: ScheduledPostCreate,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)
):
    return ScheduledPostService.create(db=db, scheduled_create=scheduled_create)


@scheduled_post_router.get("/detail/{scheduled_id}", response_model=ScheduledPostResponse)
def get_scheduled_post(scheduled_id: UUID, db: Session = Depends(get_db), user:User=Depends(get_active_user)):
    return ScheduledPostService.get_by_id(db=db, scheduled_id=scheduled_id)


@scheduled_post_router.patch("/update-caption", response_model=ScheduledPostResponse)
async def update_caption(
    scheduled_id: UUID = Query(...),
    prompt: str = Query(...),
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)

):
    return await ai_update_service.update_caption(
        db=db, scheduled_id=scheduled_id, prompt=prompt
    )


@scheduled_post_router.patch("/{scheduled_id}", response_model=ScheduledPostResponse)
def update_scheduled_post(
    scheduled_id: UUID,
    body: ScheduledPostUpdate,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)
):
    return ScheduledPostService.update(
        db=db, scheduled_id=scheduled_id, data=body.model_dump(exclude_unset=True)
    )


@scheduled_post_router.delete("/{scheduled_id}", status_code=204)
def delete_scheduled_post(scheduled_id: UUID, db: Session = Depends(get_db),user:User=Depends(get_active_user)
):
    return ScheduledPostService.delete(db=db, scheduled_id=scheduled_id)