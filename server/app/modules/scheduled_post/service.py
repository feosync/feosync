from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from uuid import UUID, uuid4

from app.core.config import settings
from app.modules.scheduled_post.models.scheduled_post_model import (
    ScheduledPost, PostStatus, ImageSource
)
from app.modules.scheduled_post.models.scheduled_post_image import ScheduledPostImage
from app.modules.scheduled_post.repository import ScheduledPostRepository, ImageRepository
from app.modules.scheduled_post.schemas import (
    ScheduledPostCreate, ScheduledPostResponse, ScheduledPostImageResponse,
    CaptionPatchRequest, CaptionPatchResponse,
    ImagePatchRequest, AddImageResponse,
    ConfirmRequest, ReorderRequest,
)
from app.modules.ai_generation.schemas import AiContext, CaptionRequest, ImageRequest
from app.modules.ai_generation.service.llm_service import AiGenerationService
from app.modules.organisations.model import Organisation
from app.modules.fb_page.model import Facebook
from app.modules.user.model import User
from app.shared.pagination.paginator import PaginationParams

# Meta autorise jusqu'à 10 images par carrousel
MAX_IMAGES_PER_POST = 10


class ScheduledPostService:

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _get_post_owned(db: Session, post_id: UUID, current_user: User) -> ScheduledPost:
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
    def _check_image_limit(db: Session, post_id: UUID) -> None:
        count = len(ImageRepository.get_by_post(db, post_id))
        if count >= MAX_IMAGES_PER_POST:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {MAX_IMAGES_PER_POST} images par post (limite Meta carrousel)",
            )

    @staticmethod
    def _build_ai_context(db: Session, post: ScheduledPost, current_user: User) -> AiContext:
        org = db.query(Organisation).filter(Organisation.id == post.organisation_id).first()

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

    @staticmethod
    def _build_post_response(post: ScheduledPost) -> ScheduledPostResponse:
        return ScheduledPostResponse(
            id=post.id,
            organisation_id=post.organisation_id,
            page_ids=post.page_ids,
            caption=post.caption,
            images=[
                ScheduledPostImageResponse.from_orm_image(img)
                for img in post.images
            ],
            publish_at=post.publish_at,
            status=post.status,
            post_template_id=post.post_template_id,
            created_at=post.created_at,
            updated_at=post.updated_at,
        )

    # ── CREATE ────────────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, payload: ScheduledPostCreate, current_user: User) -> ScheduledPost:
        fb_page = db.query(Facebook).filter(Facebook.id == payload.facebook_page_id).first()
        if not fb_page:
            raise HTTPException(status_code=404, detail="Facebook page not found")

        org = db.query(Organisation).filter(
            Organisation.id == fb_page.organisation_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=403, detail="Not your page")
        

        # ✅ Vérification limite posts/mois
        from app.modules.plans.model import Plan
        plan = db.get(Plan, current_user.plan_id) if current_user.plan_id else None
        max_post_month = plan.max_post_month if plan else 7

        if max_post_month != -1:
            current_count = ScheduledPostRepository.count_by_org_this_month(db, org.id)
            if current_count >= max_post_month:
                raise HTTPException(
                    status_code=403,
                    detail=f"Votre plan vous limite à {max_post_month} post(s) par mois. Passez à un plan supérieur."
                )


        return ScheduledPostRepository.create(db, {
            "organisation_id": fb_page.organisation_id,
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
    def get_by_id_internal(db: Session, post_id: UUID) -> ScheduledPost:
        return ScheduledPostRepository.get_by_id(db, post_id)

    @staticmethod
    def get_by_org(
        db: Session,
        org_id: UUID,
        current_user: User,
        params: PaginationParams,
        status: PostStatus | None = None,
        search: str | None = None,
        year: int | None = None,
        month: int | None = None,
        week: int | None = None,
    ) -> tuple[list[ScheduledPost], int]:
        org = db.query(Organisation).filter(
            Organisation.id == org_id,
            Organisation.user_id == current_user.id,
        ).first()
        if not org:
            raise HTTPException(status_code=403, detail="Not your organisation")

        return ScheduledPostRepository.get_by_org_paginated(
            db, org_id, params,
            status=status, search=search,
            year=year, month=month, week=week,
        )

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

        else:
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
            scheduled_post=ScheduledPostService._build_post_response(post),
            caption=caption,
            ai_generation_id=ai_generation_id,
        )

    # ── ADD image (url ou llm) ────────────────────────────────────────────────

    @staticmethod
    async def add_image(
        db: Session,
        post_id: UUID,
        payload: ImagePatchRequest,
        current_user: User,
    ) -> AddImageResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)
        ScheduledPostService._check_image_limit(db, post_id)
        ai_generation_id = None

        if payload.mode == "url":
            img = ImageRepository.add(db, {
                "scheduled_post_id": post_id,
                "image_url": payload.url,
                "image_source": ImageSource.URL,
            })

        else:
            ctx = ScheduledPostService._build_ai_context(db, post, current_user)
            service = AiGenerationService()
            gen = await service.generate_image(
                db=db, ctx=ctx,
                req=ImageRequest(description=payload.description, style=payload.style)
            )
            ai_generation_id = gen.id
            img = ImageRepository.add(db, {
                "scheduled_post_id": post_id,
                "image_url": gen.image_url,
                "image_source": ImageSource.AI,
                "ai_gen_id": gen.id,
            })

        db.refresh(post)
        return AddImageResponse(
            scheduled_post=ScheduledPostService._build_post_response(post),
            image=ScheduledPostImageResponse.from_orm_image(img),
            ai_generation_id=ai_generation_id,
        )

    # ── ADD image upload ──────────────────────────────────────────────────────

    @staticmethod
    async def add_image_upload(
        db: Session,
        post_id: UUID,
        file: UploadFile,
        current_user: User,
    ) -> AddImageResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)
        ScheduledPostService._check_image_limit(db, post_id)

        contents = await file.read()
        image_url = _upload_file(contents, file.filename, post.organisation_id)

        img = ImageRepository.add(db, {
            "scheduled_post_id": post_id,
            "image_url": image_url,
            "image_source": ImageSource.UPLOAD,
        })

        db.refresh(post)
        return AddImageResponse(
            scheduled_post=ScheduledPostService._build_post_response(post),
            image=ScheduledPostImageResponse.from_orm_image(img),
        )

    # ── REMOVE image ──────────────────────────────────────────────────────────

    @staticmethod
    def remove_image(
        db: Session,
        post_id: UUID,
        image_id: UUID,
        current_user: User,
    ) -> ScheduledPostResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)
        ImageRepository.remove(db, image_id, post_id)
        db.refresh(post)
        return ScheduledPostService._build_post_response(post)

    # ── REORDER images ────────────────────────────────────────────────────────

    @staticmethod
    def reorder_images(
        db: Session,
        post_id: UUID,
        payload: ReorderRequest,
        current_user: User,
    ) -> ScheduledPostResponse:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        existing_ids = {img.id for img in post.images}
        requested_ids = set(payload.ordered_ids)
        if existing_ids != requested_ids:
            raise HTTPException(
                status_code=400,
                detail="ordered_ids doit contenir exactement les IDs des images du post",
            )

        ImageRepository.reorder(db, post_id, payload.ordered_ids)
        db.refresh(post)
        return ScheduledPostService._build_post_response(post)

    # ── CONFIRM ───────────────────────────────────────────────────────────────

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
                detail=f"Post déjà {post.status} — impossible de modifier",
            )

        if not post.caption:
            raise HTTPException(status_code=400, detail="Caption manquant")

        publish_at = payload.publish_at or post.publish_at
        if not publish_at:
            raise HTTPException(status_code=400, detail="publish_at manquant")

        update_data: dict = {"status": PostStatus.SCHEDULED}
        if payload.publish_at:
            update_data["publish_at"] = payload.publish_at

        return ScheduledPostRepository.update(db, post, update_data)

    # ── DELETE ────────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, post_id: UUID, current_user: User) -> dict:
        post = ScheduledPostService._get_post_owned(db, post_id, current_user)

        if post.status == PostStatus.SCHEDULED:
            from app.celery.task.scheduled_post_events import _safe_revoke
            _safe_revoke(str(post.id))

        ScheduledPostRepository.delete(db, post)
        return {"detail": "Deleted successfully"}


# ── Upload helper ─────────────────────────────────────────────────────────────

def _upload_file(contents: bytes, filename: str, org_id: UUID) -> str:
    import os
    from pathlib import Path

    upload_dir = Path("app/static/uploads") / str(org_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    unique_name = f"{uuid4()}.{ext}"
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as f:
        f.write(contents)

    base_url = settings.SERVER_URL
    return f"{base_url}/static/uploads/{org_id}/{unique_name}"

    # ── Prod : Cloudinary ─────────────────────────────────────────────────────
    # import cloudinary.uploader
    # result = cloudinary.uploader.upload(contents, folder=f"feosync/{org_id}")
    # return result["secure_url"]