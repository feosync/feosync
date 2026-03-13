from uuid import UUID
from fastapi import APIRouter, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.user_model import User
from app.modules.fb_page.schemas import (
    FacebookOAuthURL,
    FacebookPageConnect,
    FacebookPageResponse,
    PageInsightsResponse,
)
from app.modules.fb_page.service import FacebookService

fb_page_router = APIRouter()


# ── OAuth Meta ────────────────────────────────────────────────────────────────

@fb_page_router.get("/oauth/url", response_model=FacebookOAuthURL)
async def get_oauth_url(
    org_id: UUID,
    current_user: User = Depends(get_active_user),
):
    """
    Étape 1 — Génère l'URL OAuth Meta
    Le frontend redirige l'utilisateur vers cette URL
    """
    url = FacebookService.get_oauth_url(org_id)
    return FacebookOAuthURL(oauth_url=url)


@fb_page_router.get("/oauth/callback")
async def oauth_callback(
    code: str,
    state: str,  # org_id passé dans state
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Étape 2 — Meta redirige ici après autorisation
    Échange le code contre un token et retourne les pages disponibles
    """
    org_id = UUID(state)
    user_token = await FacebookService.exchange_code_for_token(code)
    pages = await FacebookService.get_available_pages(user_token)
    return {
        "org_id": org_id,
        "available_pages": pages,
        "instruction": "Choisissez une page et appelez POST /connect"
    }


# ── Pages ─────────────────────────────────────────────────────────────────────

@fb_page_router.get("/", response_model=list[FacebookPageResponse])
async def get_pages(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Liste toutes les pages Facebook d'une organisation"""
    return FacebookService.get_all(db, org_id)


@fb_page_router.get("/{page_id}", response_model=FacebookPageResponse)
async def get_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.get_by_id(db, page_id, org_id)


@fb_page_router.post("/connect", response_model=FacebookPageResponse, status_code=status.HTTP_201_CREATED)
async def connect_page(
    payload: FacebookPageConnect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Étape 3 — Connecte la page choisie à l'organisation
    Utilise les données retournées par /oauth/callback
    """
    return FacebookService.connect_page(db, payload.org_id, payload)


@fb_page_router.delete("/{page_id}", status_code=status.HTTP_200_OK)
async def disconnect_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Déconnecte une page Facebook"""
    return FacebookService.disconnect_page(db, page_id, org_id)


@fb_page_router.patch("/{page_id}/toggle", response_model=FacebookPageResponse)
async def toggle_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Active ou désactive une page"""
    return FacebookService.toggle_active(db, page_id, org_id)


# ── Insights ──────────────────────────────────────────────────────────────────

@fb_page_router.post("/{page_id}/insights/sync")
async def sync_insights(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Synchronise les insights depuis Meta API"""
    return await FacebookService.sync_insights(db, page_id, org_id)


@fb_page_router.get("/{page_id}/insights", response_model=list[PageInsightsResponse])
async def get_insights(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Retourne l'historique des insights d'une page"""
    return FacebookService.get_insights(db, page_id, org_id)