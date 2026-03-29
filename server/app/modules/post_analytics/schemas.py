from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, computed_field, Field

# ── Schemas CRUD ───────────────────────────────────────────────────────────────
class PostAnalyticsCreate(BaseModel):
    published_post_id: UUID
    mesured_at: datetime = Field(default_factory=datetime.utcnow)
    reach: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    reactions: Optional[dict] = None
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    clicks: Optional[int] = Field(None, ge=0)

    model_config = {"from_attributes": True}


class PostAnalyticsResponse(BaseModel):
    id: UUID
    published_post_id: UUID
    mesured_at: datetime
    reach: Optional[int] = None
    impressions: Optional[int] = None
    reactions: Optional[dict] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    clicks: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Schemas Meta bruts (conservés pour les endpoints individuels) ─────────────

class ReactionValue(BaseModel):
    like: int = 0
    love: int = 0
    wow: int = 0
    haha: int = 0
    sad: int = 0
    angry: int = 0
    care: int = 0


class InsightValue(BaseModel):
    value: ReactionValue
    end_time: Optional[datetime] = None


class InsightItem(BaseModel):
    name: str
    period: str
    values: List[InsightValue]
    title: Optional[str] = None
    description: Optional[str] = None
    id: str


class Paging(BaseModel):
    previous: Optional[str] = None


class PageInsightsResponse(BaseModel):
    data: List[InsightItem]
    paging: Optional[Paging] = None




# ── Schemas d'analyse agrégée (pour les endpoints d'analyse) ─────────────────────

class DailyMetric(BaseModel):
    date: str
    views: int = 0
    engagements: int = 0
    follows: int = 0
    unfollows: int = 0
    like: int = 0
    love: int = 0
    haha: int = 0
    wow: int = 0
    sad: int = 0
    angry: int = 0
    care: int = 0
    total_reactions: int = 0


class PeriodSummary(BaseModel):
    total_views: int = 0
    total_engagements: int = 0
    net_followers: int = 0
    total_reactions: int = 0
    engagement_rate: float = 0.0
    avg_daily_views: float = 0.0
    avg_daily_engagements: float = 0.0
    top_reaction: str = "like"
    reaction_breakdown: dict[str, int] = {}


class PageAnalysisResponse(BaseModel):
    page_id: str
    fb_page_id: str
    page_name: str
    period: str
    since: datetime
    until: datetime
    summary: PeriodSummary
    daily: list[DailyMetric]
    followers_total: int = 0
    errors: dict[str, str] = {}
    generated_at: datetime


class PostReaction(BaseModel):
    like: int = 0
    love: int = 0
    haha: int = 0
    wow: int = 0
    sad: int = 0
    angry: int = 0
    care: int = 0


class PostWithReactions(BaseModel):
    post_id: str
    message: str
    created_time: str
    reactions: PostReaction
    total_reactions: int = 0


class PostsPagination(BaseModel):
    after: Optional[str] = None
    before: Optional[str] = None
    has_next: bool = False
    has_previous: bool = False


class PostsWithReactionsResponse(BaseModel):
    data: list[PostWithReactions]
    pagination: PostsPagination