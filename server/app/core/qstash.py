from qstash import QStash
from app.core.config import settings
from datetime import datetime, timezone
from urllib.parse import urlparse

def _is_local(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host in ("localhost", "127.0.0.1", "::1") or host.endswith(".local")

if _is_local(settings.SERVER_URL):
    qstash_client = QStash(
        token=settings.QSTASH_TOKEN,
        base_url="http://127.0.0.1:8080",
    )
else:
    qstash_client = QStash(token=settings.QSTASH_TOKEN)

def schedule_publish(scheduled_post_id: str, publish_at: datetime) -> str:
    delay = int((publish_at - datetime.now(timezone.utc)).total_seconds())
    res = qstash_client.message.publish_json(
        url=f"{settings.SERVER_URL}/published/publish",
        body={"scheduled_post_id": scheduled_post_id},
        headers={"Authorization": f"Bearer {settings.INTERNAL_API_KEY}"},
        delay=max(delay, 0),
    )
    return res.message_id

def cancel_publish(message_id: str) -> None:
    try:
        qstash_client.message.cancel(message_id)
    except Exception:
        pass