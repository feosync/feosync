from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.modules import auth_router,user_router,  ai_router, fb_page_router, organisation_router, notif_router, plans_router, scheduled_post_router, post_template_router, post_analytics_router,published_post_router
from app.core.database import engine
from app.core.base import Base
from app.core.config import settings
from app.modules.events.scheduled_post_events import register_scheduled_post_events

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FeoSync API",
    description="FeoSync - Social Media Management Platform API",
    version="1.0.0",
)
register_scheduled_post_events()


# CORS en premier
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="app/templates")

# Routes avant le mount static
@app.get("/")
async def root():
    return {"message": "Welcome to FeoSync API!"}

@app.get("/dev/get-token")
async def get_token_page(request: Request):
    return templates.TemplateResponse("get_token.html", {
        "request": request,
        "google_client_id": settings.GOOGLE_CLIENT_ID
    })

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(user_router, prefix="/api/v1/user", tags=["user"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(organisation_router, prefix="/api/v1/org", tags=["org"])
app.include_router(fb_page_router, prefix="/api/v1/fb", tags=["fb"])
app.include_router(plans_router, prefix="/api/v1/plans", tags=["plans"])
app.include_router(scheduled_post_router, prefix="/api/v1/scheduled", tags=["scheduledPost"])
app.include_router(post_template_router, prefix="/api/v1/post-template", tags=["postTemplate"])
app.include_router(published_post_router, prefix="/api/v1/published", tags=["publishedPost"])
app.include_router(post_analytics_router, prefix="/api/v1/post-analytics", tags=["PostAnalytics"])
app.include_router(notif_router, prefix="/api/v1/notif", tags=["notif"])

