"""
Publish worker.
Takes a scheduled post ID, fetches it, and publishes it to all
target Facebook pages via Meta Graph API.
"""
from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from src.app.core.logging.logger import get_logger
from src.app.workers.celery_app import celery_app

logger = get_logger(__name__)


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    name="src.app.workers.publish_worker.publish_post",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def publish_post(self, post_id: str) -> dict:
    """Publish a scheduled post to all configured channels."""
    try:
        return _run_async(_publish_post_async(uuid.UUID(post_id)))
    except Exception as exc:
        logger.error("publish_task_failed", post_id=post_id, error=str(exc))
        raise self.retry(exc=exc)


async def _publish_post_async(post_id: uuid.UUID) -> dict:
    from sqlalchemy import select

    from src.app.core.security.jwt import decrypt_token
    from src.app.database.session import AsyncSessionFactory
    from src.app.modules.integrations.meta.client import MetaGraphClient
    from src.app.modules.models import (
        FacebookPage,
        PostStatus,
        PublishedChannel,
        PublishedPost,
        ScheduledPost,
    )
    from src.app.shared.exceptions.http_exceptions import MetaAPIError

    results = []

    async with AsyncSessionFactory() as db:
        # Fetch post
        result = await db.execute(select(ScheduledPost).where(ScheduledPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            logger.error("post_not_found", post_id=str(post_id))
            return {"error": "Post not found"}

        page_ids: list[str] = post.page_ids or []
        caption: str = post.caption or ""
        image_url: str | None = post.image_url

        async with MetaGraphClient() as meta:
            for fb_page_id in page_ids:
                # Get page token from DB
                page_result = await db.execute(
                    select(FacebookPage).where(FacebookPage.fb_page_id == fb_page_id)
                )
                fb_page = page_result.scalar_one_or_none()
                if not fb_page or not fb_page.is_active:
                    logger.warning("page_not_found_or_inactive", fb_page_id=fb_page_id)
                    continue

                page_token = decrypt_token(fb_page.access_token_enc)

                try:
                    if image_url:
                        api_result = await meta.publish_photo(
                            fb_page_id, page_token, image_url, caption
                        )
                    else:
                        api_result = await meta.publish_feed(fb_page_id, page_token, caption)

                    fb_post_id = api_result.get("id") or api_result.get("post_id")

                    pub_post = PublishedPost(
                        scheduled_post_id=post_id,
                        fb_post_id=fb_post_id,
                        channel=PublishedChannel.FACEBOOK,
                        published_at=datetime.now(tz=timezone.utc),
                    )
                    db.add(pub_post)
                    results.append({"page_id": fb_page_id, "fb_post_id": fb_post_id})
                    logger.info(
                        "post_published",
                        post_id=str(post_id),
                        page_id=fb_page_id,
                        fb_post_id=fb_post_id,
                    )

                except MetaAPIError as exc:
                    logger.error(
                        "meta_publish_error",
                        post_id=str(post_id),
                        page_id=fb_page_id,
                        error=exc.message,
                    )
                    post.retry_count += 1
                    post.last_error = exc.message

        # Update post status
        if results:
            post.status = PostStatus.PUBLISHED
        else:
            post.status = PostStatus.FAILED

        await db.commit()

    return {"published": results}
