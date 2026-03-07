"""
FeoSync – Main FastAPI application.

Mounts all module routers under /api/v1 and configures:
- CORS
- Structured logging
- Sentry error tracking
- Global exception handlers
- Health check endpoint
"""
from __future__ import annotations

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import sentry_sdk
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.app.core.config.settings import settings
from src.app.core.logging.logger import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


# ── Sentry ────────────────────────────────────────────────────────────────────
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("feosync_startup", version=settings.APP_VERSION, env=settings.APP_ENV)
    yield
    logger.info("feosync_shutdown")


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="FeoSync – Automated social media publishing platform for SMEs",
        docs_url="/api/docs" if not settings.is_production else None,
        redoc_url="/api/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Request logging middleware ────────────────────────────────────────────
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000)
        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )
        return response

    # ── Global exception handlers ─────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error("unhandled_exception", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    prefix = settings.API_PREFIX

    from src.app.modules.ai_generation.router import router as ai_router
    from src.app.modules.analytics.router import router as analytics_router
    from src.app.modules.auth.router import router as auth_router
    from src.app.modules.facebook_pages.router import router as fb_router
    from src.app.modules.organizations.router import router as org_router
    from src.app.modules.plans.router import router as plans_router
    from src.app.modules.posts.router import router as posts_router
    from src.app.modules.reviews.router import router as reviews_router
    from src.app.modules.scheduler.router import router as scheduler_router

    for router in [
        auth_router,
        org_router,
        plans_router,
        fb_router,
        posts_router,
        scheduler_router,
        ai_router,
        analytics_router,
        reviews_router,
    ]:
        app.include_router(router, prefix=prefix)

    # ── Health check ─────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"], include_in_schema=False)
    async def health():
        return {
            "status": "ok",
            "version": settings.APP_VERSION,
            "env": settings.APP_ENV,
        }

    return app


app = create_app()
