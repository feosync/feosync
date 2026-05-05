import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger()

_qstash_client = None
_initialized = False


def _get_client():
    """Initialise QStash à la première utilisation."""
    global _qstash_client, _initialized

    if _initialized:
        return _qstash_client

    _initialized = True

    try:
        from qstash import QStash

        host = urlparse(settings.SERVER_URL).hostname or ""
        is_local = host in ("localhost", "127.0.0.1", "::1") or host.endswith(".local")

        if is_local:
            logger.warning("[QStash] Environnement local — client non initialisé")
            return None

        _qstash_client = QStash(token=settings.QSTASH_TOKEN)

    except Exception:
        logger.warning("[QStash] Initialisation échouée — no-op actif", exc_info=True)

    return _qstash_client


def schedule_publish(scheduled_post_id: str, publish_at: datetime) -> str:
    client = _get_client()

    if client is None:
        fake_id = f"local-{uuid.uuid4()}"
        logger.debug("[QStash] skip scheduling", post_id=scheduled_post_id, fake_id=fake_id)
        return fake_id

    try:
        delay = int((publish_at - datetime.now(timezone.utc)).total_seconds())
        res = client.message.publish_json(
            url=f"{settings.SERVER_URL}/published/publish",
            body={"scheduled_post_id": scheduled_post_id},
            headers={"Authorization": f"Bearer {settings.INTERNAL_API_KEY}"},
            delay=max(delay, 0),
        )
        return res.message_id
    except Exception as e:
        raise RuntimeError(f"QStash schedule_publish échoué : {e}") from e


def cancel_publish(message_id: str) -> None:
    client = _get_client()

    if client is None:
        return

    try:
        client.message.cancel(message_id)
    except Exception:
        logger.warning("[QStash] cancel_publish échoué (ignoré)", exc_info=True)