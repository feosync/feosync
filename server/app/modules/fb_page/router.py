from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.user_model import User
from app.modules.fb_page.schemas import (
    FacebookOAuthURL,
    FacebookOAuthCallbackResponse,
    FacebookPageConnect,
    FacebookPageResponse,
    PageInsightsResponse,
)
from app.modules.fb_page.service import FacebookService

fb_page_router = APIRouter()


# ── OAuth Meta ────────────────────────────────────────────────────────────────

@fb_page_router.get(
    "/oauth/url",
    response_model=FacebookOAuthURL,
    summary="Étape 1 — Générer l'URL OAuth Meta",
)
async def get_oauth_url(
    org_id: UUID,
    current_user: User = Depends(get_active_user),
):
    """
    Retourne l'URL vers laquelle rediriger l'utilisateur pour autoriser l'app Meta.
    `org_id` est encodé dans le paramètre `state` de l'URL.
    """
    url = FacebookService.get_oauth_url(org_id)
    return FacebookOAuthURL(oauth_url=url)


@fb_page_router.get(
    "/oauth/callback",
    response_model=FacebookOAuthCallbackResponse,
    summary="Étape 2 — Callback Meta OAuth",
)
async def oauth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """
    Meta redirige ici après autorisation.
    - Échange le code contre un long-lived user token
    - Récupère les pages disponibles sur le compte
    - Retourne les pages pour que l'user choisisse
    """
    org_id = UUID(state)
    user_token = await FacebookService.exchange_code_for_token(code)
    pages = await FacebookService.get_available_pages(user_token)
    return FacebookOAuthCallbackResponse(
        org_id=org_id,
        available_pages=pages,
    )


# ── Pages ─────────────────────────────────────────────────────────────────────

@fb_page_router.get(
    "/",
    response_model=list[FacebookPageResponse],
    summary="Lister les pages d'une organisation",
)
async def get_pages(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.get_all(db, org_id)


@fb_page_router.get(
    "/{page_id}",
    response_model=FacebookPageResponse,
    summary="Détail d'une page",
)
async def get_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.get_by_id(db, page_id, org_id)


@fb_page_router.post(
    "/connect",
    response_model=FacebookPageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Étape 3 — Connecter une page",
)
async def connect_page(
    payload: FacebookPageConnect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Connecte la page choisie par l'utilisateur à son organisation.
    Utilise le `access_token` de la page retourné par /oauth/callback.
    """
    return FacebookService.connect_page(db, payload.org_id, payload)


@fb_page_router.delete(
    "/{page_id}",
    status_code=status.HTTP_200_OK,
    summary="Déconnecter une page",
)
async def disconnect_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.disconnect_page(db, page_id, org_id)


@fb_page_router.patch(
    "/{page_id}/toggle",
    response_model=FacebookPageResponse,
    summary="Activer / désactiver une page",
)
async def toggle_page(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.toggle_active(db, page_id, org_id)


# ── Insights ──────────────────────────────────────────────────────────────────

@fb_page_router.post(
    "/{page_id}/insights/sync",
    summary="Synchroniser les insights depuis Meta",
)
async def sync_insights(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return await FacebookService.sync_insights(db, page_id, org_id)


@fb_page_router.get(
    "/{page_id}/insights",
    response_model=list[PageInsightsResponse],
    summary="Historique des insights d'une page",
)
async def get_insights(
    page_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return FacebookService.get_insights(db, page_id, org_id)
