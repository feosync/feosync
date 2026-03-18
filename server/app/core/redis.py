import redis
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,       # "localhost"
    port=settings.REDIS_PORT,       # 6379
    db=0,
    decode_responses=True           # ✅ retourne des str au lieu de bytes
)