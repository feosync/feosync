from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


# ------------------------------------------------------------------ #
#  REQUEST — CREATE                                                    #
# ------------------------------------------------------------------ #

class PostAnalyticsCreate(BaseModel):
    """Payload required to record a new analytics snapshot."""

    published_post_id: UUID
    mesured_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Moment at which the metrics were measured.",
    )

    # All metrics are optional — a snapshot may be partial
    reach: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    reactions: Optional[dict]
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    clicks: Optional[int] = Field(None, ge=0)

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
#  REQUEST — BULK CREATE                                               #
# ------------------------------------------------------------------ #

class PostAnalyticsBulkCreate(BaseModel):
    """Payload to create several snapshots in one request."""

    items: list[PostAnalyticsCreate] = Field(..., min_length=1)

    model_config = {"from_attributes": True}



# ------------------------------------------------------------------ #
#  RESPONSE — single record                                            #
# ------------------------------------------------------------------ #

class PostAnalyticsResponse(BaseModel):
    """Full representation of a PostAnalytics record."""

    id: UUID
    published_post_id: UUID
    mesured_at: datetime
    reach: Optional[int]
    impressions: Optional[int]
    reactions: Optional[dict]
    comments: Optional[int]
    shares: Optional[int]
    clicks: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
#  RESPONSE — paginated list                                           #
# ------------------------------------------------------------------ #

class PublishedPostResponse(BaseModel):
    id: UUID
    scheduled_post_id: UUID
    facebook_page_id: UUID
    post_id: Optional[str]
    channel: Optional[str]
    published_at: datetime
    initial_reach: Optional[int]
    initial_impressions: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
    
class PublishedPostResponse(BaseModel):
    id: UUID
    scheduled_post_id: UUID
    facebook_page_id: UUID
    post_id: Optional[str]
    channel: Optional[str]
    published_at: datetime
    initial_reach: Optional[int]
    initial_impressions: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}



# 🔹 value des réactions (like, love, etc.)
class ReactionValue(BaseModel):
    like: Optional[int] = 0
    love: Optional[int] = 0
    wow: Optional[int] = 0
    haha: Optional[int] = 0
    sad: Optional[int] = 0
    angry: Optional[int] = 0


# 🔹 chaque entrée dans values[]
class InsightValue(BaseModel):
    value: ReactionValue
    end_time: Optional[datetime] = None


# 🔹 chaque bloc (day, week, etc.)
class InsightItem(BaseModel):
    name: str
    period: str
    values: List[InsightValue]
    title: Optional[str] = None
    description: Optional[str] = None
    id: str


# 🔹 pagination
class Paging(BaseModel):
    previous: Optional[str] = None


# 🔹 réponse complète
class PageInsightsResponse(BaseModel):
    data: List[InsightItem]
    paging: Optional[Paging] = None
    
    
#======================SCHEMA ENGAGEMENT===========================

