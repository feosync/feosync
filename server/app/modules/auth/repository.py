"""
User Repository - Database operations for users
"""
from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.user.user_model import User


class UserRepository:
    """Repository for user database operations"""

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_google_id(db: Session, google_id: str) -> User | None:
        """Get user by Google ID"""
        return db.query(User).filter(User.google_id == google_id).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> User | None:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(
        db: Session,
        name: str,
        email: str,
        google_id: str,
        profile_picture: str | None = None,
    ) -> User:
        """Create a new user"""
        user = User(
            name=name,
            email=email,
            google_id=google_id,
            google_email=email,
            profile_picture=profile_picture,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user: User, **kwargs) -> User:
        """Update user fields"""
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def deactivate_user(db: Session, user_id: UUID) -> bool:
        """Deactivate user account"""
        user = UserRepository.get_user_by_id(db, user_id)
        if user:
            user.is_active = False
            db.commit()
            return True
        return False
