from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.ai_generation.models.ai_generation_model import AiProvider, AiGenerationType


class AiContext(BaseModel):
    user_id: UUID
    user_email: str
    organisation_id: UUID
    organisation_name: str
    organisation_sector: str
    organisation_tone: str
    facebook_page_name: Optional[str] = None


class CaptionRequest(BaseModel):
    topic: str
    language: str = "fr"
    max_length: int = Field(default=280, le=2200)
    additional_instructions: Optional[str] = None


class ImageRequest(BaseModel):
    description: str
    style: str = "professional"


class AiGenerationResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    user_id: UUID
    generation_type: str
    provider: str
    model_used: str
    caption: Optional[str] = None
    image_url: Optional[str] = None
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AiQuotaResponse(BaseModel):
    period: str
    caption_count: int
    image_count: int
    total_tokens: int
    caption_limit: Optional[int] = None
    image_limit: Optional[int] = None

    model_config = {"from_attributes": True}