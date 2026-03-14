from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.post_template.model import SectorEnum


# ── Create ────────────────────────────────────────────────────────────────────

class PostTemplateCreate(BaseModel):
    """Création manuelle par une organisation"""
    name: str
    description: Optional[str] = None
    asset_url: str
    sector: SectorEnum
    organisation_id: UUID


class PostTemplateCreateFromAI(BaseModel):
    """Création depuis une génération IA existante"""
    name: str
    asset_url: str               # l'user fournit l'image
    sector: SectorEnum
    organisation_id: UUID
    ai_generation_id: UUID       # lié à une AiGeneration existante


class PostTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    asset_url: Optional[str] = None
    sector: Optional[SectorEnum] = None


# ── Response ──────────────────────────────────────────────────────────────────

class PostTemplateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    asset_url: str
    sector: SectorEnum
    usage_count: int
    is_app_template: bool
    organisation_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}