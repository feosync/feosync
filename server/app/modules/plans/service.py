from .schemas import PlanCreate, PlanResponse, PlanUpdate
from .repository import PlanRepository  as plan_repository
from .model import Plan

from sqlalchemy.orm import Session

class PlanService:
    def __init__(self):
         pass      
     
    def add_plan(self, plan_create: PlanCreate, db: Session)->Plan:
            plan = Plan(**plan_create.model_dump())
            return plan_repository.add_plan(db, plan=plan)
        
        
    def find_plan_by_id(self, db:Session, plan_id:str)->Plan:
        return plan_repository.find_plan_by_id(db=db, plan_id=plan_id)
    
     
    def update_plan(self, db:Session, plan_id:int, payload:PlanUpdate)->Plan:
        plan = self.find_plan_by_id(db, plan_id)
        if not plan:
            raise ValueError("plan not found")
        return plan_repository.update_plan(db=db, plan=plan, data=payload.model_dump(exclude_unset=True))
        
    def get_all_plan(self, db:Session)->list[Plan]:
        plans = plan_repository.get_all_plan(db=db)
        return plans
    
    def delete_plan(self, db:Session, plan_id:int)->Plan:
        plan = self.find_plan_by_id(db, plan_id)
        if not plan:
            raise ValueError("plan not found")
        success = plan_repository.delete_plan(db=db, plan_id=plan_id)
        if success:
            return {"message": "Plan deleted successfully", "plan_id": plan_id}
        else:
            raise ValueError("Failed to delete plan")