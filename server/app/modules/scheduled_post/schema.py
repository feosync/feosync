# app/modules/scheduled_post/schemas.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.modules.scheduled_post.models.post_status import post_status
from typing import Optional
class ScheduledPostResponse(BaseModel):
    id: UUID
    caption: str
    content: dict
    image_url: str | None
    publish_at: datetime
    status: post_status
    post_template_id: UUID | None
    ai_generation_id: UUID | None
    schedule_id: UUID
    model_config = {"from_attributes": True}
    

class ScheduledPostUpdate(BaseModel):
    caption: Optional[str] | None
    content: Optional[dict] | None
    image_url: Optional[str] | None
    status: post_status = post_status.SCHEDULED
    post_template_id: Optional[UUID] | None# app/modules/scheduled_post/schemas.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.modules.scheduled_post.models.post_status import post_status
from typing import Optional
class ScheduledPostResponse(BaseModel):
    id: UUID
    caption: str
    content: dict
    image_url: str | None
    publish_at: datetime
    status: post_status
    post_template_id: UUID | None
    ai_generation_id: UUID | None
    schedule_id: UUID
    model_config = {"from_attributes": True}
    
    
class ScheduledPostUpdate(BaseModel):
    caption: Optional[str] = None          
    content: Optional[dict] = None          
    image_url: Optional[str] = None         
    status: Optional[post_status] = None    
    post_template_id: Optional[UUID] = None 
    ai_generation_id: Optional[UUID] = None 
    publish_at: Optional[datetime] = None   



class ScheduledPostCreate(BaseModel):
    schedule_id:UUID
    caption:str 
    content: dict
    image_url: Optional[str] | None
    status: post_status = post_status.SCHEDULED
    post_template_id: Optional[UUID] | None
    ai_generation_id: Optional[UUID] | None
    publish_at: datetime
    ai_generation_id: Optional[UUID] | None
    publish_at: Optional[datetime] | None



class ScheduledPostCreate(BaseModel):
    schedule_id:UUID
    caption:str 
    content: dict
    image_url: Optional[str] | None
    status: post_status = post_status.SCHEDULED
    post_template_id: Optional[UUID] | None
    ai_generation_id: Optional[UUID] | None
    publish_at: datetime