"""Organization repository."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.modules.models import Organization


class OrganizationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_organization(self, user_id: uuid.UUID, name: str) -> Organization:
        org = Organization(user_id=user_id, name=name)
        self.db.add(org)
        await self.db.flush()
        return org

    async def get_by_user_id(self, user_id: uuid.UUID) -> Organization | None:
        result = await self.db.execute(
            select(Organization).where(Organization.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, org_id: uuid.UUID) -> Organization | None:
        result = await self.db.execute(
            select(Organization).where(Organization.id == org_id)
        )
        return result.scalar_one_or_none()

    async def update(self, org: Organization, data: dict) -> Organization:
        for key, value in data.items():
            if hasattr(org, key) and value is not None:
                setattr(org, key, value)
        await self.db.flush()
        return org
