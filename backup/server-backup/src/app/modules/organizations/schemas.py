"""Organization Pydantic schemas."""
from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, HttpUrl

from src.app.modules.models import OrgSector, OrgTone


class OrganizationBase(BaseModel):
    name: str
    sector: OrgSector | None = None
    tone: OrgTone | None = None
    logo_url: str | None = None
    brand_colors: dict[str, Any] = {}
    editorial_profile: str | None = None
    website: str | None = None


class OrganizationUpdate(OrganizationBase):
    name: str | None = None  # type: ignore[assignment]


class OrganizationResponse(OrganizationBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = {"from_attributes": True}
