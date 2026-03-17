# app/modules/scheduled_post/schemas.py
from dataclasses import Field

from pydantic import BaseModel
from uuid import UUID
from datetime import UTC, datetime
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus
from typing import Optional


class ScheduledPostResponse(BaseModel):
    id: UUID
    caption: str | None
    content: dict | None
    image_url: str | None
    publish_at: datetime
    status: PostStatus
    post_template_id: UUID | None
    schedule_id: UUID
    model_config = {"from_attributes": True}
    
    
class ScheduledPostUpdate(BaseModel):
    caption: Optional[str] = None          
    content: Optional[dict] = None          
    image_url: Optional[str] = None         
    status: Optional[PostStatus] = None    
    post_template_id: Optional[UUID] = None 
    publish_at: Optional[datetime] = None   



class ScheduledPostCreate(BaseModel):
    schedule_id:UUID
    caption:Optional[str] | None = None
    content: Optional[dict] | None = None
    image_url: Optional[str] | None = None
    status: PostStatus = PostStatus.SCHEDULED
    post_template_id: Optional[UUID] | None = None
    publish_at: datetime = datetime.now(UTC)
    
class generateImageCreate(BaseModel):
    id:int
    
class AiCreate(BaseModel):
    organisation_id: UUID
    prompt_used: str
    model_used: str
    input_data: Optional[dict] = None       # ✅ = None obligatoire
    image_url: Optional[str] = None         # ✅ = None obligatoire
    caption: Optional[str] = None           # ✅ = None obligatoire
    created_at: datetime = datetime.now(UTC)  # ✅ évite le bug de valeur figée

class AiResponse(AiCreate):
    organisation_id: Optional[UUID] = None
    prompt_used: str
    model_used: str
    input_data: Optional[dict] = None       # ✅ = None obligatoire
    image_url: Optional[str] = None         # ✅ = None obligatoire
    caption: Optional[str] = None           # ✅ = None obligatoire
    created_at: datetime = datetime.now(UTC)  # ✅ évite le bug de valeur figée
    output_data: dict
    id: UUID