from fastapi import APIRouter, Depends
from app.core.database import get_db
from sqlalchemy.orm import Session
from .schema import PlanInputOutput
from .plan_repository import PlanRepository as plan_repository
from app.modules.auth.dependencies import get_active_user
from app.modules.user.user_model import User

plans_router = APIRouter()
@plans_router.get("/plans")
async def get_plans():
    return {"message": "List of plans"} 

@plans_router.post("/add")
def add_plan(
    plan: PlanInputOutput,
    db: Session = Depends(get_db),
    user: User =Depends(get_active_user)):
    return  plan_repository.add_plan(plan, db)