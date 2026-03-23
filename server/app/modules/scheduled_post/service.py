from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from uuid import UUID, uuid4

from app.core.config import settings
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
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        if post.status in (PostStatus.PUBLISHED, PostStatus.FAILED):
            raise HTTPException(
                status_code=400,
                detail=f"Post déjà {post.status} — impossible de modifier"
            )

        if not post.caption:
            raise HTTPException(status_code=400, detail="Caption manquant")

        publish_at = payload.publish_at or post.publish_at
        if not publish_at:
            raise HTTPException(status_code=400, detail="publish_at manquant")

        update_data: dict = {"status": PostStatus.SCHEDULED}
        if payload.publish_at:
            update_data["publish_at"] = payload.publish_at

    
        post = ScheduledPostRepository.update(db, post, update_data)

        return post


    # ── DELETE ────────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, post_id: UUID, current_user: User) -> dict:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        if post.status == PostStatus.SCHEDULED:
            from app.celery.task.scheduled_post_events import _safe_revoke
            _safe_revoke(str(post.id))

        ScheduledPostRepository.delete(db, post)
        return {"detail": "Deleted successfully"}




def _upload_file(contents: bytes, filename: str, org_id: UUID) -> str:
    """
    Dev  → sauvegarde dans /static/uploads/ et retourne une URL publique
    Prod → Cloudinary/S3
    """
    import os
    from pathlib import Path

    # ── Dev : sauvegarde dans static/uploads ─────────────────────────────────
    upload_dir = Path("app/static/uploads") / str(org_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    
    unique_name = f"{uuid4()}.{ext}"
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as f:
        f.write(contents)

    # ← URL publique accessible par Meta
    base_url = settings.SERVER_URL  
    return f"{base_url}/static/uploads/{org_id}/{unique_name}"

    # ── Prod : Cloudinary ─────────────────────────────────────────────────────
    # import cloudinary.uploader
    # result = cloudinary.uploader.upload(contents, folder=f"feosync/{org_id}")
    # return result["secure_url"]