from sqlalchemy.orm import Session
from uuid import UUID
from ..models.scheduled_post_model import ScheduledPost


class ScheduledPostRepository:

    @staticmethod
    def add_scheduled(db: Session, scheduled: ScheduledPost) -> ScheduledPost:
        db.add(scheduled)
        db.commit()
        db.refresh(scheduled)
        return scheduled

    @staticmethod
    def get_all_by_schedule(db: Session, schedule_id: UUID) -> list[ScheduledPost]:
        return db.query(ScheduledPost).filter(
            ScheduledPost.schedule_id == schedule_id
        ).all()

    @staticmethod
    def get_by_id(db: Session, scheduled_id: UUID) -> ScheduledPost | None:
        return db.query(ScheduledPost).filter(
            ScheduledPost.id == scheduled_id
        ).first()

    @staticmethod
    def update_scheduled(db: Session, scheduled: ScheduledPost, data: dict) -> ScheduledPost:
        for key, value in data.items():
            if hasattr(scheduled, key):
                setattr(scheduled, key, value)
        db.commit()
        db.refresh(scheduled)
        return scheduled

    @staticmethod
    def delete_scheduled(db: Session, scheduled: ScheduledPost) -> bool:
        db.delete(scheduled)
        db.commit()
        return True