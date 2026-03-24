from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# 🔹 chaque valeur (peut ne pas avoir end_time)
class FollowValue(BaseModel):
    value: int
    end_time: Optional[datetime] = None


# 🔹 bloc (lifetime, day, week, days_28)
class FollowItem(BaseModel):
    name: str
    period: str
    values: List[FollowValue]
    title: Optional[str] = None
    description: Optional[str] = None
    id: str


# 🔹 pagination
class Paging(BaseModel):
    previous: Optional[str] = None


# 🔹 réponse complète
class PageFollowsResponse(BaseModel):
    data: List[FollowItem]
    paging: Optional[Paging] = None