"""Sync worker – pulls daily Facebook page insights."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
import calendar

from src.app.core.logging.logger import get_logger
from src.app.workers.celery_app import celery_app

logger = get_logger(__name__)


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="src.app.workers.sync_worker.sync_all_page_insights")
def sync_all_page_insights() -> dict:
    return _run(_sync_all_page_insights())


async def _sync_all_page_insights() -> dict:
    from sqlalchemy import select

    from src.app.core.security.jwt import decrypt_token
    from src.app.database.session import AsyncSessionFactory
    from src.app.modules.integrations.meta.client import MetaGraphClient
    from src.app.modules.models import FacebookPage, PageInsight

    synced = 0
    now = datetime.now(tz=timezone.utc)
    # Sync yesterday's data
    yesterday = now - timedelta(days=1)
    since_ts = int(yesterday.replace(hour=0, minute=0, second=0).timestamp())
    until_ts = int(yesterday.replace(hour=23, minute=59, second=59).timestamp())

    async with AsyncSessionFactory() as db:
        result = await db.execute(
            select(FacebookPage).where(FacebookPage.is_active == True)  # noqa: E712
        )
        pages = result.scalars().all()

        async with MetaGraphClient() as meta:
            for page in pages:
                try:
                    token = decrypt_token(page.access_token_enc)
                    insights_data = await meta.get_page_insights(
                        page.fb_page_id, token, since_ts, until_ts
                    )

                    metrics: dict = {}
                    for item in insights_data.get("data", []):
                        name = item.get("name", "")
                        values = item.get("values", [])
                        if values:
                            metrics[name] = values[-1].get("value", 0)

                    insight = PageInsight(
                        facebook_page_id=page.id,
                        date=yesterday.date(),
                        fans_total=metrics.get("page_fans", 0),
                        impressions_unique=metrics.get("page_impressions_unique", 0),
                        engaged_users=metrics.get("page_engaged_users", 0),
                        new_followers=metrics.get("page_fan_adds", 0),
                        reach=metrics.get("page_impressions_unique", 0),
                    )
                    db.add(insight)

                    # Update page's last_sync_at
                    page.last_sync_at = now
                    synced += 1

                except Exception as exc:
                    logger.warning(
                        "page_insight_sync_error",
                        page_id=str(page.id),
                        error=str(exc),
                    )

        await db.commit()

    logger.info("page_insights_sync_complete", synced=synced)
    return {"synced": synced}
