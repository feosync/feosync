"""Structured JSON logging via structlog."""
import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor

from app.core.config import settings


# ── Helpers ──────────────────────────────────────────────────────────────────

def _add_app_info(
    logger: logging.Logger,  # noqa: ARG001
    method: str,             # noqa: ARG001
    event_dict: EventDict,
) -> EventDict:
    event_dict["app"] = settings.APP_NAME
    event_dict["env"] = settings.APP_ENV
    return event_dict


class _MinLevelFilter(logging.Filter):
    """Keeps only records at or above *level* (blocks DEBUG & noisy WARNING)."""

    def __init__(self, level: int = logging.INFO) -> None:
        super().__init__()
        self.min_level = level

    def filter(self, record: logging.LogRecord) -> bool:  # noqa: A003
        return record.levelno >= self.min_level


# ── Noisy third-party loggers ─────────────────────────────────────────────────

_NOISY_LOGGERS: tuple[str, ...] = (
    # Web / ASGI
    "uvicorn",
    "uvicorn.access",
    "uvicorn.error",
    # Database
    "sqlalchemy.engine",
    "sqlalchemy.pool",
    "alembic",
    # Task queue
    "celery",
    "celery.worker",
    "celery.app.trace",
    # HTTP clients
    "httpx",
    "httpcore",
    "urllib3",
    # Auth / security
    "passlib",
    "multipart",
    # LLM SDKs
    "groq",
    "google.genai",
    "google.auth",
    # STRIPE
    # "stripe",
    # "stripe.http_client",
    # "stripe.api_requestor",
)

# ── Public API ────────────────────────────────────────────────────────────────

def configure_logging() -> None:
    log_level = logging.DEBUG if settings.APP_DEBUG else logging.INFO

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        _add_app_info,
    ]

    if settings.is_production:
        # JSON compact pour Datadog / Loki
        renderer: Any = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.ExceptionRenderer(),   # remplace format_exc_info
            renderer,
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        wrapper_class=structlog.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Filtre global : INFO + ERROR uniquement dans le terminal
    min_filter = _MinLevelFilter(log_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    handler.addFilter(min_filter)
    handler.setFormatter(logging.Formatter("%(message)s"))

    root = logging.getLogger()
    root.setLevel(log_level)
    root.handlers.clear()          # évite les doublons si appelé plusieurs fois
    root.addHandler(handler)

    # Silence totale des librairies tierces (ERROR only)
    for name in _NOISY_LOGGERS:
        logging.getLogger(name).setLevel(logging.ERROR)


def get_logger(name: str = __name__) -> structlog.BoundLogger:
    return structlog.get_logger(name)