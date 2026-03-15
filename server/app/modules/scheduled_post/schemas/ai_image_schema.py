# schemas/scheduled_post_ai_image.py
from pydantic import BaseModel, UUID4, HttpUrl
from datetime import datetime
from uuid import UUID
from typing import Optional


# --- CRÉATION ---
class ScheduledPostAiImageCreate(BaseModel):
    scheduled_post_id: UUID4
    ai_gen_id: UUID4
    image_url: str  # HttpUrl si tu veux valider le format URL


# --- RÉPONSE ---
class ScheduledPostAiImageResponse(BaseModel):
    id: UUID4
    scheduled_post_id: UUID4
    ai_gen_id: UUID4
    image_url: str
    is_active: bool
    linked_at: datetime
    replaced_at: datetime | None

    model_config = {"from_attributes": True}

# ---------------RESPONSE MODEL OF TEH SCHEDULE ----------------
class ScheduledResponse(BaseModel):
    id:UUID
    organisation_id: Optional[UUID] 
    name: str
    chanels: list[str]
    page_ids:dict
    cron_expression: str
    post_template_id: str | None
    data_source_config: dict 
    last_run_at: datetime
    next_run_at: datetime
    is_active: bool 
    

    
    