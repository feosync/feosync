from fastapi import APIRouter, Depends
from app.core.database import get_db
from sqlalchemy.orm import Session
from typing import List
from .schemas import PlanCreate, PlanResponse, PlanUpdate
from .service import PlanService as plan_service
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User

plans_router = APIRouter()


@plans_router.get("/plans")
async def get_plans():
    return {"message": "List of plans"} 

@plans_router.post("/add")
def add_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    user: User =Depends(get_active_user)):
    service = plan_service()
    return service.add_plan(plan, db)

@plans_router.get("/find/{plan_id}")
def find_plan_by_id(
    plan_id: str,
    db:Session = Depends(get_db),
    user: User =Depends(get_active_user)
    )->PlanResponse:
    service = plan_service()
    return service.find_plan_by_id(db, plan_id)

@plans_router.get("/all")
def get_all_plan(db:Session=Depends(get_db), user: User =Depends(get_active_user))->List[PlanResponse]:
    service = plan_service()
    return service.get_all_plan(db)

@plans_router.delete("/delete/{plan_id}")
def delete_plan(plan_id: int, db:Session=Depends(get_db), user: User =Depends(get_active_user))->dict:
    service = plan_service()
    return service.delete_plan(db, plan_id)

@plans_router.patch("/update")
def update_plan(data:PlanUpdate, plan_id:int, db:Session=Depends(get_db),user: User =Depends(get_active_user) )->PlanResponse:
    service = plan_service()
    return service.update_plan(db=db, plan_id=plan_id, payload=data)