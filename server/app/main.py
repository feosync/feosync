from app.core.base import Base
from fastapi import FastAPI
from app.modules.auth.router import auth_router
from app.modules.ai.router import ai_router
from app.core.database import engine


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router, prefix="/app/v1/auth", tags=["auth"])
app.include_router(ai_router, prefix="/app/v1/ai", tags=["ai"])