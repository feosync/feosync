from uuid import UUID
from fastapi import BackgroundTasks
from fastapi_mail import MessageSchema, MessageType
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.mail import fastmail
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.model import (
    Notification, NotificationType, NotificationChannel
)


# ── Templates email par type ──────────────────────────────────────────────────
EMAIL_TEMPLATES = {
    NotificationType.POST_PUBLISHED:   ("post_published.html",   "✅ Post publié avec succès"),
    NotificationType.POST_FAILED:      ("post_failed.html",       "❌ Échec de publication"),
    NotificationType.WELCOME:          ("welcome.html",           "👋 Bienvenue sur FeoSync"),
    NotificationType.TOKEN_EXPIRING:   ("token_expiring.html",    "⚠️ Token Facebook expirant"),
    NotificationType.INSIGHTS_UPDATED: ("insights_updated.html",  "📊 Insights mis à jour"),
    NotificationType.SCHEDULE_CREATED: ("schedule_created.html",  "📅 Schedule créé"),
}


async def _send_email(
    to_email: str,
    subject: str,
    template_name: str,
    template_body: dict,
) -> None:
    """Fonction email async — appelée par BackgroundTasks"""
    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        template_body=template_body,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message, template_name=template_name)


class NotificationService:

    @staticmethod
    def create(
        db: Session,
        background_tasks: BackgroundTasks,
        user_id: UUID,
        title: str,
        message: str,
        type: NotificationType,
        channel: NotificationChannel = NotificationChannel.BOTH,
        user_email: str | None = None,
        template_body: dict | None = None,
    ) -> Notification:
        """
        Crée une notification selon le channel :
        - IN_APP  → sauvegarde en DB uniquement
        - EMAIL   → envoie email uniquement (pas en DB)
        - BOTH    → sauvegarde en DB + envoie email
        """
        notif = None

        # ── In-App ────────────────────────────────────────────────────────────
        if channel in (NotificationChannel.IN_APP, NotificationChannel.BOTH):
            notif = NotificationRepository.create(db, {
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": type,
                "channel": channel,
                "is_read": False,
                "email_sent": False,
            })

        # ── Email (BackgroundTask — non bloquant) ─────────────────────────────
        if channel in (NotificationChannel.EMAIL, NotificationChannel.BOTH):
            if user_email and type in EMAIL_TEMPLATES:
                template_name, subject = EMAIL_TEMPLATES[type]
                background_tasks.add_task(
                    _send_email,
                    to_email=user_email,
                    subject=subject,
                    template_name=template_name,
                    template_body=template_body or {
                        "title": title,
                        "message": message,
                    },
                )
                # Marque email_sent si notif in-app existe aussi
                if notif:
                    NotificationRepository.mark_email_sent(db, notif.id)

        return notif

    @staticmethod
    def get_all(
        db: Session,
        user_id: UUID,
        unread_only: bool = False
    ) -> list[Notification]:
        return NotificationRepository.get_by_user(db, user_id, unread_only)

    @staticmethod
    def get_summary(db: Session, user_id: UUID) -> dict:
        return NotificationRepository.get_summary(db, user_id)

    @staticmethod
    def mark_as_read(db: Session, notif_id: UUID, user_id: UUID) -> Notification:
        notif = NotificationRepository.mark_read(db, notif_id, user_id)
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        return notif

    @staticmethod
    def mark_all_read(db: Session, user_id: UUID) -> dict:
        count = NotificationRepository.mark_all_read(db, user_id)
        return {"detail": f"{count} notifications marked as read"}

    @staticmethod
    def delete(db: Session, notif_id: UUID, user_id: UUID) -> dict:
        deleted = NotificationRepository.delete(db, notif_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"detail": "Notification deleted"}
    