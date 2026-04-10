from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.plans.schemas import PlanResponse 

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
    plan: Optional[PlanResponse] = None        # plan complet
    org_count: int = 0                         # nb orgs actuelles
    post_month_count: int = 0                  # nb posts ce mois 
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