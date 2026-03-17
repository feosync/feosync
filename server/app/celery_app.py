from celery import Celery

celery_app = Celery(
    "autopost",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=[
        "app.modules.events.published_post",  # ✅ force le chargement au démarrage
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# ✅ Indique à Celery où trouver les tâches
celery_app.autodiscover_tasks([
    "app.modules.events",   # ← dossier où est published_post.py
])