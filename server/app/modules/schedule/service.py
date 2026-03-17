from sqlalchemy.orm import Session

# ======================SCHEMA OR MODEL============================
from .schema import ScheduleCreate, ScheduleUpdate
from app.modules.scheduled_post.schemas.scheduled_post_schema import ScheduledPostCreate
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost, PostStatus
from .model import Schedule

# ================= SERVICE AND REPOSITORY===========================
from .repository import ScheduleRepository as schedule_repository
from  app.modules.organisations.service import OrganisationService as organisation_service
from app.modules.scheduled_post.services.scheduled_post_service import ScheduledPostService as scheduled_service
# ======================TYPE===============================================

from uuid import UUID

class ScheduleService:
    def __init__(self):
        pass
    
    async def add_schedule(self, db:Session, schedule_create: ScheduleCreate)->Schedule:
        schedule = Schedule(**schedule_create.model_dump())
        return schedule_repository.add_schedule(schedule=schedule, db=db)
    
    async def create_scheduled_post(self, db:Session, schedule_create: ScheduleCreate)->tuple[Schedule,ScheduledPost]:
        schedule = await self.add_schedule(db=db, schedule_create=schedule_create)
        if not schedule:
            raise ValueError("Schedule not create")
        
        scheduled_post = ScheduledPostCreate(
            schedule_id=schedule.id,
            status=PostStatus.SCHEDULED
        )
        scheduled = scheduled_service.create(db=db, scheduled_create=scheduled_post)
        return schedule, scheduled
    
    
    def get_all(self, db:Session)->list[Schedule]:
        return schedule_repository.get_all(db=db)

    def get_schedule_by_id(self, db:Session, schedule_id:UUID)->Schedule:
        return schedule_repository.get_schedule_by_id(schedule_id=schedule_id, db=db)

    def update_schedule(self, db:Session,schedule_id, payload: ScheduleUpdate)->Schedule:
        schedule = self.find_schedule_by_id(schedule_id=schedule_id, db=db)
        if not schedule:
            raise ValueError("schedule not found")
        return schedule_repository.update_schedule(
            db=db,schedule=schedule,
            data=payload.model_dump(exclude_unset=True))
    def delete_schedule(self, db:Session, schedule_id:UUID):
        schedule = self.find_schedule_by_id(db=db, schedule_id=schedule_id)
        if not schedule:
            return False
        return schedule_repository.delete_schedule(db=db,schedule=schedule)
