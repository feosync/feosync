from uuid import UUID

from app.celery.celery_app import celery_app
from app.core.database import SessionLocal
from fastapi import BackgroundTasks
from app.core.logger import get_logger
import asyncio
from app.modules.notifications import service as notification_service
from app.modules.notifications.model import NotificationChannel, NotificationType
from app.modules.organisations.model import Organisation
from app.modules.published_post.model import PublishedPost
from app.modules.published_post.service import PublishedPostService as published_post_service



logger = get_logger()

@celery_app.task(max_retries=2)
def comment_classification_task(comment: str, user_id: UUID, published_post_id: UUID):
    logger.info(f"🚀 Exécution task de classification pour un commentaire")
    db = SessionLocal()
    try:
        from app.modules.ai_generation.service.comment_service import CommentService
        comment_service = CommentService()
        comment_service.publised_post = published_post_service.get_by_id(db,published_post_id)
        result = asyncio.run(comment_service.comment_classification(comment=comment, db=db, user_id=user_id))
        comment_classified = result.strip().lower()
        notification_service.NotificationService.create(
                 db=db,
                 background_tasks=BackgroundTasks(),
                 user_id=user_id,
                 title=f"Un commentaire est classé en {comment_classified}!",
                 message=f"Un commentaire a été automatiquement classé dans la catégorie '{comment_classified}'.",
                 type=NotificationType.COMMENT_CLASSIFIED,
                 channel=NotificationChannel.IN_APP,
             )
    except Exception as exc:
        db.rollback()
        raise (exc)  # Relance l'exception pour que Celery puisse gérer les retries
    finally:
        db.close()