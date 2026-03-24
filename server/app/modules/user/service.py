from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.user.model import User
from app.modules.user.repository import UserRepository
from app.modules.user.schemas import UserUpdate
from app.shared.pagination.paginator import PaginationParams


class UserService:

    @staticmethod
    def get_all(db: Session, params: PaginationParams, search: str | None = None) -> tuple[list[User], int]:
        return UserRepository.get_all_paginated(db, params, search=search)

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> User:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def get_me(db: Session, current_user: User) -> User:
        return current_user

    @staticmethod
    def update_me(db: Session, current_user: User, payload: UserUpdate) -> User:
        return UserRepository.update(
            db, current_user, payload.model_dump(exclude_unset=True)
        )

    @staticmethod
    def deactivate_me(db: Session, current_user: User) -> dict:
        UserRepository.deactivate(db, current_user.id)
        return {"detail": "Account deactivated successfully"}

    @staticmethod
    def delete_me(db: Session, current_user: User) -> dict:
        UserRepository.delete(db, current_user.id)
        return {"detail": "Account deleted successfully"}
    
    @staticmethod
    def admin_delete(db: Session, user_id: UUID) -> dict:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        UserRepository.delete(db, user_id)
        return {"detail": f"Utilisateur {user.email} supprimé"}


    @staticmethod
    def set_admin(db: Session, user_id: UUID, is_admin: bool) -> dict:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        UserRepository.update(db, user, {"is_admin": is_admin})
        action = "promu admin" if is_admin else "rétrogradé utilisateur"
        return {"detail": f"Utilisateur {user.email} {action}"}