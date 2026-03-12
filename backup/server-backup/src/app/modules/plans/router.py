"""Plans endpoints."""
from fastapi import APIRouter

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.plans.service import PlanResponse, PlanService

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("", response_model=list[PlanResponse])
async def list_plans(db: DbSession) -> list[PlanResponse]:
    plans = await PlanService(db).list_plans()
    return [PlanResponse.model_validate(p) for p in plans]


@router.get("/current", response_model=PlanResponse | None)
async def get_current_plan(current_user: CurrentUser, db: DbSession) -> PlanResponse | None:
    plan = await PlanService(db).get_user_plan(current_user)
    if not plan:
        return None
    return PlanResponse.model_validate(plan)
