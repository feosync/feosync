from sqlalchemy.orm import Session
from uuid import UUID
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.modules.scheduled_post.models.scheduled_post_ai_image import ScheduledPostAiImage
from datetime import datetime, timezone


class ScheduledPostRepository:

    @staticmethod
    def create(db: Session, data: dict) -> ScheduledPost:
        post = ScheduledPost(**data)
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> ScheduledPost | None:
        return db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()

    @staticmethod
    def get_by_org(db: Session, org_id: UUID) -> list[ScheduledPost]:
        return (
            db.query(ScheduledPost)
            .filter(ScheduledPost.organisation_id == org_id)
            .order_by(ScheduledPost.created_at.desc())
            .all()
        )

    @staticmethod
    def update(db: Session, post: ScheduledPost, data: dict) -> ScheduledPost:
        for key, value in data.items():
            if hasattr(post, key) and value is not None:
                setattr(post, key, value)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def delete(db: Session, post: ScheduledPost) -> None:
        db.delete(post)
        db.commit()


class ScheduledPostAiImageRepository:

    @staticmethod
    def deactivate_all(db: Session, scheduled_post_id: UUID) -> None:
        """Désactive toutes les images IA actives pour un post"""
        db.query(ScheduledPostAiImage).filter(
            ScheduledPostAiImage.scheduled_post_id == scheduled_post_id,
            ScheduledPostAiImage.is_active == True,
        ).update({
            "is_active": False,
            "replaced_at": datetime.now(timezone.utc),
        })
        db.commit()

    @staticmethod
    def create(db: Session, data: dict) -> ScheduledPostAiImage:
        img = ScheduledPostAiImage(**data)
        db.add(img)
        db.commit()
        db.refresh(img)
        return img