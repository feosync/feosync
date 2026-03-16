from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.notifications.model import NotificationType, NotificationChannel


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    type: NotificationType
    channel: NotificationChannel
    is_read: bool
    email_sent: bool
    created_at: datetime
    user_id: UUID

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: UUID
    title: str
    message: str
    type: NotificationType
    channel: NotificationChannel = NotificationChannel.BOTH


class NotificationSummary(BaseModel):
    total: int
    unread: int