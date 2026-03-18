from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus, ImageSource


# ── CREATE ────────────────────────────────────────────────────────────────────

class ScheduledPostCreate(BaseModel):
    """
    Minimum requis pour créer un post.
    org_id déduit depuis facebook_page_id en service.
    Status = DRAFT automatiquement.
    """
    facebook_page_id: UUID          # org_id déduit depuis la page
    publish_at: Optional[datetime] = None
    caption: Optional[str] = None   # optionnel au create
    post_template_id: Optional[UUID] = None


# ── PATCH caption ─────────────────────────────────────────────────────────────

class CaptionPatchRequest(BaseModel):
    """
    mode=manual → text obligatoire
    mode=llm    → topic obligatoire
    """
    mode: Literal["manual", "llm"]
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "fr"
    max_length: int = Field(default=280, le=2200)
    additional_instructions: Optional[str] = None

    @model_validator(mode="after")
    def check_required_fields(self):
        if self.mode == "manual" and not self.text:
            raise ValueError("text requis en mode manual")
        if self.mode == "llm" and not self.topic:
            raise ValueError("topic requis en mode llm")
        return self


# ── PATCH image ───────────────────────────────────────────────────────────────

class ImagePatchRequest(BaseModel):
    """
    mode=url    → url obligatoire
    mode=llm    → description obligatoire
    mode=upload → géré via multipart (endpoint séparé)
    """
    mode: Literal["url", "llm"]
    url: Optional[str] = None
    description: Optional[str] = None
    style: str = "professional"

    @model_validator(mode="after")
    def check_required_fields(self):
        if self.mode == "url" and not self.url:
            raise ValueError("url requise en mode url")
        if self.mode == "llm" and not self.description:
            raise ValueError("description requise en mode llm")
        return self


# ── PATCH confirm ─────────────────────────────────────────────────────────────

class ConfirmRequest(BaseModel):
    """
    Optionnel : permet de changer publish_at au moment de confirmer.
    Tout le reste est déjà dans le post.
    """
    publish_at: Optional[datetime] = None


# ── RESPONSE ──────────────────────────────────────────────────────────────────

class ScheduledPostResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    page_ids: dict
    caption: Optional[str] = None
    image_url: Optional[str] = None
    image_source: Optional[ImageSource] = None
    publish_at: Optional[datetime] = None
    status: PostStatus
    post_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaptionPatchResponse(BaseModel):
    scheduled_post: ScheduledPostResponse
    caption: str
    ai_generation_id: Optional[UUID] = None  # None si mode=manual


class ImagePatchResponse(BaseModel):
    scheduled_post: ScheduledPostResponse
    image_url: str
    image_source: ImageSource
    ai_generation_id: Optional[UUID] = None  # None si mode=url