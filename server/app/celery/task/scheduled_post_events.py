from sqlalchemy import event
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.core.contexte import current_user_id, current_user_email
from celery.result import AsyncResult
from app.core.redis import redis_client
import logging

logger = logging.getLogger(__name__)

def cancel_scheduled_task(post_id: str) -> bool:
    task_id = redis_client.get(f"celery_task:{post_id}")
    if not task_id:
        return False
    AsyncResult(task_id).revoke(terminate=True)
    redis_client.delete(f"celery_task:{post_id}")
    logger.info(f"🗑️ Task {task_id} revoked for post {post_id}")
    return True


def register_scheduled_post_events():

    @event.listens_for(ScheduledPost, "after_insert")
    @event.listens_for(ScheduledPost, "after_update")
    def on_scheduled_post_change(mapper, connection, target: ScheduledPost):
        from .published_post import published_task

        if not target.publish_at:
            return

        # ✅ Révoquer l'ancienne tâche si elle existe (update)
        cancel_scheduled_task(str(target.id)) 

        user_id = current_user_id.get()
        user_email = current_user_email.get()

        # ✅ Planifier la nouvelle tâche
        result = published_task.apply_async( 
            args=[str(target.id), str(user_id), user_email],
            eta=target.publish_at
        )

        # ✅ Sauvegarder le task_id pour révocation future
        redis_client.set(              
            f"celery_task:{target.id}",
            result.id
        )

        logger.info(f"⏰ Task scheduled at {target.publish_at} for post {target.id}")
