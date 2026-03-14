from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.user_model import User
from app.modules.post_template.model import SectorEnum
from app.modules.post_template.schemas import (
    PostTemplateCreate,
    PostTemplateCreateFromAI,
    PostTemplateUpdate,
    PostTemplateResponse,
)
from app.modules.post_template.service import PostTemplateService

post_template_router = APIRouter()


# ── Lecture ───────────────────────────────────────────────────────────────────

@post_template_router.get(
    "/app",
    response_model=list[PostTemplateResponse],
    summary="Templates fournis par l'app (tous secteurs)",
)
async def get_app_templates(
    sector: Optional[SectorEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.get_app_templates(db, sector)


@post_template_router.get(
    "/org/{org_id}",
    response_model=list[PostTemplateResponse],
    summary="Templates créés par une organisation",
)
async def get_org_templates(
    org_id: UUID,
    sector: Optional[SectorEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.get_org_templates(db, org_id, sector)


@post_template_router.get(
    "/available/{org_id}",
    response_model=list[PostTemplateResponse],
    summary="Tous les templates disponibles (app + organisation)",
)
async def get_all_available(
    org_id: UUID,
    sector: Optional[SectorEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """Ce que voit l'utilisateur quand il choisit un template"""
    return PostTemplateService.get_all_available(db, org_id, sector)


@post_template_router.get(
    "/{template_id}",
    response_model=PostTemplateResponse,
    summary="Détail d'un template",
)
async def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.get_by_id(db, template_id)


# ── Création ──────────────────────────────────────────────────────────────────

@post_template_router.post(
    "/",
    response_model=PostTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un template manuellement",
)
async def create_template(
    payload: PostTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.create_manual(db, payload)


@post_template_router.post(
    "/from-ai",
    response_model=PostTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un template depuis une génération IA",
)
async def create_template_from_ai(
    payload: PostTemplateCreateFromAI,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    L'IA a généré le contenu → l'user choisit une image → on crée le template
    """
    return PostTemplateService.create_from_ai(db, payload)


# ── Modification / Suppression ────────────────────────────────────────────────

@post_template_router.patch(
    "/{template_id}",
    response_model=PostTemplateResponse,
    summary="Modifier un template organisation",
)
async def update_template(
    template_id: UUID,
    org_id: UUID,
    payload: PostTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.update(db, template_id, org_id, payload)


@post_template_router.delete(
    "/{template_id}",
    summary="Supprimer un template organisation",
)
async def delete_template(
    template_id: UUID,
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return PostTemplateService.delete(db, template_id, org_id)
