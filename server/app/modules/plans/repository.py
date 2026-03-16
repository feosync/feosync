from .model import Plan
from sqlalchemy.orm import Session
from typing import Optional
from .schemas import  PlanUpdate

class PlanRepository:
    @staticmethod
    def add_plan(db:Session, plan: Plan)->Plan:
        db.add(plan)
        db.commit()
        db.refresh(plan)
        db.close()
        return  plan
    
    # trouver un plan dans la base
    @staticmethod
    def find_plan_by_id(db:Session, plan_id:str)->Optional[Plan]:
        return db.query(Plan).filter(Plan.id==plan_id).first()
    
    @staticmethod
    def get_all_plan(db:Session)->list[Plan]:
        return db.query(Plan).all()
    
    @staticmethod
    def update_plan(db:Session,plan:Plan, data:dict)->Plan:
        for key, value in data.items():
            if hasattr(plan, key):
                setattr(plan, key, value)
        db.commit()
        db.refresh(plan)
        return plan
    
    
    @staticmethod
    def delete_plan(db:Session, plan_id:int)->bool:
        plan = db.query(Plan).filter(Plan.id==plan_id).first()
        if not plan:
            return False
        db.delete(plan)
        db.commit()
        return True