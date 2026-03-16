from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
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

@user_router.get(
    "/",
    response_model=list[UserSummary],
    summary="Lister tous les utilisateurs",
)
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.get_all(db)


@user_router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Détail d'un utilisateur",
)
async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return UserService.get_by_id(db, user_id)