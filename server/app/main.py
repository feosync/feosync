from fastapi import FastAPI
from app.modules.auth.router import auth_router
from app.modules.ai.router import ai_router
from app.core.database import engine
from app.modules.fb_page.router import fb_page_router
from app.modules.notifications.router import notif_router       
from app.modules.organisations.router import organisation_router
from app.core.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router, prefix="/app/v1/auth", tags=["auth"])
app.include_router(ai_router, prefix="/app/v1/ai", tags=["ai"])
app.include_router(fb_page_router, prefix="/app/v1/fb", tags=["fb"] )
app.include_router(organisation_router, prefix="/app/v1/org", tags=["org"])
app.include_router(notif_router, prefix="/app/v1/notif", tags=["notif"])

