from __future__ import annotations
from uuid import UUID, uuid4
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base




class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    
    # Google OAuth fields
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    google_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign key and relationship to Plan
    plan_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("plans.id"))
    plan = relationship("Plan", foreign_keys=[plan_id])

    # un utilisateur peut avoir plusieurs organisations
    organisations: Mapped[list["Organisation"]] = relationship(
        "Organisation", back_populates="user"
    )

    refresh_tokens: Mapped[list["FreshToken"]] = relationship(
        "FreshToken", back_populates="user", cascade="all, delete-orphan"
    )

    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )