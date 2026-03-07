"""Celery application factory with all task queues defined."""
from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from src.app.core.config.settings import settings

celery_app = Celery(
    "feosync",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "src.app.workers.publish_worker",
        "src.app.workers.analytics_worker",
        "src.app.workers.scheduler_worker",
        "src.app.workers.sync_worker",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "src.app.workers.publish_worker.*": {"queue": "publishing"},
        "src.app.workers.analytics_worker.*": {"queue": "analytics"},
        "src.app.workers.scheduler_worker.*": {"queue": "scheduler"},
        "src.app.workers.sync_worker.*": {"queue": "sync"},
    },
    # ── Celery Beat schedule ─────────────────────────────────────────────────
    beat_schedule={
        # Run every 2 minutes: pick up posts due for publishing
        "dispatch-due-posts": {
            "task": "src.app.workers.scheduler_worker.dispatch_due_posts",
            "schedule": 120.0,  # seconds
            "options": {"queue": "scheduler"},
        },
        # Sync analytics every 6 hours
        "sync-post-analytics": {
            "task": "src.app.workers.analytics_worker.sync_all_post_analytics",
            "schedule": crontab(minute=0, hour="*/6"),
            "options": {"queue": "analytics"},
        },
        # Sync page insights daily at 02:00 UTC
        "sync-page-insights": {
            "task": "src.app.workers.sync_worker.sync_all_page_insights",
            "schedule": crontab(minute=0, hour=2),
            "options": {"queue": "sync"},
        },
    },
)
