from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


# ── OAuth ─────────────────────────────────────────────────────────────────────

class FacebookOAuthURL(BaseModel):
    oauth_url: str


class MetaPageItem(BaseModel):
    """Page disponible sur le compte Meta de l'utilisateur"""
    id: str
    name: str
    access_token: str


class FacebookOAuthCallbackResponse(BaseModel):
    org_id: UUID
    available_pages: list[MetaPageItem]
    instruction: str = "Choisissez une page et appelez POST /connect"


# ── Connect ───────────────────────────────────────────────────────────────────

class FacebookPageConnect(BaseModel):
    org_id: UUID
    fb_page_id: str
    page_name: str
    access_token: str


# ── Responses ─────────────────────────────────────────────────────────────────

class FacebookPageResponse(BaseModel):
    id: UUID
    fb_page_id: str
    page_name: str
    is_active: bool
    token_expires_at: Optional[datetime] = None
    last_sync_at: Optional[datetime] = None
    organisation_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PageInsightsResponse(BaseModel):
    id: UUID
    fb_page_id: UUID
    date: datetime
    fans_total: int
    impressions_unique: int
    engaged_users: int
    new_followers: int
    created_at: datetime

    model_config = {"from_attributes": True}