from __future__ import annotations

from datetime import datetime
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
import httpx
from app.core.config import settings

from .model import PostAnalytics
from .repository import PostAnalyticsRepository as analyse_repository
from app.modules.published_post.service import PublishedPostService as published_service
from .schemas.schema import (
    PostAnalyticsCreate,
    PostAnalyticsResponse,
    PublishedPostResponse
)
from app.modules.fb_page.service import FacebookService as fb_service
from app.modules.fb_page.model import Facebook
from app.modules.published_post.service import PublishedPostService
from app.modules.published_post.model import PublishedPost

class PostAnalyticsService:
    """Business-logic layer for PostAnalytics."""

    # ✅ post_negative_feedback retiré → cause des 400 sur certains types de posts
    EVOLUTION_METRICS = [
        "post_impressions",
        "post_impressions_unique",
        "post_engaged_users",
        "post_clicks",
    ]

    def __init__(self):
        pass

    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #

    def create(self, db: Session, post_analytics_create: PostAnalyticsCreate) -> PostAnalytics:
        """Create a single analytics snapshot."""
        post_analytics = PostAnalytics(**post_analytics_create.model_dump())
        return analyse_repository.create(db=db, post_analytics=post_analytics)

    # ------------------------------------------------------------------ #
    #  READ                                                                #
    # ------------------------------------------------------------------ #

    def get_by_id(self, db: Session, analytics_id: UUID) -> PostAnalyticsResponse:
        return analyse_repository.get_by_id(db=db, analytics_id=analytics_id)

    def get_by_published(self, db: Session, published_id: UUID) -> list[PublishedPostResponse]:
        return analyse_repository.get_by_published(db=db, publised_id=published_id)
    
    async def page_insights(self, metric:str, db:Session, fb_model_id:UUID, org_id:UUID):
        page:Facebook = fb_service.get_by_id(db=db, page_id=fb_model_id, org_id=org_id)
            
        params = {
            "access_token": page.access_token,
            "metric": metric,
            "since": page.created_at,
            "until": datetime.now()
        }
        api_url = f"{settings.META_GRAPH_URL}/{page.fb_page_id}/insights" 
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, params=params)

        return response.json()
    
    async def get_page_actions_post_reactions_total(self, fb_model_id:UUID, org_id:UUID, db:Session):        
        return await self.page_insights(metric="page_actions_post_reactions_total", db=db, org_id=org_id, fb_model_id=fb_model_id)
    
    async def get_page_post_engagements(self, fb_model_id:UUID, org_id:UUID, db:Session):        
        return await self.page_insights(metric="page_post_engagements", db=db, org_id=org_id, fb_model_id=fb_model_id)
    
    async def get_page_views_total(self, fb_model_id:UUID, org_id:UUID, db:Session):        
        return await self.page_insights(metric="page_views_total", db=db, org_id=org_id, fb_model_id=fb_model_id)
    
    async def get_page_follows(self, fb_model_id:UUID, org_id:UUID, db:Session):        
        return await self.page_insights(metric="page_follows", db=db, org_id=org_id, fb_model_id=fb_model_id)
    
    async def get_page_daily_unfollows_unique(self, fb_model_id:UUID, org_id:UUID, db:Session):        
        return await self.page_insights(metric="page_daily_unfollows_unique", db=db, org_id=org_id, fb_model_id=fb_model_id)
    
    async def get_all_posts_with_reactions(
        self,
        fb_model_id: UUID,
        org_id: UUID,
        db: Session,
        limit: int = 10,
        after: str | None = None,  # ✅ curseur de pagination
    ) -> dict:
        page: Facebook = fb_service.get_by_id(db=db, page_id=fb_model_id, org_id=org_id)
        url = f"{settings.META_GRAPH_URL}/{page.fb_page_id}/posts"
        params = {
            "fields": "id,message,created_time,"
                    "reactions.summary(true).type(LIKE).as(like),"
                    "reactions.summary(true).type(LOVE).as(love),"
                    "reactions.summary(true).type(HAHA).as(haha),"
                    "reactions.summary(true).type(WOW).as(wow),"
                    "reactions.summary(true).type(SAD).as(sad),"
                    "reactions.summary(true).type(ANGRY).as(angry)",
            "access_token": page.access_token,
            "limit": limit,
        }

        # ✅ Si un curseur est fourni, on l'ajoute
        if after:
            params["after"] = after

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

            if "error" in data:
                raise HTTPException(status_code=400, detail=data["error"]["message"])

            posts = [
                {
                    "post_id": post["id"],
                    "message": post.get("message", "")[:60] + "...",
                    "created_time": post["created_time"],
                    "reactions": {
                        "like":  post.get("like",  {}).get("summary", {}).get("total_count", 0),
                        "love":  post.get("love",  {}).get("summary", {}).get("total_count", 0),
                        "haha":  post.get("haha",  {}).get("summary", {}).get("total_count", 0),
                        "wow":   post.get("wow",   {}).get("summary", {}).get("total_count", 0),
                        "sad":   post.get("sad",   {}).get("summary", {}).get("total_count", 0),
                        "angry": post.get("angry", {}).get("summary", {}).get("total_count", 0),
                    }
                }
                for post in data.get("data", [])
            ]

            # ✅ Retourner les curseurs pour que le frontend puisse naviguer
            cursors = data.get("paging", {}).get("cursors", {})
            return {
                "data": posts,
                "pagination": {
                    "after":  cursors.get("after"),   # curseur page suivante
                    "before": cursors.get("before"),  # curseur page précédente
                    "has_next": "next" in data.get("paging", {}),
                    "has_previous": "previous" in data.get("paging", {}),
                }
            }