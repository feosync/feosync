
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from qstash import QStash
from app.core.config import settings

from app.core.logger import get_logger
logger = get_logger()


def _is_local(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host in ("localhost", "127.0.0.1", "::1") or host.endswith(".local")

try:
    IS_LOCAL = _is_local(settings.SERVER_URL)
except Exception:
    logger.warning("[QStash] SERVER_URL indisponible — fallback local actif")
    IS_LOCAL = True

if not IS_LOCAL:
    try:
        qstash_client = QStash(token=settings.QSTASH_TOKEN)
    except Exception:
        logger.error("[QStash] Échec d'initialisation", exc_info=True)
        qstash_client = None
else:
    logger.warning("[QStash] Environnement local détecté — QStash désactivé, fallback polling actif")
    qstash_client = None


def schedule_publish(scheduled_post_id: str, publish_at: datetime) -> str:
    """
    En prod  : schedule via QStash → HTTP callback à publish_at.
    En local : no-op — la publication sera gérée par le cron polling /internal/publish-due.
    """
    if IS_LOCAL:
        fake_id = f"local-{uuid.uuid4()}"
        logger.debug("[QStash] local → skip scheduling", post_id=scheduled_post_id, fake_id=fake_id)
        return fake_id

    if qstash_client is None:
        raise RuntimeError("QStash client non initialisé")

    try:
        delay = int((publish_at - datetime.now(timezone.utc)).total_seconds())
        res = qstash_client.message.publish_json(
            url=f"{settings.SERVER_URL}/published/publish",
            body={"scheduled_post_id": scheduled_post_id},
            headers={"Authorization": f"Bearer {settings.INTERNAL_API_KEY}"},
            delay=max(delay, 0),
        )
        return res.message_id
    except Exception as e:
        raise RuntimeError(f"QStash schedule_publish échoué : {e}") from e


def cancel_publish(message_id: str) -> None:
    """No-op silencieux si local ou client absent."""
    if IS_LOCAL or qstash_client is None:
        return
    try:
        qstash_client.message.cancel(message_id)
    except Exception:
        logger.warning("[QStash] cancel_publish échoué (ignoré)", exc_info=True)