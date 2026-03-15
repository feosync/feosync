from pydantic import BaseModel
from typing import Union


from uuid import UUID
from typing import Optional
from datetime import datetime

class  AiCreate(BaseModel):
    organisation_id: UUID
    input_data: Optional[dict]
    prompt_used: str
    model_used: str
    image_url: Optional[str]
    caption: Optional[str]
    created_at: datetime = datetime.now()
    
class AiResponse(AiCreate):
    output_data: dict | str
    id: UUID

    