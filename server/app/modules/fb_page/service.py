from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import httpx

from app.core.config import settings
from app.modules.fb_page.repository import FacebookRepository, PageInsightsRepository
from app.modules.fb_page.schemas import FacebookPageConnect, PageInsightsCreate
from app.modules.fb_page.model import Facebook


META_GRAPH_URL = "https://graph.facebook.com/v19.0"


class FacebookService:

    # ── OAuth ─────────────────────────────────────────────────────────────────

    @staticmethod
    def get_oauth_url(org_id: UUID) -> str:
        """Génère l'URL de redirection vers Meta OAuth"""
        params = {
            "client_id": settings.META_APP_ID,
            "redirect_uri": settings.META_REDIRECT_URI,
            "scope": "pages_manage_posts,pages_read_engagement,pages_show_list",
            "state": str(org_id),  # on passe org_id dans state pour le retrouver au callback
            "response_type": "code",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"https://www.facebook.com/v19.0/dialog/oauth?{query}"

    @staticmethod
    async def exchange_code_for_token(code: str) -> str:
        """Échange le code OAuth contre un access token"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{META_GRAPH_URL}/oauth/access_token",
                params={
                    "client_id": settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "redirect_uri": settings.META_REDIRECT_URI,
                    "code": code,
                }
            )
        data = response.json()
        if "error" in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meta OAuth error: {data['error']['message']}"
            )
        return data["access_token"]

    @staticmethod
    async def get_available_pages(user_access_token: str) -> list[dict]:
        """Récupère les pages Facebook gérées par l'utilisateur"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{META_GRAPH_URL}/me/accounts",
                params={
                    "access_token": user_access_token,
                    "fields": "id,name,access_token",
                }
            )
        data = response.json()
        if "error" in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meta API error: {data['error']['message']}"
            )
        return data.get("data", [])

    # ── CRUD ──────────────────────────────────────────────────────────────────

    @staticmethod
    def get_all(db: Session, org_id: UUID) -> list[Facebook]:
        return FacebookRepository.get_all_by_org(db, org_id)

    @staticmethod
    def get_by_id(db: Session, page_id: UUID, org_id: UUID) -> Facebook:
        page = FacebookRepository.get_by_id(db, page_id, org_id)
        if not page:
            raise HTTPException(status_code=404, detail="Facebook page not found")
        return page

    @staticmethod
    def connect_page(db: Session, org_id: UUID, payload: FacebookPageConnect) -> Facebook:
        """Connecte une page Facebook à une organisation"""
        # Vérifie si la page est déjà connectée
        existing = FacebookRepository.get_by_fb_page_id(db, payload.fb_page_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This Facebook page is already connected"
            )
        return FacebookRepository.create(db, {
            "fb_page_id": payload.fb_page_id,
            "page_name": payload.page_name,
            "access_token": payload.access_token,
            "organisation_id": org_id,
            "is_active": True,
        })

    @staticmethod
    def disconnect_page(db: Session, page_id: UUID, org_id: UUID) -> dict:
        """Déconnecte une page Facebook"""
        page = FacebookService.get_by_id(db, page_id, org_id)
        FacebookRepository.delete(db, page)
        return {"detail": "Facebook page disconnected successfully"}

    @staticmethod
    def toggle_active(db: Session, page_id: UUID, org_id: UUID) -> Facebook:
        """Active ou désactive une page"""
        page = FacebookService.get_by_id(db, page_id, org_id)
        return FacebookRepository.update(db, page, {"is_active": not page.is_active})

    # ── Insights ──────────────────────────────────────────────────────────────

    @staticmethod
    async def sync_insights(db: Session, page_id: UUID, org_id: UUID) -> dict:
        """Synchronise les insights depuis Meta API"""
        page = FacebookService.get_by_id(db, page_id, org_id)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{META_GRAPH_URL}/{page.fb_page_id}/insights",
                params={
                    "metric": "page_fans,page_impressions_unique,page_engaged_users,page_fan_adds",
                    "period": "day",
                    "access_token": page.access_token,
                }
            )
        data = response.json()
        if "error" in data:
            raise HTTPException(status_code=400, detail=f"Meta API error: {data['error']['message']}")

        # Parse et sauvegarde les insights
        metrics = {item["name"]: item["values"][-1]["value"] for item in data.get("data", [])}
        PageInsightsRepository.create(db, page_id, {
            "date": datetime.now(timezone.utc),
            "fans_total": metrics.get("page_fans", 0),
            "impressions_unique": metrics.get("page_impressions_unique", 0),
            "engaged_users": metrics.get("page_engaged_users", 0),
            "new_followers": metrics.get("page_fan_adds", 0),
        })

        FacebookRepository.update(db, page, {"last_sync_at": datetime.now(timezone.utc)})
        return {"detail": "Insights synced successfully"}

    @staticmethod
    def get_insights(db: Session, page_id: UUID, org_id: UUID):
        FacebookService.get_by_id(db, page_id, org_id)  # vérifie accès
        return PageInsightsRepository.get_by_page(db, page_id)