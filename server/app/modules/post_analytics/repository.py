from __future__ import annotations

from uuid import UUID
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from .model import PostAnalytics


class PostAnalyticsRepository:

    @staticmethod
    def create(db: Session, post_analytics: PostAnalytics) -> PostAnalytics:
        db.add(post_analytics)
        db.commit()
        db.refresh(post_analytics)
        return post_analytics

    @staticmethod
    def get_by_id(db: Session, analytics_id: UUID) -> Optional[PostAnalytics]:
        return db.query(PostAnalytics).filter(PostAnalytics.id == analytics_id).first()

    @staticmethod
    def get_by_published(db: Session, published_id: UUID) -> list[PostAnalytics]:
        return (
            db.query(PostAnalytics)
            .filter(PostAnalytics.published_post_id == published_id)
            .order_by(PostAnalytics.mesured_at.desc())
            .all()
        )

    @staticmethod
    def get_latest_by_published(db: Session, published_id: UUID) -> Optional[PostAnalytics]:
        return (
            db.query(PostAnalytics)
            .filter(PostAnalytics.published_post_id == published_id)
            .order_by(PostAnalytics.mesured_at.desc())
            .first()
        )

    @staticmethod
    def get_latest_per_published_post_by_org(
        db: Session,
        organisation_id: UUID,
    ) -> list[PostAnalytics]:
        """
        Une seule requête SQL — dernier snapshot par published_post pour toute une org.
        Évite le N+1.
        """
        from app.modules.published_post.model import PublishedPost
        from app.modules.fb_page.model import Facebook

        subq = (
            db.query(
                PostAnalytics.published_post_id,
                func.max(PostAnalytics.mesured_at).label("latest"),
            )
            .group_by(PostAnalytics.published_post_id)
            .subquery()
        )

        return (
            db.query(PostAnalytics)
            .join(
                subq,
                (PostAnalytics.published_post_id == subq.c.published_post_id)
                & (PostAnalytics.mesured_at == subq.c.latest),
            )
            .join(PublishedPost, PostAnalytics.published_post_id == PublishedPost.id)
            .join(Facebook, PublishedPost.facebook_page_id == Facebook.id)
            .filter(Facebook.organisation_id == organisation_id)
            .all()
        )
    