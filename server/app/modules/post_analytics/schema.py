from __future__ import annotations

from datetime import datetime
from typing import Optional
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
    reactions: Optional[dict] = Field(
        None,
        description="Free-form JSONB dict, e.g. {'like': 10, 'love': 3}.",
    )
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
#  REQUEST — UPDATE (partial / PATCH)                                  #
# ------------------------------------------------------------------ #

class PostAnalyticsUpdate(BaseModel):
    """
    All fields are optional — send only what changed.
    At least one field must be provided.
    """

    mesured_at: Optional[datetime] = None
    reach: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    reactions: Optional[dict] = None
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    clicks: Optional[int] = Field(None, ge=0)

    @model_validator(mode="after")
    def at_least_one_field(self) -> PostAnalyticsUpdate:
        provided = {k: v for k, v in self.model_dump().items() if v is not None}
        if not provided:
            raise ValueError("At least one field must be provided for an update.")
        return self

    def to_update_dict(self) -> dict:
        """Return only the fields explicitly set (non-None)."""
        return {k: v for k, v in self.model_dump().items() if v is not None}

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

class PostAnalyticsPaginatedResponse(BaseModel):
    """Paginated collection of analytics snapshots."""

    total: int
    limit: int
    offset: int
    items: list[PostAnalyticsResponse]

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
#  RESPONSE — aggregated totals                                        #
# ------------------------------------------------------------------ #

class PostAnalyticsTotalsResponse(BaseModel):
    """Aggregated metrics summed across all snapshots for a post."""

    published_post_id: UUID
    snapshot_count: int
    total_reach: int
    total_impressions: int
    total_comments: int
    total_shares: int
    total_clicks: int

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
#  RESPONSE — bulk create                                              #
# ------------------------------------------------------------------ #

class PostAnalyticsBulkResponse(BaseModel):
    """Result of a bulk-create operation."""

    created_count: int
    items: list[PostAnalyticsResponse]

    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ #
#  RESPONSE — delete                                                   #
# ------------------------------------------------------------------ #

class PostAnalyticsDeleteResponse(BaseModel):
    """Confirmation payload after a delete operation."""

    deleted_count: int
    message: str = "Analytics records deleted successfully."