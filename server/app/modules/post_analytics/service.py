from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.fb_page.model import Facebook
from app.modules.fb_page.service import FacebookService as fb_service

from .model import PostAnalytics
from .repository import PostAnalyticsRepository as repo

from .schemas import (
    PostAnalyticsCreate, 
    PostAnalyticsResponse,
    DailyMetric,
    PageAnalysisResponse,
    PeriodSummary,
    PostReaction,
    PostsPagination,
    PostWithReactions,
    PostsWithReactionsResponse,
)

logger = logging.getLogger(__name__)
META_TIMEOUT = httpx.Timeout(15.0, connect=5.0)

PERIOD_WINDOWS: dict[str, int] = {
    "day":     1,
    "week":    7,
    "days_28": 28,
}

REACTION_KEYS = ("like", "love", "haha", "wow", "sad", "angry", "care")

NUMERIC_METRICS = [
    "page_views_total",
    "page_post_engagements",
    "page_follows",
    "page_daily_unfollows_unique",
]


class PostAnalyticsService:

    # ── CRUD basique ──────────────────────────────────────────────────────────

    def create(self, db: Session, data: PostAnalyticsCreate) -> PostAnalytics:
        obj = PostAnalytics(**data.model_dump())
        return repo.create(db=db, post_analytics=obj)

    def get_by_id(self, db: Session, analytics_id: UUID) -> PostAnalyticsResponse:
        obj = repo.get_by_id(db=db, analytics_id=analytics_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Analytics not found")
        return PostAnalyticsResponse.model_validate(obj)

    def get_by_published(self, db: Session, published_id: UUID) -> list[PostAnalyticsResponse]:
        return [
            PostAnalyticsResponse.model_validate(a)
            for a in repo.get_by_published(db=db, published_id=published_id)
        ]

    def get_latest_analytics_by_org(
        self, db: Session, organisation_id: UUID
    ) -> list[PostAnalyticsResponse]:
        return [
            PostAnalyticsResponse.model_validate(a)
            for a in repo.get_latest_per_published_post_by_org(
                db=db, organisation_id=organisation_id
            )
        ]

    # ── HELPER Meta ───────────────────────────────────────────────────────────

    async def _fetch(
        self,
        fb_page_id: str,
        access_token: str,
        metric: str,
        since: datetime,
        until: datetime,
    ) -> tuple[str, dict]:
        """
        Fetche une métrique Meta.
        Retourne toujours (metric_name, dict) — jamais d'exception propagée.
        Les erreurs sont encapsulées dans {"data": [], "error": "..."}.
        """
        params = {
            "access_token": access_token,
            "metric":       metric,
            "period":       "day",
            "since":        int(since.timestamp()),
            "until":        int(until.timestamp()),
        }
        url = f"{settings.META_GRAPH_URL}/{fb_page_id}/insights"

        try:
            async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:
                r = await client.get(url, params=params)
            data = r.json()

            if "error" in data:
                msg = data["error"].get("message", "Meta API error")
                code = data["error"].get("code", 0)
                logger.warning(f"Meta [{metric}] code={code}: {msg}")
                return metric, {"data": [], "error": msg, "error_code": code}

            return metric, data

        except httpx.TimeoutException:
            logger.error(f"Timeout [{metric}]")
            return metric, {"data": [], "error": "timeout"}
        except httpx.HTTPError as e:
            logger.error(f"HTTP error [{metric}]: {e}")
            return metric, {"data": [], "error": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error [{metric}]: {e}")
            return metric, {"data": [], "error": str(e)}

    # ── Extracteurs ───────────────────────────────────────────────────────────

    @staticmethod
    def _by_date_numeric(raw: dict) -> dict[str, int]:
        """{ 'YYYY-MM-DD': int } depuis une réponse Meta numérique."""
        out: dict[str, int] = {}
        for item in raw.get("data", []):
            for v in item.get("values", []):
                key = (v.get("end_time") or "")[:10]
                if key:
                    out[key] = out.get(key, 0) + int(v.get("value") or 0)
        return out

    @staticmethod
    def _by_date_reactions(raw: dict) -> dict[str, dict[str, int]]:
        """{ 'YYYY-MM-DD': {like, love, ...} } depuis page_actions_post_reactions_total."""
        out: dict[str, dict[str, int]] = {}
        for item in raw.get("data", []):
            for v in item.get("values", []):
                key = (v.get("end_time") or "")[:10]
                val = v.get("value", {})
                if key and isinstance(val, dict):
                    out[key] = val
        return out

    @staticmethod
    def _followers_total(follows_d: dict[str, int]) -> int:
        """Retourne la dernière valeur connue d'abonnés (valeur la plus récente)."""
        if not follows_d:
            return 0
        latest_key = max(follows_d.keys())
        return follows_d[latest_key]

    # ── ANALYSE PRINCIPALE ────────────────────────────────────────────────────

    async def get_page_analysis(
        self,
        fb_model_id: UUID,
        org_id: UUID,
        db: Session,
        period: str = "week",
    ) -> PageAnalysisResponse:
        page: Facebook = fb_service.get_by_id(db=db, page_id=fb_model_id, org_id=org_id)

        days  = PERIOD_WINDOWS.get(period, 7)
        until = datetime.now(timezone.utc)
        since = until - timedelta(days=days)

        all_metrics = NUMERIC_METRICS + ["page_actions_post_reactions_total"]

        results = await asyncio.gather(*[
            self._fetch(page.fb_page_id, page.access_token, m, since, until)
            for m in all_metrics
        ])
        raw_map: dict[str, dict] = dict(results)

        # Erreurs partielles — on continue même si certaines métriques échouent
        errors = {
            k: v["error"]
            for k, v in raw_map.items()
            if "error" in v
        }

        views_d     = self._by_date_numeric(raw_map.get("page_views_total", {}))
        eng_d       = self._by_date_numeric(raw_map.get("page_post_engagements", {}))
        follows_d   = self._by_date_numeric(raw_map.get("page_follows", {}))
        unfollows_d = self._by_date_numeric(raw_map.get("page_daily_unfollows_unique", {}))
        reactions_d = self._by_date_reactions(
            raw_map.get("page_actions_post_reactions_total", {})
        )

        all_dates = sorted(
            set(list(views_d) + list(eng_d) + list(follows_d) + list(reactions_d))
        )

        daily: list[DailyMetric] = []
        for date_key in all_dates:
            if not date_key:
                continue
            r = reactions_d.get(date_key, {})
            total_r = sum(r.get(k, 0) for k in REACTION_KEYS)
            daily.append(DailyMetric(
                date=date_key,
                views=views_d.get(date_key, 0),
                engagements=eng_d.get(date_key, 0),
                follows=follows_d.get(date_key, 0),
                unfollows=unfollows_d.get(date_key, 0),
                like=r.get("like", 0),
                love=r.get("love", 0),
                haha=r.get("haha", 0),
                wow=r.get("wow", 0),
                sad=r.get("sad", 0),
                angry=r.get("angry", 0),
                care=r.get("care", 0),
                total_reactions=total_r,
            ))

        n           = len(daily) or 1
        total_views = sum(d.views for d in daily)
        total_eng   = sum(d.engagements for d in daily)
        net_follows = sum(d.follows - d.unfollows for d in daily)
        total_r     = sum(d.total_reactions for d in daily)

        reaction_totals = {
            k: sum(getattr(d, k) for d in daily)
            for k in REACTION_KEYS
        }
        top = max(reaction_totals, key=lambda k: reaction_totals[k])

        summary = PeriodSummary(
            total_views=total_views,
            total_engagements=total_eng,
            net_followers=net_follows,
            total_reactions=total_r,
            engagement_rate=round(total_eng / total_views * 100, 2) if total_views else 0.0,
            avg_daily_views=round(total_views / n, 1),
            avg_daily_engagements=round(total_eng / n, 1),
            top_reaction=top,
            reaction_breakdown=reaction_totals,
        )

        return PageAnalysisResponse(
            page_id=str(page.id),
            fb_page_id=page.fb_page_id,
            page_name=page.page_name,
            period=period,
            since=since,
            until=until,
            summary=summary,
            daily=daily,
            followers_total=self._followers_total(follows_d),
            errors=errors,
            generated_at=datetime.now(timezone.utc),
        )

    # ── POSTS avec réactions ──────────────────────────────────────────────────

    async def get_posts_with_reactions(
        self,
        fb_model_id: UUID,
        org_id: UUID,
        db: Session,
        limit: int = 10,
        after: str | None = None,
    ) -> PostsWithReactionsResponse:
        page: Facebook = fb_service.get_by_id(db=db, page_id=fb_model_id, org_id=org_id)
        url = f"{settings.META_GRAPH_URL}/{page.fb_page_id}/posts"
        params = {
            "fields": (
                "id,message,created_time,"
                "reactions.summary(true).type(LIKE).as(like),"
                "reactions.summary(true).type(LOVE).as(love),"
                "reactions.summary(true).type(HAHA).as(haha),"
                "reactions.summary(true).type(WOW).as(wow),"
                "reactions.summary(true).type(SAD).as(sad),"
                "reactions.summary(true).type(ANGRY).as(angry),"
                "reactions.summary(true).type(CARE).as(care)"
            ),
            "access_token": page.access_token,
            "limit":        limit,
        }
        if after:
            params["after"] = after

        try:
            async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:
                r = await client.get(url, params=params)
            data = r.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Meta API timeout")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Meta API error: {e}")

        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"]["message"])

        posts: list[PostWithReactions] = []
        for p in data.get("data", []):
            msg = p.get("message", "")
            r_data = PostReaction(
                like=p.get("like",  {}).get("summary", {}).get("total_count", 0),
                love=p.get("love",  {}).get("summary", {}).get("total_count", 0),
                haha=p.get("haha",  {}).get("summary", {}).get("total_count", 0),
                wow=p.get("wow",   {}).get("summary", {}).get("total_count", 0),
                sad=p.get("sad",   {}).get("summary", {}).get("total_count", 0),
                angry=p.get("angry",{}).get("summary", {}).get("total_count", 0),
                care=p.get("care",  {}).get("summary", {}).get("total_count", 0),
            )
            posts.append(PostWithReactions(
                post_id=p["id"],
                message=msg[:80] + ("..." if len(msg) > 80 else ""),
                created_time=p["created_time"],
                reactions=r_data,
                total_reactions=sum(r_data.model_dump().values()),
            ))

        cursors = data.get("paging", {}).get("cursors", {})
        return PostsWithReactionsResponse(
            data=posts,
            pagination=PostsPagination(
                after=cursors.get("after"),
                before=cursors.get("before"),
                has_next="next" in data.get("paging", {}),
                has_previous="previous" in data.get("paging", {}),
            ),
        )