from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus


class ScheduledPostCreate(BaseModel):
    organisation_id: UUID
    page_ids: dict[str, str]
    caption: Optional[str] = None
    content: Optional[dict] = None
    image_url: Optional[str] = None
    post_template_id: Optional[UUID] = None
    publish_at: Optional[datetime] = None
    status: PostStatus = PostStatus.SCHEDULED


class ScheduledPostUpdate(BaseModel):
    caption: Optional[str] = None
    content: Optional[dict] = None
    image_url: Optional[str] = None
    status: Optional[PostStatus] = None
    post_template_id: Optional[UUID] = None
    publish_at: Optional[datetime] = None
    page_ids: Optional[dict[str, str]] = None


class ScheduledPostAiPatchRequest(BaseModel):
    """PATCH /{id}/ai-suggest — génère caption et/ou image via IA"""
    org_id: UUID
    topic: str
    generate_caption: bool = True
    generate_image: bool = False
    additional_instructions: Optional[str] = None
    page_id: Optional[UUID] = None  # contexte page optionnel


class ScheduledPostResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    page_ids: dict
    caption: Optional[str] = None
    content: Optional[dict] = None
    image_url: Optional[str] = None
    publish_at: Optional[datetime] = None
    status: PostStatus
    post_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScheduledPostAiPatchResponse(BaseModel):
    """Réponse du PATCH /{id}/ai-suggest"""
    scheduled_post: ScheduledPostResponse
    generated_caption: Optional[str] = None
    generated_image_url: Optional[str] = None
    caption_generation_id: Optional[UUID] = None
    image_generation_id: Optional[UUID] = None