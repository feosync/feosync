from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.modules.Webhooks.service import WebhooksService
from app.core.database import engine, get_db
from app.core.base import Base
from app.core.logger import configure_logging, get_logger
from app.core.startup import seed_first_admin
from app.core.seed import seed_plans
from app.celery.task.scheduled_post_events import register_scheduled_post_events
from app.core.config import settings

from app.modules import (
    auth_router, user_router, admin_user_router,
    ai_router, fb_page_router, organisation_router,
    notif_router, plans_router, scheduled_post_router,
    post_template_router, post_analytics_router, published_post_router,app_webhooks_router,
    collaborators_router, app_payment_router, subcription_router
)

# ── Logging ───────────────────────────────────────────────────────────────────

configure_logging()
logger = get_logger(__name__)

# ── DB init ───────────────────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

webhooks_service = WebhooksService()

# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    logger.info("Starting up FeoSync API...")
    db = next(get_db())
    try:
        seed_first_admin(db)
        seed_plans(db)
        register_scheduled_post_events()
        await webhooks_service.startup()  
        logger.info("Startup complete.")
    finally:
        db.close()

    yield  # app runs here

    # shutdown
    logger.info("Shutting down FeoSync API...")

# ── App ───────────────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="FeoSync API",
        description="FeoSync - Social Media Management Platform API",
        version="1.0.0",
        lifespan=lifespan,
    )

    _register_middleware(app)
    _register_routes(app)
    _register_static(app)

    return app


def _register_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL, "https://feosync.vercel.app", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def _register_routes(app: FastAPI) -> None:
    from app.api.routes import dev_router  # routes /dev et /

    app.include_router(dev_router)
    app.include_router(auth_router,           prefix="/api/v1/auth",           tags=["auth"])
    app.include_router(user_router,           prefix="/api/v1/user",           tags=["user"])
    app.include_router(admin_user_router,     prefix="/api/v1/admin/users",    tags=["admin"])
    app.include_router(plans_router,          prefix="/api/v1/plans",          tags=["plans"])
    app.include_router(organisation_router,   prefix="/api/v1/org",            tags=["org"])
    app.include_router(collaborators_router,  prefix="/api/v1/collaborators",  tags=["collaborators"])
    app.include_router(fb_page_router,        prefix="/api/v1/fb",             tags=["fb"])
    app.include_router(post_template_router,  prefix="/api/v1/post-template",  tags=["postTemplate"])
    app.include_router(scheduled_post_router, prefix="/api/v1/scheduled",      tags=["scheduledPost"])
    app.include_router(ai_router,             prefix="/api/v1/ai",             tags=["ai"])
    app.include_router(published_post_router, prefix="/api/v1/published",      tags=["publishedPost"])
    app.include_router(post_analytics_router, prefix="/api/v1/post-analytics", tags=["PostAnalytics"])
    app.include_router(notif_router,          prefix="/api/v1/notif",          tags=["notif"])
    app.include_router(app_webhooks_router, prefix="/api/v1/webhook", tags= ["webhook"] )
    app.include_router(app_payment_router, prefix="/api/v1/payment", tags=["transaction"])
    app.include_router(subcription_router, prefix="/api/v1/subscription", tags=["subscription"])

def _register_static(app: FastAPI) -> None:
    from fastapi.staticfiles import StaticFiles
    from pathlib import Path

    Path("app/static/uploads").mkdir(parents=True, exist_ok=True)
    app.mount("/static", StaticFiles(directory="app/static"), name="static")


app = create_app()

