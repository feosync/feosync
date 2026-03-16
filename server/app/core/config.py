from pydantic_settings import BaseSettings # type: ignore
class Settings(BaseSettings):
    GEMINI_API_KEY: str
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    

    # Google OAuth settings
    GOOGLE_CLIENT_ID: str | None = None
    
    # Secret key for JWT or other purposes
    SECRET_KEY: str | None = None

    # Facebook API Credentials
    META_APP_ID: str | None = None
    META_APP_SECRET: str | None = None
    META_REDIRECT_URI: str | None = None

    # Mail settings
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_PORT: int | None = None
    MAIL_SERVER: str | None = None
   

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    class Config:
        env_file = ".env"
        
settings = Settings()