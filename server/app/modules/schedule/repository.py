from sqlalchemy.orm import Session
from .models.schedule_model import Schedule
from uuid import UUID

class ScheduleRepository:
    @staticmethod
    def add_schedule(db: Session, schedule: Schedule):
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
        db.close()
        return  schedule
    
    @staticmethod
    def get_all(db: Session)->list[Schedule]:
        return db.query(Schedule).all()
    
    @staticmethod
    def find_schedule_by_id(db:Session, schedule_id:UUID)->Schedule:
        return db.query(Schedule).filter(Schedule.id ==  schedule_id).first()
    
    @staticmethod
    def update_schedule(db:Session, schedule:Schedule, data:dict)->Schedule:
        for key, value in data.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)
        db.commit()
        db.refresh(schedule)
        return schedule
    @staticmethod
    def delete_schedule(db:Session, schedule:Schedule)->bool:
        db.delete(schedule)
        db.commit()
        db.refresh(schedule)
        return True
    
        