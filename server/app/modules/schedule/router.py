from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from .schema import ScheduleCreate, ScheduleResponse, ScheduleUpdate
from .service import ScheduleService 
from app.modules.user.user_model import User
from app.modules.auth.dependencies import get_active_user

schedule_router = APIRouter()

@schedule_router.post("/add")
def add_schedule(
    schedule_create:ScheduleCreate,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user)):
    service = ScheduleService()
    return service.add_schedule(db=db, schedule_create=schedule_create)


@schedule_router.get("/")
def get_all(db:Session = Depends(get_db), user:User=Depends(get_active_user))->list[ScheduleResponse]:
    service = ScheduleService()
    return service.get_all(db=db)

@schedule_router.get("/{schedule_id}")
def get_schedule_by_id(schedule_id: UUID, db:Session=Depends(get_db)):
    service = ScheduleService()
    return service.get_schedule_by_id(schedule_id=schedule_id,db=db)


@schedule_router.patch("/update/{schedule_id}")
def update_schedule(
    schedule_update:ScheduleUpdate, 
    schedule_id:UUID, 
    db:Session=Depends(get_db),
    user:User=Depends(get_active_user)):
    service = ScheduleService()
    return service.update_schedule(schedule_id=schedule_id, payload=schedule_update, db=db)

@schedule_router.delete("/delete/{schedule_id}")
def delete_schedule(schedule_id:UUID, db:Session=Depends(get_db)):
    service = ScheduleService()
    return service.delete_schedule(db=db, schedule_id=schedule_id)