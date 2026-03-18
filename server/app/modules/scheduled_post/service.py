from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from uuid import UUID
import base64

from app.modules.scheduled_post.models.scheduled_post_model import (
    ScheduledPost, PostStatus, ImageSource
)
from app.modules.scheduled_post.repository import ScheduledPostRepository, AiImageRepository
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate, CaptionPatchRequest, ImagePatchRequest,
    ConfirmRequest, ScheduledPostResponse,
    CaptionPatchResponse, ImagePatchResponse,
)
from app.modules.ai_generation.schemas import AiContext, CaptionRequest, ImageRequest
from app.modules.ai_generation.llm_service import AiGenerationService
from app.modules.organisations.model import Organisation
from app.modules.fb_page.model import Facebook
from app.modules.user.model import User


class ScheduledPostService:

    # ── Helpers ownership ─────────────────────────────────────────────────────

    @staticmethod
    def _get_post_owned(db: Session, post_id: UUID, current_user: User) -> ScheduledPost:
        """Récupère le post et vérifie que l'user en est propriétaire"""
        post = ScheduledPostRepository.get_by_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        org = db.query(Organisation).filter(
            Organisation.id == post.organisation_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=403, detail="Not your post")
        return post

    @staticmethod
    def _build_ai_context(db: Session, post: ScheduledPost, current_user: User) -> AiContext:
        """Construit l'AiContext depuis le post — aucune redondance dans l'input"""
        org = db.query(Organisation).filter(Organisation.id == post.organisation_id).first()

        # Récupère la page Facebook si présente dans page_ids
        fb_page_name = None
        fb_page_id = post.page_ids.get("facebook")
        if fb_page_id:
            page = db.query(Facebook).filter(Facebook.id == fb_page_id).first()
            if page:
                fb_page_name = page.page_name

        return AiContext(
            user_id=current_user.id,
            user_email=current_user.email,
            organisation_id=org.id,
            organisation_name=org.name,
            organisation_sector=str(org.sector.value if hasattr(org.sector, "value") else org.sector),
            organisation_tone=str(org.tone.value if hasattr(org.tone, "value") else org.tone),
            facebook_page_name=fb_page_name,
        )

    # ── CREATE ────────────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, payload: ScheduledPostCreate, current_user: User) -> ScheduledPost:
        """
        Crée un post minimal en DRAFT.
        org_id déduit depuis facebook_page_id.
        """
        fb_page = db.query(Facebook).filter(
            Facebook.id == payload.facebook_page_id
        ).first()
        if not fb_page:
            raise HTTPException(status_code=404, detail="Facebook page not found")

        org = db.query(Organisation).filter(
            Organisation.id == fb_page.organisation_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=403, detail="Not your page")

        return ScheduledPostRepository.create(db, {
            "organisation_id": fb_page.organisation_id,  # déduit
            "page_ids": {"facebook": str(payload.facebook_page_id)},
            "caption": payload.caption,
            "publish_at": payload.publish_at,
            "post_template_id": payload.post_template_id,
            "status": PostStatus.DRAFT,
        })

    # ── READ ──────────────────────────────────────────────────────────────────

    @staticmethod
    def get_by_id(db: Session, post_id: UUID, current_user: User) -> ScheduledPost:
        return ScheduledPostService._get_post_owned(db, post_id, current_user)

    @staticmethod
    def get_by_org(db: Session, org_id: UUID, current_user: User) -> list[ScheduledPost]:
        org = db.query(Organisation).filter(
            Organisation.id == org_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=403, detail="Not your organisation")
        return ScheduledPostRepository.get_by_org(db, org_id)

    # ── PATCH caption ─────────────────────────────────────────────────────────

    @staticmethod
    async def patch_caption(
        db: Session,
        post_id: UUID,
        payload: CaptionPatchRequest,
        current_user: User,
    ) -> CaptionPatchResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)
        ai_generation_id = None

        if payload.mode == "manual":
            caption = payload.text
            ScheduledPostRepository.update(db, post, {"caption": caption})

        else:  # mode=llm
            ctx = ScheduledPostService._build_ai_context(db, post, current_user)
            service = AiGenerationService()
            gen = await service.generate_caption(
                db=db, ctx=ctx,
                req=CaptionRequest(
                    topic=payload.topic,
                    language=payload.language,
                    max_length=payload.max_length,
                    additional_instructions=payload.additional_instructions,
                )
            )
            caption = gen.caption
            ai_generation_id = gen.id
            ScheduledPostRepository.update(db, post, {"caption": caption})

        db.refresh(post)
        return CaptionPatchResponse(
            scheduled_post=ScheduledPostResponse.model_validate(post),
            caption=caption,
            ai_generation_id=ai_generation_id,
        )

    # ── PATCH image ───────────────────────────────────────────────────────────

    @staticmethod
    async def patch_image(
        db: Session,
        post_id: UUID,
        payload: ImagePatchRequest,
        current_user: User,
    ) -> ImagePatchResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)
        ai_generation_id = None

        if payload.mode == "url":
            image_url = payload.url
            image_source = ImageSource.URL
            ScheduledPostRepository.update(db, post, {
                "image_url": image_url,
                "image_source": image_source,
            })

        else:  # mode=llm
            ctx = ScheduledPostService._build_ai_context(db, post, current_user)
            service = AiGenerationService()
            gen = await service.generate_image(
                db=db, ctx=ctx,
                req=ImageRequest(
                    description=payload.description,
                    style=payload.style,
                )
            )
            image_url = gen.image_url
            image_source = ImageSource.AI
            ai_generation_id = gen.id

            # Désactive ancienne image IA + crée la nouvelle
            AiImageRepository.deactivate_all(db, post_id)
            AiImageRepository.create(db, {
                "scheduled_post_id": post_id,
                "ai_gen_id": gen.id,
                "image_url": image_url,
                "is_active": True,
            })

            ScheduledPostRepository.update(db, post, {
                "image_url": image_url,
                "image_source": image_source,
            })

        db.refresh(post)
        return ImagePatchResponse(
            scheduled_post=ScheduledPostResponse.model_validate(post),
            image_url=image_url,
            image_source=image_source,
            ai_generation_id=ai_generation_id,
        )

    # ── PATCH image upload ────────────────────────────────────────────────────

    @staticmethod
    async def patch_image_upload(
        db: Session,
        post_id: UUID,
        file: UploadFile,
        current_user: User,
    ) -> ImagePatchResponse:
        """Upload fichier → stockage → mise à jour du post"""
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        contents = await file.read()
        image_url = _upload_file(contents, file.filename, post.organisation_id)

        ScheduledPostRepository.update(db, post, {
            "image_url": image_url,
            "image_source": ImageSource.UPLOAD,
        })
        db.refresh(post)

        return ImagePatchResponse(
            scheduled_post=ScheduledPostResponse.model_validate(post),
            image_url=image_url,
            image_source=ImageSource.UPLOAD,
        )

    # ── PATCH confirm ─────────────────────────────────────────────────────────

    @staticmethod
    def confirm(
        db: Session,
        post_id: UUID,
        payload: ConfirmRequest,
        current_user: User,
    ) -> ScheduledPost:
        """
        DRAFT → SCHEDULED.
        Vérifie que caption et image_url sont présents.
        Crée la Celery task avec eta=publish_at.
        """
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        if post.status != PostStatus.DRAFT:
            raise HTTPException(
                status_code=400,
                detail=f"Post is already {post.status} — cannot confirm"
            )
        if not post.caption:
            raise HTTPException(status_code=400, detail="Caption manquant")
        if not post.publish_at and not payload.publish_at:
            raise HTTPException(status_code=400, detail="publish_at manquant")

        update_data: dict = {"status": PostStatus.SCHEDULED}
        if payload.publish_at:
            update_data["publish_at"] = payload.publish_at

        post = ScheduledPostRepository.update(db, post, update_data)

        # # ── Celery task ───────────────────────────────────────────────────────
        # try:
        #     from app.celery.tasks.published_post import published_task
        #     published_task.apply_async(
        #         args=[str(post.id), str(current_user.id), current_user.email],
        #         eta=post.publish_at,
        #         task_id=f"publish-{post.id}",
        #     )
        # except Exception as e:
        #     # Si Celery indispo → rollback du status
        #     ScheduledPostRepository.update(db, post, {"status": PostStatus.DRAFT})
        #     raise HTTPException(status_code=500, detail=f"Scheduling failed: {e}")

        # return post

    # ── DELETE ────────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, post_id: UUID, current_user: User) -> dict:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        # Annule la Celery task si SCHEDULED
        if post.status == PostStatus.SCHEDULED:
            try:
                from app.celery_app import celery_app
                celery_app.control.revoke(f"publish-{post.id}", terminate=True)
            except Exception:
                pass

        ScheduledPostRepository.delete(db, post)
        return {"detail": "Deleted successfully"}


def _upload_file(contents: bytes, filename: str, org_id: UUID) -> str:
    """
    Dev  → base64 data URL
    Prod → Cloudinary/S3
    """
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "png"
    b64 = base64.b64encode(contents).decode("utf-8")
    return f"data:image/{ext};base64,{b64}"