from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class PublishedPostCreate(BaseModel):
    """Créé automatiquement par le scheduler après publication Meta"""
    scheduled_post_id: UUID
    facebook_page_id: UUID
    post_id: Optional[str] = None       # ID retourné par Meta
    channel: Optional[str] = "facebook"
    published_at: datetime
    initial_reach: Optional[int] = 0
    initial_impressions: Optional[int] = 0


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


class PublishedPostWithAnalytics(PublishedPostResponse):
    """Réponse enrichie avec analytics"""
    post_analytics: list = []

    model_config = {"from_attributes": True}


class ManualPublishRequest(BaseModel):
    """Publication manuelle d'un scheduled post"""
    scheduled_post_id: UUID
    facebook_page_id: UUID