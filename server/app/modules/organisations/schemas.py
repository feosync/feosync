from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.organisations.model import ToneEnum, SectorEnum


class OrganisationCreate(BaseModel):
    name: str
    description: str
    logo_url: Optional[str] = None
    tone: ToneEnum
    sector: SectorEnum
    brand_color: Optional[str] = None


class OrganisationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    tone: Optional[ToneEnum] = None
    sector: Optional[SectorEnum] = None
    brand_color: Optional[str] = None


class OrganisationResponse(BaseModel):
    id: UUID
    name: str
    description: str
    logo_url: Optional[str]
    tone: ToneEnum
    sector: SectorEnum
    brand_color: Optional[str]
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True