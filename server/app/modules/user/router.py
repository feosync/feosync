from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user, get_admin_user
from app.modules.user.model import User
from app.modules.user.schemas import UserResponse, UserUpdate, UserSummary
from app.modules.user.service import UserService

user_router = APIRouter()


# ── Mon profil ────────────────────────────────────────────────────────────────

@user_router.get(
    "/me",
    response_model=UserResponse,
    summary="Mon profil",
)
async def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.get_me(db, current_user)


@user_router.patch(
    "/me",
    response_model=UserResponse,
    summary="Modifier mon profil",
)
async def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.update_me(db, current_user, payload)


@user_router.patch(
    "/me/deactivate",
    status_code=status.HTTP_200_OK,
    summary="Désactiver mon compte",
)
async def deactivate_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.deactivate_me(db, current_user)


@user_router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Supprimer mon compte",
)
async def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.delete_me(db, current_user)


# ── Admin ─────────────────────────────────────────────────────────────────────

admin_user_router = APIRouter(dependencies=[Depends(get_admin_user)])

@admin_user_router.get(
    "/",
    response_model=list[UserSummary],
    summary="Lister tous les utilisateurs (Admin)",
)
async def get_all_users(db: Session = Depends(get_db)):
    return UserService.get_all(db)


@admin_user_router.patch(
    "/{user_id}/promote",
    status_code=status.HTTP_200_OK,
    summary="Promouvoir un utilisateur en admin",
)
async def promote_user(user_id: UUID, db: Session = Depends(get_db)):
    return UserService.set_admin(db, user_id, True)


@admin_user_router.patch(
    "/{user_id}/demote",
    status_code=status.HTTP_200_OK,
    summary="Rétrograder un admin en utilisateur",
)
async def demote_user(user_id: UUID, db: Session = Depends(get_db)):
    return UserService.set_admin(db, user_id, False)


@admin_user_router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Détail d'un utilisateur (Admin)",
)
async def get_user(user_id: UUID, db: Session = Depends(get_db)):
    return UserService.get_by_id(db, user_id)


@admin_user_router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer un utilisateur (Admin)",
)
async def admin_delete_user(user_id: UUID, db: Session = Depends(get_db)):
    return UserService.admin_delete(db, user_id)