from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID

from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.modules.scheduled_post.repository import (
    ScheduledPostRepository, ScheduledPostAiImageRepository
)
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate, ScheduledPostUpdate,
    ScheduledPostAiPatchRequest, ScheduledPostAiPatchResponse,
    ScheduledPostResponse,
)
from app.modules.ai_generation.schemas import (
    AiContext, CaptionRequest, ImageRequest
)
from app.modules.ai_generation.llm_service import AiGenerationService
from app.modules.ai_generation.dependencies import get_ai_context


class ScheduledPostService:

    # ── CRUD ──────────────────────────────────────────────────────────────────

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> ScheduledPost:
        post = ScheduledPostRepository.get_by_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="ScheduledPost not found")
        return post

    @staticmethod
    def get_by_org(db: Session, org_id: UUID) -> list[ScheduledPost]:
        return ScheduledPostRepository.get_by_org(db, org_id)

    @staticmethod
    def create(db: Session, payload: ScheduledPostCreate) -> ScheduledPost:
        return ScheduledPostRepository.create(db, payload.model_dump())

    @staticmethod
    def update(db: Session, post_id: UUID, payload: ScheduledPostUpdate) -> ScheduledPost:
        post = ScheduledPostService.get_by_id(db, post_id)
        return ScheduledPostRepository.update(
            db, post, payload.model_dump(exclude_unset=True)
        )

    @staticmethod
    def delete(db: Session, post_id: UUID) -> dict:
        post = ScheduledPostService.get_by_id(db, post_id)
        ScheduledPostRepository.delete(db, post)
        return {"detail": "Deleted successfully"}

    # ── PATCH /{id}/ai-suggest ────────────────────────────────────────────────

    @staticmethod
    async def apply_ai_suggestion(
        db: Session,
        post_id: UUID,
        payload: ScheduledPostAiPatchRequest,
        current_user,
    ) -> ScheduledPostAiPatchResponse:
        """
        PATCH /{id}/ai-suggest
        Génère caption et/ou image via IA
        et met à jour directement le ScheduledPost.
        """
        post = ScheduledPostService.get_by_id(db, post_id)

        # Construit le contexte IA manuellement (sans Depends)
        from app.modules.organisations.model import Organisation
        from app.modules.fb_page.model import Facebook

        org = db.query(Organisation).filter(
            Organisation.id == payload.org_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organisation not found")

        fb_page_name = fb_page_fb_id = None
        if payload.page_id:
            page = db.query(Facebook).filter(Facebook.id == payload.page_id).first()
            if page:
                fb_page_name = page.page_name
                fb_page_fb_id = page.fb_page_id

        ctx = AiContext(
            user_id=current_user.id,
            user_email=current_user.email,
            organisation_id=org.id,
            organisation_name=org.name,
            organisation_sector=str(org.sector.value if hasattr(org.sector, "value") else org.sector),
            organisation_tone=str(org.tone.value if hasattr(org.tone, "value") else org.tone),
            facebook_page_name=fb_page_name,
            facebook_page_id=fb_page_fb_id,
        )

        service = AiGenerationService()
        update_data = {}
        caption_gen = image_gen = None

        # ── Génère caption ────────────────────────────────────────────────────
        if payload.generate_caption:
            caption_gen = await service.generate_caption(
                db=db, ctx=ctx,
                req=CaptionRequest(
                    topic=payload.topic,
                    additional_instructions=payload.additional_instructions,
                )
            )
            update_data["caption"] = caption_gen.caption

        # ── Génère image ──────────────────────────────────────────────────────
        if payload.generate_image:
            image_gen = await service.generate_image(
                db=db, ctx=ctx,
                req=ImageRequest(description=payload.topic)
            )
            update_data["image_url"] = image_gen.image_url

            # Désactive l'ancienne image IA active + crée la nouvelle
            ScheduledPostAiImageRepository.deactivate_all(db, post_id)
            ScheduledPostAiImageRepository.create(db, {
                "scheduled_post_id": post_id,
                "ai_gen_id": image_gen.id,
                "image_url": image_gen.image_url,
                "is_active": True,
            })

        # ── Met à jour le ScheduledPost ───────────────────────────────────────
        updated_post = ScheduledPostRepository.update(db, post, update_data)

        return ScheduledPostAiPatchResponse(
            scheduled_post=ScheduledPostResponse.model_validate(updated_post),
            generated_caption=caption_gen.caption if caption_gen else None,
            generated_image_url=image_gen.image_url if image_gen else None,
            caption_generation_id=caption_gen.id if caption_gen else None,
            image_generation_id=image_gen.id if image_gen else None,
        )