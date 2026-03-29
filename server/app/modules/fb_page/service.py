from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import httpx

from app.core.config import settings
from app.modules.fb_page.repository import FacebookPageRepository, PageInsightsRepository
from app.modules.fb_page.schemas import FacebookPageConnect
from app.modules.fb_page.model import Facebook, PageInsights

META_GRAPH_URL = "https://graph.facebook.com/v19.0"
META_SCOPES = (
    "pages_show_list,"
    "pages_read_engagement,"
    "pages_manage_posts,"
    "pages_manage_metadata,"
    "pages_manage_engagement,"
    "business_management,"
    "pages_read_user_content,"
    "public_profile,"
    "read_insights"
)

class FacebookService:

    # ── OAuth ─────────────────────────────────────────────────────────────────

    @staticmethod
    def get_oauth_url(org_id: UUID) -> str:
        from urllib.parse import urlencode

        params = urlencode({
            "client_id":     settings.META_APP_ID,
            "redirect_uri":  f"{settings.FRONTEND_URL}/auth/facebook/callback",
            "scope":         META_SCOPES,
            "state":         str(org_id),
            "response_type": "code",
        })

        return f"https://www.facebook.com/v19.0/dialog/oauth?{params}"

    @staticmethod
    async def exchange_code_for_token(code: str) -> str:
        """
        Étape 1 : échange le code court contre un short-lived user token.
        Étape 2 : échange le short-lived contre un long-lived user token (60 jours).
        """
        async with httpx.AsyncClient() as client:
            # Short-lived token
            r = await client.get(
                f"{META_GRAPH_URL}/oauth/access_token",
                params={
                    "client_id":     settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "redirect_uri":  f"{settings.FRONTEND_URL}/auth/facebook/callback",  # ← doit matcher
                    "code":          code,
                },
            )
        FacebookService._raise_if_meta_error(r.json(), "Échange code → token échoué")
        short_lived_token = r.json()["access_token"]

        # Long-lived token (60 jours)
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{META_GRAPH_URL}/oauth/access_token",
                params={
                    "grant_type": "fb_exchange_token",
                    "client_id": settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "fb_exchange_token": short_lived_token,
                },
            )
        FacebookService._raise_if_meta_error(r.json(), "Échange long-lived token échoué")
        return r.json()["access_token"]

    @staticmethod
    async def get_available_pages(user_access_token: str) -> list[dict]:
        """
        Récupère les pages gérées par l'utilisateur.
        Les page access tokens retournés ici sont permanents (non expirables)
        quand générés depuis un long-lived user token.
        """
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{META_GRAPH_URL}/me/accounts",
                params={
                    "access_token": user_access_token,
                    "fields": "id,name,access_token",
                },
            )
        
        
        FacebookService._raise_if_meta_error(r.json(), "Récupération des pages échouée")

        return r.json().get("data", [])

    # ── CRUD Pages ────────────────────────────────────────────────────────────
    
    @staticmethod
    def get_by_fb_page_id(db:Session, fb_page_id:str)->Facebook:
        return FacebookPageRepository.get_by_fb_page_id(db=db,fb_page_id=fb_page_id)

    @staticmethod
    def get_all_by_org(db: Session, org_id: UUID) -> list[Facebook]:
        return FacebookPageRepository.get_all_by_org(db, org_id)
    
    @staticmethod
    def get_all(db:Session)->list[Facebook]:
        return FacebookPageRepository.get_all(db=db)
    
    @staticmethod
    def get_by_id_and_org(db: Session, page_id: UUID, org_id: UUID) -> Facebook:
        page = FacebookPageRepository.get_by_id_and_org(db, page_id, org_id)
        if not page:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Facebook page not found"
            )
        return page

    @staticmethod
    def connect_page(db: Session, org_id: UUID, payload: FacebookPageConnect) -> Facebook:
        """
        Sauvegarde la page choisie par l'utilisateur.
        Si déjà connectée à la même org → met à jour le token.
        Si connectée à une autre org → erreur.
        """
        existing = FacebookPageRepository.get_by_fb_page_id(db, payload.fb_page_id)

        if existing:
            if existing.organisation_id != org_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This page is already connected to another organisation"
                )
            # Reconnexion — met à jour le token
            return FacebookPageRepository.update(db, existing, {
                "access_token": payload.access_token,
                "page_name": payload.page_name,
                "is_active": True,
                "updated_at": datetime.now(timezone.utc),
            })

        return FacebookPageRepository.create(db, {
            "fb_page_id": payload.fb_page_id,
            "page_name": payload.page_name,
            "access_token": payload.access_token,
            "organisation_id": org_id,
            "is_active": True,
        })

    @staticmethod
    def disconnect_page(db: Session, page_id: UUID, org_id: UUID) -> dict:
        page = FacebookService.get_by_id_and_org(db, page_id, org_id)
        FacebookPageRepository.delete(db, page)
        return {"detail": "Facebook page disconnected successfully"}

    @staticmethod
    def toggle_active(db: Session, page_id: UUID, org_id: UUID) -> Facebook:
        page = FacebookService.get_by_id_and_org(db, page_id, org_id)
        return FacebookPageRepository.update(db, page, {
            "is_active": not page.is_active,
            "updated_at": datetime.now(timezone.utc),
        })

    # ── Insights ──────────────────────────────────────────────────────────────

    @staticmethod
    async def sync_insights(db: Session, page_id: UUID, org_id: UUID) -> dict:
        page = FacebookService.get_by_id_and_org(db, page_id, org_id)

        METRICS = [
            ("page_post_engagements", "day"),
            ("page_impressions_unique", "day"),
            ("page_views_total", "day"),
            ("page_fan_adds_unique", "day"),
        ]

        metrics = {}
        fans_total = 0

        async with httpx.AsyncClient() as client:
            # ✅ Récupère le vrai total des followers directement sur la page
            page_info = await client.get(
                f"{META_GRAPH_URL}/{page.fb_page_id}",
                params={
                    "fields": "followers_count,fan_count",
                    "access_token": page.access_token,
                },
            )
            page_data = page_info.json()
            fans_total = page_data.get("followers_count", page_data.get("fan_count", 0))

            # Insights métriques
            for metric, period in METRICS:
                r = await client.get(
                    f"{META_GRAPH_URL}/{page.fb_page_id}/insights",
                    params={
                        "metric": metric,
                        "period": period,
                        "access_token": page.access_token,
                    },
                )
                data = r.json()
                if "error" in data:
                    continue
                for item in data.get("data", []):
                    if item.get("values"):
                        metrics[item["name"]] = item["values"][-1]["value"]

        PageInsightsRepository.create(db, {
            "fb_page_id": page_id,
            "date": datetime.now(timezone.utc),
            "fans_total": fans_total,                                         # ✅ vrai total
            "impressions_unique": metrics.get("page_impressions_unique", 0),
            "engaged_users": metrics.get("page_post_engagements", 0),
            "new_followers": metrics.get("page_fan_adds_unique", 0),
        })

        FacebookPageRepository.update(db, page, {
            "last_sync_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })

        return {
            "detail": "Insights synced successfully",
            "fans_total": fans_total,
            "metrics_collected": list(metrics.keys()),
            "metrics": metrics,
        }

    @staticmethod
    def get_insights(db: Session, page_id: UUID, org_id: UUID) -> list:
        FacebookService.get_by_id_and_org(db, page_id, org_id)  # vérifie accès
        return PageInsightsRepository.get_by_page(db, page_id)

    # ── Helper ────────────────────────────────────────────────────────────────

    @staticmethod
    def _raise_if_meta_error(data: dict, context: str) -> None:
        if "error" in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{context}: {data['error'].get('message', 'Unknown Meta error')}"
            )