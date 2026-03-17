from sqlalchemy import event
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost


def register_scheduled_post_events():

    @event.listens_for(ScheduledPost, "after_insert")
    def on_scheduled_post_insert(mapper, connection, target: ScheduledPost):
        from .published_post import published_task

        if target.publish_at:
            published_task.apply_async(
                args=[str(target.id)],      # ✅ str
                eta=target.publish_at       # ✅ datetime avec timezone
            )
            print(f"⏰ Tâche planifiée à {target.publish_at} pour {target.id}")