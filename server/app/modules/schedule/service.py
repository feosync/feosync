from .schema import ScheduleCreate, ScheduleUpdate
from sqlalchemy.orm import Session
from .models.schedule_model import Schedule
from .repository import ScheduleRepository as schedule_repository
from  app.modules.organisations.service import OrganisationService as organisation_service
from uuid import UUID

class ScheduleService:
    def __init__(self):
        pass
    
    def add_schedule(self, db:Session, schedule_create: ScheduleCreate)->Schedule:
        schedule = Schedule(**schedule_create.model_dump())
        return schedule_repository.add_schedule(schedule=schedule, db=db)
    
    def get_all(self, db:Session)->list[Schedule]:
        return schedule_repository.get_all(db=db)

    def find_schedule_by_id(self, db:Session, schedule_id:UUID)->Schedule:
        return schedule_repository.find_schedule_by_id(schedule_id=schedule_id, db=db)

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
