# celery/tasks/published_post.py
from app.celery.celery_app import celery_app
from app.core.database import SessionLocal
from app.modules.published_post.service import PublishedPostService
from fastapi import BackgroundTasks
import logging
import asyncio
from app.core.logger import get_logger

logger = get_logger()

@celery_app.task(bind=True, max_retries=2)
def published_task(self, scheduled_id: str, user_id: str, user_email: str):
    logger.info(f"🚀 Exécution task pour post {scheduled_id}")
    db = SessionLocal()
    try:
        from uuid import UUID
        from app.modules.scheduled_post.repository import ScheduledPostRepository
        
        # Relit le publish_at DEPUIS la DB au moment d'exécution
        post = ScheduledPostRepository.get_by_id(db, UUID(scheduled_id))
        logger.info(f"publish_at en DB: {post.publish_at}")

        result = asyncio.run(
            PublishedPostService.publish_to_facebook(
                db=db,
                scheduled_post_id=UUID(scheduled_id),
                background_tasks=BackgroundTasks(),
                user_id=UUID(user_id) if user_id else None,
                user_email=user_email,
            )
        )
        logger.info(f"Post {result.id} publié avec succès")
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=10)
    finally:
        db.close()
