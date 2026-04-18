import logging
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from qstash import QStash
from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_local(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host in ("localhost", "127.0.0.1", "::1") or host.endswith(".local")


try:
    if _is_local(settings.SERVER_URL):
        qstash_client = QStash(
            token=settings.QSTASH_TOKEN,
            base_url="http://127.0.0.1:8080",
        )
    else:
        qstash_client = QStash(token=settings.QSTASH_TOKEN)
except Exception as e:
    logger.error("[QStash] Échec d'initialisation", exc_info=True)
    qstash_client = None


def schedule_publish(scheduled_post_id: str, publish_at: datetime) -> str:
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
    if qstash_client is None:
        return
    try:
        qstash_client.message.cancel(message_id)
    except Exception:
        logger.warning("[QStash] cancel_publish échoué (ignoré)", exc_info=True)