from sqlalchemy import event
from sqlalchemy.orm import attributes
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost, PostStatus
from app.core.logger import get_logger

logger = get_logger()


def register_scheduled_post_events():

    @event.listens_for(ScheduledPost, "after_update")
    def on_post_updated(mapper, connection, target: ScheduledPost):

        # ── Cas 1 : DRAFT → SCHEDULED (première planification) ───────────────
        status_history = attributes.get_history(target, "status")
        just_scheduled = (
            status_history.added
            and PostStatus.SCHEDULED in status_history.added
        )

        # ── Cas 2 : déjà SCHEDULED + publish_at vient de changer ─────────────
        date_history = attributes.get_history(target, "publish_at")
        date_changed = (
            target.status == PostStatus.SCHEDULED
            and date_history.added  # publish_at a une nouvelle valeur
        )

        if not just_scheduled and not date_changed:
            return  # caption, image → on ne fait rien

        if not target.publish_at:
            logger.warning(f"Post {target.id} SCHEDULED sans publish_at")
            return

        try:
            from app.core.contexte import current_user_id, current_user_email
            user_id    = current_user_id.get()
            user_email = current_user_email.get()
        except Exception:
            user_id    = None
            user_email = ""

        # ── Révoque l'ancienne task ───────────────────────────────────────────
        _safe_revoke(str(target.id))

        # ── Planifie avec le nouveau publish_at ───────────────────────────────
        _safe_schedule(str(target.id), str(user_id), user_email, target.publish_at)
        logger.info(
            f"{'Nouvelle' if just_scheduled else 'Replanification'} task "
            f"pour post {target.id} à {target.publish_at}"
        )

def _safe_revoke(post_id: str) -> None:
    try:
        from app.celery.celery_app import celery_app
        from app.core.redis import redis_client

        task_id = redis_client.get(f"celery_task:{post_id}")
        if not task_id:
            logger.info(f"Aucune task Redis pour post {post_id}")
            return

        # Decode si bytes
        if isinstance(task_id, bytes):
            task_id = task_id.decode()

        celery_app.control.revoke(task_id, terminate=True)
        redis_client.delete(f"celery_task:{post_id}")
        logger.info(f"Task {task_id} révoquée pour post {post_id}")

    except Exception as e:
        logger.warning(f"Révocation impossible pour {post_id}: {e}")


def _safe_schedule(post_id: str, user_id: str, user_email: str, publish_at) -> None:
    try:
        from app.celery.task.published_post import published_task
        from app.core.redis import redis_client
        from uuid import uuid4

        # ✅ task_id unique — jamais dans la blacklist de révocation
        task_id = f"publish-{post_id}-{uuid4().hex[:8]}"

        result = published_task.apply_async(
            args=[post_id, user_id, user_email],
            eta=publish_at,
            task_id=task_id,
        )

        # Stocke le nouveau task_id pour révocation future
        redis_client.set(f"celery_task:{post_id}", result.id)
        logger.info(f"Task planifiée : post {post_id} à {publish_at} (task_id={task_id})")

    except (ConnectionRefusedError, OSError):
        logger.warning(f"Redis indisponible — post {post_id} sans task Celery")
    except Exception as e:
        logger.warning(f"Celery erreur ({type(e).__name__}): {e}")