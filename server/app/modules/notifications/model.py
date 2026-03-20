from __future__ import annotations
from sqlalchemy import String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.base import Base
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    POST_PUBLISHED   = "post_published"
    POST_FAILED      = "post_failed"
    INSIGHTS_UPDATED = "insights_updated"
    TOKEN_EXPIRING   = "token_expiring"
    WELCOME          = "welcome"
    SCHEDULE_CREATED = "schedule_created"


class NotificationChannel(str, Enum):
    IN_APP = "in_app"
    EMAIL  = "email"
    BOTH   = "both"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type", native_enum=False),
        nullable=False
    )
    channel: Mapped[NotificationChannel] = mapped_column(
        SAEnum(NotificationChannel, name="notification_channel", native_enum=False),
        nullable=False,
        default=NotificationChannel.BOTH
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="notifications")