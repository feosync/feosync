from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.post_template.repository import PostTemplateRepository
from app.modules.post_template.schemas import PostTemplateCreate, PostTemplateUpdate, PostTemplateCreateFromAI
from app.modules.post_template.model import PostTemplate, SectorEnum
from app.modules.ai_generation.repository import AiGenerationRepository


class PostTemplateService:

    # ── Lecture ───────────────────────────────────────────────────────────────

    @staticmethod
    def get_app_templates(db: Session, sector: SectorEnum | None = None) -> list[PostTemplate]:
        return PostTemplateRepository.get_app_templates(db, sector)

    @staticmethod
    def get_org_templates(db: Session, org_id: UUID, sector: SectorEnum | None = None) -> list[PostTemplate]:
        return PostTemplateRepository.get_org_templates(db, org_id, sector)

    @staticmethod
    def get_all_available(db: Session, org_id: UUID, sector: SectorEnum | None = None) -> list[PostTemplate]:
        """App templates + templates de l'organisation — ce que voit l'user"""
        return PostTemplateRepository.get_all_available(db, org_id, sector)

    @staticmethod
    def get_by_id(db: Session, template_id: UUID) -> PostTemplate:
        template = PostTemplateRepository.get_by_id(db, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template

    # ── Création ──────────────────────────────────────────────────────────────

    @staticmethod
    def create_manual(db: Session, payload: PostTemplateCreate) -> PostTemplate:
        """Création manuelle par une organisation"""
        return PostTemplateRepository.create(db, {
            "name": payload.name,
            "description": payload.description,
            "asset_url": payload.asset_url,
            "sector": payload.sector,
            "organisation_id": payload.organisation_id,
            "is_app_template": False,
            "usage_count": 0,
        })

    @staticmethod
    def create_from_ai(db: Session, payload: PostTemplateCreateFromAI) -> PostTemplate:
        """
        Création depuis une génération IA.
        L'IA a déjà généré le contenu (caption, etc.) dans AiGeneration.
        L'user fournit l'image (asset_url) et on crée le template.
        """
        # Vérifie que l'AiGeneration existe
        
        ai_gen = AiGenerationRepository.get_by_id(db, payload.ai_generation_id)
        if not ai_gen:
            raise HTTPException(status_code=404, detail="AI Generation not found")
        if ai_gen.organisation_id != payload.organisation_id:
            raise HTTPException(status_code=403, detail="AI Generation does not belong to this organisation")

        return PostTemplateRepository.create(db, {
            "name": payload.name,
            "asset_url": payload.asset_url,
            "sector": payload.sector,
            "organisation_id": payload.organisation_id,
            "is_app_template": False,
            "usage_count": 0,
        })

    # ── Mise à jour / Suppression ─────────────────────────────────────────────

    @staticmethod
    def update(db: Session, template_id: UUID, org_id: UUID, payload: PostTemplateUpdate) -> PostTemplate:
        template = PostTemplateService.get_by_id(db, template_id)

        # Seuls les templates de l'organisation sont modifiables
        if template.is_app_template:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="App templates cannot be modified"
            )
        if template.organisation_id != org_id:
            raise HTTPException(status_code=403, detail="Not your template")

        return PostTemplateRepository.update(db, template, payload.model_dump(exclude_unset=True))

    @staticmethod
    def delete(db: Session, template_id: UUID, org_id: UUID) -> dict:
        template = PostTemplateService.get_by_id(db, template_id)

        if template.is_app_template:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="App templates cannot be deleted"
            )
        if template.organisation_id != org_id:
            raise HTTPException(status_code=403, detail="Not your template")

        PostTemplateRepository.delete(db, template)
        return {"detail": "Template deleted successfully"}