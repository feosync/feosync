"""
Meta Graph API client.
Wraps all Graph API calls: token exchange, page listing,
post publishing, insights fetching.
"""
from __future__ import annotations

import asyncio
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from src.app.core.config.settings import settings
from src.app.core.logging.logger import get_logger
from src.app.shared.exceptions.http_exceptions import MetaAPIError, ServiceUnavailableError

logger = get_logger(__name__)

GRAPH_BASE = settings.META_GRAPH_BASE_URL


class MetaGraphClient:
    """Async HTTP client for Meta Graph API."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "MetaGraphClient":
        self._client = httpx.AsyncClient(timeout=30.0, base_url=GRAPH_BASE)
        return self

    async def __aexit__(self, *args: Any) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("MetaGraphClient must be used as async context manager")
        return self._client

    # ── OAuth ─────────────────────────────────────────────────────────────────

    async def exchange_code_for_token(self, code: str) -> dict[str, Any]:
        """Exchange OAuth code for a user access token."""
        resp = await self.client.get(
            "/oauth/access_token",
            params={
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "redirect_uri": settings.META_OAUTH_REDIRECT_URI,
                "code": code,
            },
        )
        return self._handle(resp)

    async def get_long_lived_token(self, short_token: str) -> dict[str, Any]:
        """Exchange short-lived token for a 60-day long-lived token."""
        resp = await self.client.get(
            "/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": settings.META_APP_ID,
                "client_secret": settings.META_APP_SECRET,
                "fb_exchange_token": short_token,
            },
        )
        return self._handle(resp)

    # ── Pages ─────────────────────────────────────────────────────────────────

    async def get_user_pages(self, user_access_token: str) -> list[dict[str, Any]]:
        """List pages the user manages (with their page tokens)."""
        resp = await self.client.get(
            "/me/accounts",
            params={
                "access_token": user_access_token,
                "fields": "id,name,category,picture{url},fan_count,access_token",
            },
        )
        data = self._handle(resp)
        return data.get("data", [])

    async def get_page_info(self, page_id: str, page_token: str) -> dict[str, Any]:
        resp = await self.client.get(
            f"/{page_id}",
            params={
                "access_token": page_token,
                "fields": "id,name,category,picture{url},fan_count,followers_count",
            },
        )
        return self._handle(resp)

    # ── Publishing ────────────────────────────────────────────────────────────

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def publish_photo(
        self, page_id: str, page_token: str, image_url: str, caption: str
    ) -> dict[str, Any]:
        """Publish a photo post to a Facebook page."""
        resp = await self.client.post(
            f"/{page_id}/photos",
            data={
                "url": image_url,
                "caption": caption,
                "access_token": page_token,
            },
        )
        return self._handle(resp)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def publish_feed(
        self, page_id: str, page_token: str, message: str, link: str | None = None
    ) -> dict[str, Any]:
        """Publish a text/link post to a Facebook page feed."""
        params: dict[str, str] = {"message": message, "access_token": page_token}
        if link:
            params["link"] = link
        resp = await self.client.post(f"/{page_id}/feed", data=params)
        return self._handle(resp)

    # ── Insights ──────────────────────────────────────────────────────────────

    async def get_page_insights(
        self,
        page_id: str,
        page_token: str,
        since: int,
        until: int,
    ) -> dict[str, Any]:
        """Fetch daily page insights for a date range (Unix timestamps)."""
        metrics = ",".join([
            "page_impressions_unique",
            "page_engaged_users",
            "page_fans",
            "page_fan_adds",
            "page_views_total",
        ])
        resp = await self.client.get(
            f"/{page_id}/insights",
            params={
                "metric": metrics,
                "period": "day",
                "since": since,
                "until": until,
                "access_token": page_token,
            },
        )
        return self._handle(resp)

    async def get_post_insights(
        self, fb_post_id: str, page_token: str
    ) -> dict[str, Any]:
        """Fetch insights for a specific published post."""
        metrics = ",".join([
            "post_impressions",
            "post_impressions_unique",
            "post_engaged_users",
            "post_reactions_by_type_total",
            "post_clicks",
        ])
        resp = await self.client.get(
            f"/{fb_post_id}/insights",
            params={"metric": metrics, "access_token": page_token},
        )
        return self._handle(resp)

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _handle(response: httpx.Response) -> dict[str, Any]:
        try:
            data = response.json()
        except Exception:
            raise ServiceUnavailableError("Meta API returned non-JSON response")

        if "error" in data:
            err = data["error"]
            logger.error("meta_api_error", code=err.get("code"), message=err.get("message"))
            raise MetaAPIError(
                message=err.get("message", "Unknown Meta API error"),
                code=err.get("code"),
            )
        return data


# Module-level singleton factory
def get_meta_client() -> MetaGraphClient:
    return MetaGraphClient()
