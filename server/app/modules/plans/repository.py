from sqlalchemy.orm import Session
from typing import Optional
from .model import Plan


class PlanRepository:

    @staticmethod
    def create(db: Session, data: dict) -> Plan:
        plan = Plan(**data)
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def get_by_id(db: Session, plan_id: int) -> Optional[Plan]:
        return db.query(Plan).filter(Plan.id == plan_id).first()

    @staticmethod
    def get_all(db: Session, active_only: bool = False) -> list[Plan]:
        q = db.query(Plan)
        if active_only:
            q = q.filter(Plan.is_active == True)
        return q.order_by(Plan.price).all()

    @staticmethod
    def update(db: Session, plan: Plan, data: dict) -> Plan:
        for key, value in data.items():
            if hasattr(plan, key):
                setattr(plan, key, value)
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def delete(db: Session, plan: Plan) -> None:
        db.delete(plan)
        db.commit()