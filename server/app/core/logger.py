"""Structured JSON logging via structlog."""
import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor

from app.core.config import settings


def _add_app_info(_: Any, __: Any, event_dict: EventDict) -> EventDict:
    event_dict["app"] = settings.APP_NAME
    event_dict["env"] = settings.APP_ENV
    return event_dict


_NOISY_LOGGERS: tuple[str, ...] = (
    "uvicorn", "uvicorn.access", "uvicorn.error",
    "sqlalchemy.engine", "sqlalchemy.pool", "alembic",
    "celery", "celery.worker", "celery.app.trace",
    "httpx", "httpcore", "urllib3",
    "passlib", "multipart",
    "groq", "google.genai", "google.auth",
    "stripe", "stripe.http_client", "stripe.api_requestor",
)


def configure_logging() -> None:
    log_level = logging.DEBUG if settings.APP_DEBUG else logging.INFO

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        _add_app_info,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.dict_tracebacks,  # exceptions → champ structuré
    ]

    renderer: Processor = (
        structlog.processors.JSONRenderer()
        if settings.is_production
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    structlog.configure(
        processors=[*shared_processors, renderer],
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        wrapper_class=structlog.BoundLogger,
        cache_logger_on_first_use=True,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    handler.setFormatter(logging.Formatter("%(message)s"))

    root = logging.getLogger()
    root.setLevel(log_level)
    root.handlers.clear()
    root.addHandler(handler)

    for name in _NOISY_LOGGERS:
        logging.getLogger(name).setLevel(logging.ERROR)


# Usage : logger = get_logger()  →  logger.info("event", user_id=..., post_id=...)
get_logger = structlog.get_logger