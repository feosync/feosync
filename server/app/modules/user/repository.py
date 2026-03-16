from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.user.model import User


class UserRepository:

    @staticmethod
    def get_all(db: Session) -> list[User]:
        return db.query(User).order_by(User.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_google_id(db: Session, google_id: str) -> User | None:
        return db.query(User).filter(User.google_id == google_id).first()

    @staticmethod
    def update(db: Session, user: User, data: dict) -> User:
        for key, value in data.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def deactivate(db: Session, user_id: UUID) -> User | None:
        user = UserRepository.get_by_id(db, user_id)
        if user:
            user.is_active = False
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: UUID) -> bool:
        user = UserRepository.get_by_id(db, user_id)
        if user:
            db.delete(user)
            db.commit()
            return True
        return False