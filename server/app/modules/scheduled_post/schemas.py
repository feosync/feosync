from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal

from app.modules.scheduled_post.models.scheduled_post_model import PostStatus, ImageSource


# ── CREATE ────────────────────────────────────────────────────────────────────

class ScheduledPostCreate(BaseModel):
    facebook_page_id: UUID
    publish_at: Optional[datetime] = None
    caption: Optional[str] = None
    post_template_id: Optional[UUID] = None
    qstash_message_id: Optional[str] = None


# ── PATCH caption ─────────────────────────────────────────────────────────────

class CaptionPatchRequest(BaseModel):
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


# ── PATCH / ADD image ─────────────────────────────────────────────────────────

class ImagePatchRequest(BaseModel):
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


# ── REORDER ───────────────────────────────────────────────────────────────────

class ReorderRequest(BaseModel):
    ordered_ids: list[UUID]


# ── CONFIRM ───────────────────────────────────────────────────────────────────

class ConfirmRequest(BaseModel):
    publish_at: Optional[datetime] = None
    qstash_message_id: Optional[str] = None


# ── RESPONSES ─────────────────────────────────────────────────────────────────

class ScheduledPostImageResponse(BaseModel):
    id: UUID
    image_url: str
    image_source: ImageSource
    position: int
    ai_generation_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_image(cls, img) -> "ScheduledPostImageResponse":
        return cls(
            id=img.id,
            image_url=img.image_url,
            image_source=img.image_source,
            position=img.position,
            ai_generation_id=img.ai_gen_id,
            created_at=img.created_at,
        )


class ScheduledPostResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    page_ids: dict
    caption: Optional[str] = None
    images: list[ScheduledPostImageResponse] = []
    publish_at: Optional[datetime] = None
    status: PostStatus
    post_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    qstash_message_id: Optional[str] = None

    model_config = {"from_attributes": True}


class CaptionPatchResponse(BaseModel):
    scheduled_post: ScheduledPostResponse
    caption: str
    ai_generation_id: Optional[UUID] = None


class AddImageResponse(BaseModel):
    scheduled_post: ScheduledPostResponse
    image: ScheduledPostImageResponse
    ai_generation_id: Optional[UUID] = None