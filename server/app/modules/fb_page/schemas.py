from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


# ── OAuth ─────────────────────────────────────────────────────────────────────

class FacebookOAuthURL(BaseModel):
    """URL de redirection vers Meta OAuth"""
    oauth_url: str


class FacebookOAuthCallback(BaseModel):
    """Code reçu après OAuth Meta"""
    code: str
    org_id: UUID


class MetaPage(BaseModel):
    """Page Facebook disponible sur le compte Meta"""
    id: str
    name: str
    access_token: str


class FacebookPageConnect(BaseModel):
    """Données pour connecter une page spécifique"""
    fb_page_id: str
    page_name: str
    access_token: str
    org_id: UUID


# ── Responses ─────────────────────────────────────────────────────────────────

class FacebookPageResponse(BaseModel):
    id: UUID
    fb_page_id: str
    page_name: str
    is_active: bool
    token_expires_at: Optional[datetime]
    last_sync_at: Optional[datetime]
    organisation_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageInsightsCreate(BaseModel):
    date: datetime
    fans_total: int = 0
    impressions_unique: int = 0
    engaged_users: int = 0
    new_followers: int = 0


class PageInsightsResponse(PageInsightsCreate):
    id: UUID
    fb_page_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True