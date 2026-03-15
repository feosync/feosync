from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.published_post.model import PublishedPost


class PublishedPostRepository:

    @staticmethod
    def get_all_by_org(db: Session, org_id: UUID) -> list[PublishedPost]:
        from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
        return (
            db.query(PublishedPost)
            .join(ScheduledPost, PublishedPost.scheduled_post_id == ScheduledPost.id)
            .filter(ScheduledPost.organisation_id == org_id)
            .order_by(PublishedPost.published_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> PublishedPost | None:
        return db.query(PublishedPost).filter(PublishedPost.id == post_id).first()

    @staticmethod
    def get_by_scheduled_post(db: Session, scheduled_post_id: UUID) -> PublishedPost | None:
        return db.query(PublishedPost).filter(
            PublishedPost.scheduled_post_id == scheduled_post_id
        ).first()

    @staticmethod
    def get_by_page(db: Session, facebook_page_id: UUID) -> list[PublishedPost]:
        return (
            db.query(PublishedPost)
            .filter(PublishedPost.facebook_page_id == facebook_page_id)
            .order_by(PublishedPost.published_at.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, data: dict) -> PublishedPost:
        post = PublishedPost(**data)
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def update(db: Session, post: PublishedPost, data: dict) -> PublishedPost:
        for key, value in data.items():
            if hasattr(post, key) and value is not None:
                setattr(post, key, value)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def delete(db: Session, post: PublishedPost) -> None:
        db.delete(post)
        db.commit()