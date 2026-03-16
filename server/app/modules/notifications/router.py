from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.notifications.schemas import (
    NotificationResponse,
    NotificationSummary,
)
from app.modules.notifications.service import NotificationService

notif_router = APIRouter()


@notif_router.get(
    "/",
    response_model=list[NotificationResponse],
    summary="Toutes les notifications de l'user",
)
async def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return NotificationService.get_all(db, current_user.id, unread_only)


@notif_router.get(
    "/summary",
    response_model=NotificationSummary,
    summary="Nombre total et non lues",
)
async def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return NotificationService.get_summary(db, current_user.id)


@notif_router.patch(
    "/{notif_id}/read",
    response_model=NotificationResponse,
    summary="Marquer une notification comme lue",
)
async def mark_read(
    notif_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return NotificationService.mark_as_read(db, notif_id, current_user.id)


@notif_router.patch(
    "/read-all",
    summary="Marquer toutes les notifications comme lues",
)
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return NotificationService.mark_all_read(db, current_user.id)


@notif_router.delete(
    "/{notif_id}",
    summary="Supprimer une notification",
)
async def delete_notification(
    notif_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return NotificationService.delete(db, notif_id, current_user.id)