# celery/tasks/published_post.py
from app.celery.celery_app import celery_app
from app.core.database import SessionLocal
from app.modules.published_post.service import PublishedPostService
from fastapi import BackgroundTasks
import logging
import asyncio

# ✅ Configuration de base
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2)
def published_task(self, scheduled_id: str, user_id: str, user_email: str):
    db = SessionLocal()
    try:
        from uuid import UUID
        result = asyncio.run(
            PublishedPostService.publish_to_facebook(
                db=db,
                scheduled_post_id=UUID(scheduled_id),
                background_tasks=BackgroundTasks(),
                user_id=UUID(user_id),
                user_email=user_email,
            )
        )
        logger.info(f"Post {result.id} published successfully")
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=10)
    finally:
        db.close()