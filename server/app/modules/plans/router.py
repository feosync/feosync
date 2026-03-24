from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user, get_admin_user
from app.modules.user.model import User
from app.modules.user.schemas import UserResponse
from .schemas import PlanCreate, PlanUpdate, PlanResponse
from .service import PlanService

plans_router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@plans_router.get(
    "/",
    response_model=List[PlanResponse],
    summary="Plans disponibles (public)",
    description="Liste les plans actifs — accessible sans authentification",
)
def get_plans(db: Session = Depends(get_db)):
    return PlanService.get_all_public(db)


@plans_router.get(
    "/{plan_id}",
    response_model=PlanResponse,
    summary="Détail d'un plan",
)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    return PlanService.get_by_id(db, plan_id)


# ── Admin ─────────────────────────────────────────────────────────────────────

@plans_router.get(
    "/admin/all",
    response_model=List[PlanResponse],
    summary="[Admin] Tous les plans (actifs + inactifs)",
)
def get_all_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    return PlanService.get_all_admin(db, current_user)


@plans_router.post(
    "/",
    response_model=PlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Créer un plan",
)
def create_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    return PlanService.create(db, payload, current_user)


@plans_router.patch(
    "/{plan_id}",
    response_model=PlanResponse,
    summary="[Admin] Modifier un plan",
)
def update_plan(
    plan_id: int,
    payload: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    return PlanService.update(db, plan_id, payload, current_user)


@plans_router.delete(
    "/{plan_id}",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Supprimer un plan",
    description="Bloqué si des utilisateurs sont sur ce plan — préférer is_active=false",
)
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    return PlanService.delete(db, plan_id, current_user)


# ── User : souscrire ─────────────────────────────────────────────────────────

@plans_router.post(
    "/{plan_id}/subscribe",
    response_model=UserResponse,
    summary="Souscrire à un plan",
    description="L'utilisateur connecté choisit ou change son plan",
)
def subscribe(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PlanService.subscribe(db, plan_id, current_user)


@plans_router.delete(
    "/me/unsubscribe",
    response_model=UserResponse,
    summary="Se désabonner (retour plan gratuit)",
)
def unsubscribe(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PlanService.unsubscribe(db, current_user)