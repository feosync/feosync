from __future__ import annotations

from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session

from fastapi import HTTPException, status
import httpx


from .model import PostAnalytics
from .repository import PostAnalyticsRepository as analyse_repository
from .schema import (
    PostAnalyticsBulkCreate,
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
    
   
    @staticmethod
    def get_by_published(db:Session, published_id:UUID)->list[PublishedPostResponse]:
        return analyse_repository.get_by_published(db=db,publised_id=published_id)