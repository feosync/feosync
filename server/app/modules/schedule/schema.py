from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ScheduleCreate(BaseModel):
    organisation_id: UUID
    name: str
    chanels: list[str]
    page_ids:dict
    cron_expression: str
    post_template_id: str | None
    data_source_config: dict 
    last_run_at: datetime
    next_run_at: datetime
    is_active: bool 
    
    
class ScheduleResponse(ScheduleCreate):
    id: UUID
    class Config:
        from_attributes=True

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    chanels: list[str] = None
    page_ids:dict = None
    cron_expression: Optional[str] = None
    post_template_id: Optional[UUID] = None
    data_source_config: Optional[dict] = None
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    is_active: Optional[bool] = None