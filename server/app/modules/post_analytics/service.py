from __future__ import annotations

from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session

from fastapi import HTTPException, status
import httpx


from .model import PostAnalytics
from .repository import PostAnalyticsRepository as analyse_repository
from app.modules.published_post.service import PublishedPostService as published_service
from .schema import (
    PostAnalyticsCreate,
    PostAnalyticsResponse,
    PublishedPostResponse
)


class PostAnalyticsService:
    """Business-logic layer for PostAnalytics."""

    def __init__(self):
        pass
    # ------------------------------------------------------------------ #
    #  CREATE                                                              #
    # ------------------------------------------------------------------ #
    
    def create(self, db:Session, post_analytics_create: PostAnalyticsCreate) -> PostAnalytics:
        """Create a single analytics snapshot."""
        post_analytics = PostAnalytics(**post_analytics_create.model_dump())
        return analyse_repository.create(db=db, post_analytics=post_analytics)
    

    # ------------------------------------------------------------------ #
    #  READ — single record                                                #
    # ------------------------------------------------------------------ #

    def get_by_id(self, db:Session, analytics_id: UUID) -> PostAnalyticsResponse:
        return analyse_repository.get_by_id(db=db, analytics_id=analytics_id)
    
   
    """
    get a analyse for one post 
    """
    
    def get_by_published(self, db:Session, published_id:UUID)->list[PublishedPostResponse]:
        return analyse_repository.get_by_published(db=db,publised_id=published_id)
 
    async def get_single_analyse_by_published_post(self, db: Session, organisation_id: UUID) -> list[PostAnalytics]:
        published_post_list = published_service.get_all_by_org(db, org_id=organisation_id)  # ✅ await + sans self ni db
        
        post_analytics_list: list[PostAnalytics] = []  # ✅ initialisée
        
        for elt in published_post_list:
            post_analytics = analyse_repository.get_latest_by_published(db=db, published_id=elt.id)  # ✅ elt["id"] car response.json() retourne des dicts
            if post_analytics:  # ✅ peut être None
                post_analytics_list.append(post_analytics)  # ✅ append sur la liste
        
        return post_analytics_list