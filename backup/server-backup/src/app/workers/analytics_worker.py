"""Analytics sync worker – pulls post metrics from Meta Graph API."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from src.app.core.logging.logger import get_logger
from src.app.workers.celery_app import celery_app

logger = get_logger(__name__)


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="src.app.workers.analytics_worker.sync_all_post_analytics")
def sync_all_post_analytics() -> dict:
    return _run(_sync_all_post_analytics())


async def _sync_all_post_analytics() -> dict:
    from sqlalchemy import select

    from src.app.core.security.jwt import decrypt_token
    from src.app.database.session import AsyncSessionFactory
    from src.app.modules.integrations.meta.client import MetaGraphClient
    from src.app.modules.models import FacebookPage, PostAnalytic, PublishedPost, ScheduledPost

    updated = 0
    async with AsyncSessionFactory() as db:
        result = await db.execute(
            select(PublishedPost).where(PublishedPost.fb_post_id.isnot(None))
        )
        published_posts = result.scalars().all()

        async with MetaGraphClient() as meta:
            for pub_post in published_posts:
                try:
                    # Get the first active page for token (simplified)
                    sched_post_result = await db.execute(
                        select(ScheduledPost).where(ScheduledPost.id == pub_post.scheduled_post_id)
                    )
                    sched_post = sched_post_result.scalar_one_or_none()
                    if not sched_post or not sched_post.page_ids:
                        continue

                    page_result = await db.execute(
                        select(FacebookPage).where(
                            FacebookPage.fb_page_id == sched_post.page_ids[0]
                        )
                    )
                    fb_page = page_result.scalar_one_or_none()
                    if not fb_page:
                        continue

                    page_token = decrypt_token(fb_page.access_token_enc)
                    insights = await meta.get_post_insights(pub_post.fb_post_id, page_token)

                    # Parse insights response
                    metrics: dict = {}
                    for item in insights.get("data", []):
                        metrics[item["name"]] = item.get("values", [{}])[-1].get("value", 0)

                    analytic = PostAnalytic(
                        published_post_id=pub_post.id,
                        measured_at=datetime.now(tz=timezone.utc),
                        reach=metrics.get("post_impressions_unique", 0),
                        impressions=metrics.get("post_impressions", 0),
                        reactions=metrics.get("post_reactions_by_type_total", {}),
                        clicks=metrics.get("post_clicks", 0),
                    )
                    db.add(analytic)
                    updated += 1

                except Exception as exc:
                    logger.warning(
                        "analytics_sync_error",
                        post_id=str(pub_post.id),
                        error=str(exc),
                    )

        await db.commit()

    logger.info("analytics_sync_complete", updated=updated)
    return {"updated": updated}
