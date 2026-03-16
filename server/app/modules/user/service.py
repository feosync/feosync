from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.user.model import User
from app.modules.user.repository import UserRepository
from app.modules.user.schemas import UserUpdate


class UserService:

    @staticmethod
    def get_all(db: Session) -> list[User]:
        return UserRepository.get_all(db)

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