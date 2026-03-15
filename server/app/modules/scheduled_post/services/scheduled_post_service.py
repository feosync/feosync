from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from ..models.scheduled_post_model import ScheduledPost
from ..repository.scheduled_post_repository import ScheduledPostRepository as repository
from ..schemas.scheduled_post_schema import ScheduledPostCreate
import httpx

class ScheduledPostService:
    def __init__(self):
        pass
    
    # ─── READ ────────────────────────────────────────────────────────────────

    @staticmethod
    def get_all_by_schedule(db: Session, schedule_id: UUID) -> list[ScheduledPost]:
        return repository.get_all_by_schedule(db=db, scheduled_id=schedule_id)

    @staticmethod
    def get_by_id(db: Session, scheduled_id: UUID) -> ScheduledPost:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return scheduled

    # ─── CREATE ──────────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, scheduled_create: ScheduledPostCreate) -> ScheduledPost:
        scheduled = ScheduledPost(**scheduled_create.model_dump())
        return repository.add_scheduled(db=db, scheduled=scheduled)

    # ─── UPDATE ──────────────────────────────────────────────────────────────

    @staticmethod
    def update(db: Session, scheduled_id: UUID, data: dict) -> ScheduledPost:
        scheduled = repository.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return repository.update_scheduled(db=db, scheduled=scheduled, data=data)

    # ─── DELETE ──────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, scheduled_id: UUID) -> bool:
        scheduled = repository.find_scheduled_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise HTTPException(status_code=404, detail="ScheduledPost introuvable")
        return repository.delete_scheduled(db=db, scheduled=scheduled)

    def add_image_url(self, db:Session, scheduled_id:UUID):
        scheduled = self.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise ValueError("scheduledPost not found")
        return
    
    def generate_image():
        return