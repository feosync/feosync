from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_, between
from sqlalchemy.orm import Session
from .model import PostAnalytics


class PostAnalyticsRepository:
    """Repository for PostAnalytics — all DB operations in one place."""
    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #

    def create(db:Session, post_analytics: PostAnalytics) -> PostAnalytics:
        """Persist a new PostAnalytics record."""
        db.add(post_analytics)
        db.commit()
        db.refresh(post_analytics)
        return post_analytics


    # ------------------------------------------------------------------ #
    #  READ — single record                                                #
    # ------------------------------------------------------------------ #

    def get_by_id(db:Session, analytics_id: UUID) -> Optional[PostAnalytics]:
        """Return a single record by primary key, or None."""
        return db.query(PostAnalytics).filter(PostAnalytics.id==analytics_id).first()
    
    def get_by_published(db:Session,publised_id:UUID)->list[PostAnalytics]:
        return db.query(PostAnalytics).filter(PostAnalytics.published_post_id==publised_id).all()



