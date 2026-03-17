from sqlalchemy import event
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.core.contexte import current_user_id, current_user_email


def register_scheduled_post_events():

    @event.listens_for(ScheduledPost, "after_insert")
    def on_scheduled_post_insert(mapper, connection, target: ScheduledPost):
        from .published_post import published_task

        user_id = current_user_id.get()
        user_email = current_user_email.get()

        if target.publish_at:
            published_task.apply_async(
                args=[str(target.id), str(user_id), user_email],
                eta=target.publish_at
            )
            print(f"⏰ Tâche planifiée à {target.publish_at} pour {target.id}")