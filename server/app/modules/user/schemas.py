from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_admin: Optional[bool] = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    google_id: Optional[str]
    google_email: Optional[str]
    profile_picture: Optional[str]
    is_active: bool
    is_admin: bool
    plan_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    profile_picture: Optional[str]
    plan_id: Optional[int]
    is_active: bool
    is_admin: bool

    model_config = {"from_attributes": True}