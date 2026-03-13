from .schema import PlanInputOutput
from .plan_model import Plan
from sqlalchemy.orm import Session
class PlanRepository:
    @staticmethod
    def add_plan(plan_in: PlanInputOutput, db: Session)->PlanInputOutput:
        plan = Plan(
             name=plan_in.name,
             price=plan_in.price,
             features=plan_in.features,
             max_page=plan_in.max_page,
             max_post_month=plan_in.max_post_month,
             max_ai_gen=plan_in.max_ai_gen
             
             
         )
        return plan_in