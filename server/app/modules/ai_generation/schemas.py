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
    facebook_page_id: Optional[str] = None


class CaptionRequest(BaseModel):
    topic: str
    additional_instructions: Optional[str] = None
    language: str = "fr"
    max_length: int = Field(default=280, le=2200)


class ImageRequest(BaseModel):
    description: str
    style: str = "professional"


class AiSuggestRequest(BaseModel):
    """Utilisé dans PATCH /scheduled/{id}/ai-suggest"""
    topic: str
    generate_caption: bool = True
    generate_image: bool = False
    additional_instructions: Optional[str] = None


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


class AiSuggestionResponse(BaseModel):
    scheduled_post_id: UUID
    suggested_caption: Optional[str] = None
    suggested_image_url: Optional[str] = None
    caption_generation_id: Optional[UUID] = None
    image_generation_id: Optional[UUID] = None


class AiQuotaResponse(BaseModel):
    period: str
    caption_count: int
    image_count: int
    total_tokens: int

    model_config = {"from_attributes": True}