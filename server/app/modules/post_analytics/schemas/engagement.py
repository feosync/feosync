from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# 🔹 chaque valeur (par date)
class EngagementValue(BaseModel):
    value: int
    end_time: datetime


# 🔹 bloc (day, week, days_28)
class EngagementItem(BaseModel):
    name: str
    period: str
    values: List[EngagementValue]
    title: Optional[str] = None
    description: Optional[str] = None
    id: str


# 🔹 pagination
class Paging(BaseModel):
    previous: Optional[str] = None


# 🔹 réponse complète
class PagePostEngagementsResponse(BaseModel):
    data: List[EngagementItem]
    paging: Optional[Paging] = None