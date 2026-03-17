from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime, timezone
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus
from typing import Optional


class ScheduledPostCreate(BaseModel):
    organisation_id: UUID
    page_ids: dict[str, UUID]     # ✅ {"facebook": UUID, "whatsapp": UUID}
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
    page_ids: Optional[dict[str, UUID]] = None


class ScheduledPostResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    page_ids: dict[str, str]      # ✅ {"facebook": "uuid-str", ...}
    caption: Optional[str] = None
    content: Optional[dict] = None
    image_url: Optional[str] = None
    publish_at: Optional[datetime] = None
    status: PostStatus
    post_template_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


# ─── AI ──────────────────────────────────────────────────────────────────────

class AiCreate(BaseModel):
    organisation_id: UUID
    prompt_used: str
    model_used: str
    input_data: Optional[dict] = None
    image_url: Optional[str] = None
    caption: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class AiResponse(BaseModel):
    id: UUID
    organisation_id: UUID
    prompt_used: str
    model_used: str
    input_data: Optional[dict] = None
    output_data: Optional[dict] = None
    image_url: Optional[str] = None
    caption: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}