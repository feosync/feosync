"""Facebook Pages – service, repository, schemas, and router."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Query
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.config.settings import settings
from src.app.core.security.jwt import decrypt_token, encrypt_token
from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.integrations.meta.client import MetaGraphClient
from src.app.modules.models import FacebookPage, Organization
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import (
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    PlanLimitExceededError,
)

router = APIRouter(prefix="/facebook-pages", tags=["Facebook Pages"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class FacebookPageResponse(BaseModel):
    id: uuid.UUID
    fb_page_id: str
    page_name: str
    category: str | None
    picture_url: str | None
    fan_count: int | None
    is_active: bool
    last_sync_at: datetime | None

    model_config = {"from_attributes": True}


class OAuthCallbackRequest(BaseModel):
    code: str


# ── Repository ────────────────────────────────────────────────────────────────

class FacebookPageRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_by_org(self, org_id: uuid.UUID) -> list[FacebookPage]:
        result = await self.db.execute(
            select(FacebookPage).where(
                FacebookPage.org_id == org_id,
                FacebookPage.is_active == True,  # noqa: E712
            )
        )
        return list(result.scalars())

    async def get_by_id(self, page_id: uuid.UUID, org_id: uuid.UUID) -> FacebookPage | None:
        result = await self.db.execute(
            select(FacebookPage).where(
                FacebookPage.id == page_id,
                FacebookPage.org_id == org_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_fb_id(self, fb_page_id: str) -> FacebookPage | None:
        result = await self.db.execute(
            select(FacebookPage).where(FacebookPage.fb_page_id == fb_page_id)
        )
        return result.scalar_one_or_none()

    async def upsert_page(
        self, org_id: uuid.UUID, fb_page: dict[str, Any], encrypted_token: str
    ) -> FacebookPage:
        existing = await self.get_by_fb_id(fb_page["id"])
        if existing:
            existing.page_name = fb_page.get("name", existing.page_name)
            existing.access_token_enc = encrypted_token
            existing.is_active = True
            existing.picture_url = (
                fb_page.get("picture", {}).get("data", {}).get("url") if "picture" in fb_page else existing.picture_url
            )
            existing.fan_count = fb_page.get("fan_count", existing.fan_count)
            await self.db.flush()
            return existing
        page = FacebookPage(
            org_id=org_id,
            fb_page_id=fb_page["id"],
            page_name=fb_page["name"],
            category=fb_page.get("category"),
            access_token_enc=encrypted_token,
            picture_url=fb_page.get("picture", {}).get("data", {}).get("url"),
            fan_count=fb_page.get("fan_count"),
        )
        self.db.add(page)
        await self.db.flush()
        return page

    async def soft_delete(self, page_id: uuid.UUID) -> None:
        await self.db.execute(
            update(FacebookPage).where(FacebookPage.id == page_id).values(is_active=False)
        )

    async def update_sync_time(self, page_id: uuid.UUID) -> None:
        await self.db.execute(
            update(FacebookPage)
            .where(FacebookPage.id == page_id)
            .values(last_sync_at=datetime.now(tz=timezone.utc))
        )

    async def count_active(self, org_id: uuid.UUID) -> int:
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count()).where(
                FacebookPage.org_id == org_id,
                FacebookPage.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one()


# ── Service ───────────────────────────────────────────────────────────────────

class FacebookPageService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = FacebookPageRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def _get_org(self, user) -> Organization:
        org = await self.org_repo.get_by_user_id(user.id)
        if not org:
            raise NotFoundError("Organization")
        return org

    async def handle_oauth_callback(self, user, code: str) -> list[FacebookPage]:
        org = await self._get_org(user)

        # Check plan limits
        from src.app.modules.plans.service import PlanService
        await PlanService(self.db).check_page_limit(user, org)

        async with MetaGraphClient() as meta:
            short_token_data = await meta.exchange_code_for_token(code)
            short_token = short_token_data["access_token"]
            long_token_data = await meta.get_long_lived_token(short_token)
            long_token = long_token_data["access_token"]
            pages = await meta.get_user_pages(long_token)

        saved = []
        for page_data in pages:
            page_token = page_data.get("access_token", long_token)
            enc_token = encrypt_token(page_token)
            page = await self.repo.upsert_page(org.id, page_data, enc_token)
            saved.append(page)
        return saved

    async def list_pages(self, user) -> list[FacebookPage]:
        org = await self._get_org(user)
        return await self.repo.list_by_org(org.id)

    async def disconnect_page(self, user, page_id: uuid.UUID) -> None:
        org = await self._get_org(user)
        page = await self.repo.get_by_id(page_id, org.id)
        if not page:
            raise NotFoundError("FacebookPage")
        await self.repo.soft_delete(page_id)

    def get_oauth_url(self) -> str:
        return settings.META_OAUTH_URL


# ── Router ────────────────────────────────────────────────────────────────────

@router.get("/oauth-url")
async def get_oauth_url() -> dict[str, str]:
    return {"url": FacebookPageService(None).get_oauth_url()}  # type: ignore[arg-type]


@router.get("/callback")
async def oauth_callback(
    code: str = Query(...),
    current_user: CurrentUser = None,  # type: ignore[assignment]
    db: DbSession = None,  # type: ignore[assignment]
) -> list[FacebookPageResponse]:
    svc = FacebookPageService(db)
    pages = await svc.handle_oauth_callback(current_user, code)
    return [FacebookPageResponse.model_validate(p) for p in pages]


@router.get("", response_model=list[FacebookPageResponse])
async def list_pages(current_user: CurrentUser, db: DbSession) -> list[FacebookPageResponse]:
    pages = await FacebookPageService(db).list_pages(current_user)
    return [FacebookPageResponse.model_validate(p) for p in pages]


@router.delete("/{page_id}", status_code=204)
async def disconnect_page(
    page_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    await FacebookPageService(db).disconnect_page(current_user, page_id)
