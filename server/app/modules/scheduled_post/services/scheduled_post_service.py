from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from ..models.scheduled_post_model import ScheduledPost
from ..repository.scheduled_post_repository import ScheduledPostRepository as repository
from ..schemas.scheduled_post_schema import ScheduledPostCreate


class ScheduledPostService:

    # ─── READ ────────────────────────────────────────────────────────────────

    @staticmethod
    def get_all_by_schedule(db: Session, schedule_id: UUID) -> list[ScheduledPost]:
        return repository.get_all_by_schedule(db=db, schedule_id=schedule_id)

    @staticmethod
    def get_by_id(db: Session, scheduled_id: UUID) -> ScheduledPost:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return scheduled

    # ─── CREATE ──────────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, scheduled_create: ScheduledPostCreate) -> ScheduledPost:
        data = scheduled_create.model_dump()
        data["page_ids"] = {
            channel: str(uid)
            for channel, uid in data["page_ids"].items()
        }
        
        scheduled = ScheduledPost(**data)
        return repository.add_scheduled(db=db, scheduled=scheduled)

    # ─── UPDATE ──────────────────────────────────────────────────────────────

    @staticmethod
    def update(db: Session, scheduled_id: UUID, data: dict) -> ScheduledPost:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        if "page_ids" in data and data["page_ids"]:
            data["page_ids"] = {
                channel: str(uid)
                for channel, uid in data["page_ids"].items()
            }
        return repository.update_scheduled(db=db, scheduled=scheduled, data=data)

    # ─── DELETE ──────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, scheduled_id: UUID) -> bool:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return repository.delete_scheduled(db=db, scheduled=scheduled)

    # ─── IMAGE ───────────────────────────────────────────────────────────────

    @staticmethod
    def update_image_url(db: Session, scheduled_id: UUID, image_url: str) -> ScheduledPost:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return repository.update_scheduled(
            db=db, scheduled=scheduled, data={"image_url": image_url}
        )
        