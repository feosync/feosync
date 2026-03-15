from pydantic_settings import BaseSettings # type: ignore
class Settings(BaseSettings):
    GEMINI_API_KEY: str
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    REPLICATE_API_TOKEN: str

    # Google OAuth settings
    GOOGLE_CLIENT_ID: str | None = None
   
    SECRET_KEY: str | None = None

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    class Config:
        env_file = ".env"
        
settings = Settings()