"""
Scheduler worker.
Periodically checks for posts due to be published and dispatches them
to the publishing queue.
"""
from __future__ import annotations

import asyncio

from src.app.core.logging.logger import get_logger
from src.app.workers.celery_app import celery_app

logger = get_logger(__name__)


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="src.app.workers.scheduler_worker.dispatch_due_posts", bind=True)
def dispatch_due_posts(self) -> dict:
    """Find all SCHEDULED posts whose publish_at <= now and dispatch them."""
    return _run_async(_dispatch_due_posts_async())


async def _dispatch_due_posts_async() -> dict:
    from src.app.database.session import AsyncSessionFactory
    from src.app.modules.models import PostStatus
    from src.app.modules.posts.router import PostRepository
    from src.app.workers.publish_worker import publish_post

    dispatched = 0
    async with AsyncSessionFactory() as db:
        repo = PostRepository(db)
        due_posts = await repo.get_due_posts()
        for post in due_posts:
            # Mark as PUBLISHING to prevent double dispatch
            await repo.update(post, {"status": PostStatus.PUBLISHING})
            await db.commit()
            # Dispatch async to publishing queue
            publish_post.apply_async(
                args=[str(post.id)],
                queue="publishing",
            )
            dispatched += 1
            logger.info("post_dispatched", post_id=str(post.id))

    logger.info("scheduler_run_complete", dispatched=dispatched)
    return {"dispatched": dispatched}
