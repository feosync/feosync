"""Structured JSON logging via structlog."""
import logging
import sys

import structlog
from structlog.types import EventDict, Processor

from src.app.core.config.settings import settings


def _add_app_info(logger: logging.Logger, method: str, event_dict: EventDict) -> EventDict:  # noqa: ARG001
    event_dict["app"] = settings.APP_NAME
    event_dict["env"] = settings.APP_ENV
    return event_dict


def configure_logging() -> None:
    log_level = logging.DEBUG if settings.APP_DEBUG else logging.INFO

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        _add_app_info,
    ]

    if settings.is_production:
        # JSON output for log aggregators (Datadog, Loki, etc.)
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            renderer,
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        wrapper_class=structlog.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )
    # Silence noisy third-party loggers
    for noisy in ("uvicorn.access", "sqlalchemy.engine", "celery"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str = __name__) -> structlog.BoundLogger:
    return structlog.get_logger(name)
