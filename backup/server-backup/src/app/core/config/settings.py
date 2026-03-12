from functools import lru_cache
from typing import Literal
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "FeoSync"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_DEBUG: bool = False
    APP_VERSION: str = "1.0.0"
    SECRET_KEY: str

    # ── API ───────────────────────────────────────────────────────────────────
    API_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_ALGORITHM: str = "HS256"

    # ── Meta / Facebook ───────────────────────────────────────────────────────
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_GRAPH_API_VERSION: str = "v19.0"
    META_WEBHOOK_VERIFY_TOKEN: str = ""
    META_OAUTH_REDIRECT_URI: str = ""

    @property
    def META_GRAPH_BASE_URL(self) -> str:
        return f"https://graph.facebook.com/{self.META_GRAPH_API_VERSION}"

    @property
    def META_OAUTH_URL(self) -> str:
        return (
            f"https://www.facebook.com/dialog/oauth"
            f"?client_id={self.META_APP_ID}"
            f"&redirect_uri={self.META_OAUTH_REDIRECT_URI}"
            f"&scope=pages_manage_posts,pages_read_engagement,"
            f"pages_show_list,pages_manage_metadata,business_management"
        )

    # ── AI ────────────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ── Storage – Cloudflare R2 ───────────────────────────────────────────────
    R2_ENDPOINT_URL: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "feosync-assets"
    R2_PUBLIC_URL: str = ""

    # ── Email ─────────────────────────────────────────────────────────────────
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@feosync.com"
    EMAIL_FROM_NAME: str = "FeoSync"

    # ── Encryption ────────────────────────────────────────────────────────────
    ENCRYPTION_KEY: str  # 32-byte base64 key for Fernet

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── Sentry ────────────────────────────────────────────────────────────────
    SENTRY_DSN: str = ""

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
