from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class PublishedPostCreate(BaseModel):
    scheduled_post_id: UUID
    facebook_page_id: UUID
    post_id: Optional[str] = None
    meta_permalink: Optional[str] = None
    channel: Optional[str] = "facebook"
    image_count: int = 0
    published_at: datetime
    initial_reach: Optional[int] = 0
    initial_impressions: Optional[int] = 0


class PublishedPostResponse(BaseModel):
    id: UUID
    scheduled_post_id: UUID
    facebook_page_id: UUID
    post_id: Optional[str]
    meta_permalink: Optional[str]
    channel: Optional[str]
    image_count: int
    published_at: datetime
    initial_reach: Optional[int]
    initial_impressions: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PublishedPostWithAnalytics(PublishedPostResponse):
    post_analytics: list = []
    model_config = {"from_attributes": True}


class ManualPublishRequest(BaseModel):
    scheduled_post_id: UUID