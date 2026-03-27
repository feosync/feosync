from functools import lru_cache

from pydantic_settings import BaseSettings 
from typing import Literal

class Settings(BaseSettings):
     # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "FeoSync"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_DEBUG: bool = False
    SECRET_KEY: str | None = None

    FIRST_ADMIN_EMAIL : str = "anicet22.aps2a@gmail.com"
    
    WEBHOOK_TOKEN: str | None = None

    GEMINI_API_KEY: str
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    
    #Redis setting
    REDIS_HOST:str
    REDIS_PORT: int
    
    #Celery setting
    BROKER:str
    BACKEND: str

    # Google OAuth settings
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    
    

    # Facebook API Credentials
    META_APP_ID: str | None = None
    META_APP_SECRET: str | None = None
    META_REDIRECT_URI: str | None = None
    META_GRAPH_URL: str | None = None

    # Mail settings
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_PORT: int | None = None
    MAIL_SERVER: str | None = None

    # AI Generation limits
    AI_CAPTION_LIMIT_PER_MONTH: int | None = None
    AI_IMAGE_LIMIT_PER_MONTH: int | None = None

    # URL
    SERVER_URL: str | None = None
    FRONTEND_URL: str | None = None
   

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    class Config:
        env_file = ".env"
        
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()