from __future__ import annotations
import json
from pathlib import Path
from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.modules.published_post.repository import PublishedPostRepository
from app.modules.published_post.model import PublishedPost
from app.modules.fb_page.model import Facebook
from app.modules.scheduled_post.models.scheduled_post_image import ScheduledPostImage
from app.modules.scheduled_post.models.scheduled_post_model import ImageSource
from app.shared.pagination.paginator import PaginationParams

META_GRAPH_URL = "https://graph.facebook.com/v19.0"
META_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class PublishedPostService:

    # ── READ ──────────────────────────────────────────────────────────────────

    @staticmethod
    def get_all_by_org(
        db: Session,
        org_id: UUID,
        params: PaginationParams,
        search: str | None = None,
        year: int | None = None,
        month: int | None = None,
        week: int | None = None,
    ) -> tuple[list[PublishedPost], int]:
        return PublishedPostRepository.get_all_by_org(
            db, org_id, params,
            search=search, year=year, month=month, week=week,
        )

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> PublishedPost:
        post = PublishedPostRepository.get_by_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Published post not found")
        return post

    @staticmethod
    def get_by_page(db: Session, facebook_page_id: UUID, org_id: UUID) -> list[PublishedPost]:
        from app.modules.fb_page.repository import FacebookPageRepository
        page = FacebookPageRepository.get_by_id(db, facebook_page_id, org_id)
        if not page:
            raise HTTPException(status_code=404, detail="Facebook page not found")
        return PublishedPostRepository.get_by_page(db, facebook_page_id)

    @staticmethod
    def get_by_post_id_with_page_id(db: Session, post_id: str) -> PublishedPost:
        post = PublishedPostRepository.get_by_post_id_with_page_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Published post not found")
        return post
    
    @staticmethod
    def set_auto_comment(
        db: Session,
        post_id: UUID,
        is_auto_comment: bool,
        instructions: str | None = None,
        keywords: str | None = None,
    ) -> PublishedPost:
        post = PublishedPostService.get_by_id(db, post_id)
        return PublishedPostRepository.set_auto_comment(
            db,
            post=post,
            is_auto_comment=is_auto_comment,
            instructions=instructions,
            keywords=keywords,
        )

    # ── PUBLISH ───────────────────────────────────────────────────────────────

    @staticmethod
    async def publish_to_facebook(
        db: Session,
        scheduled_post_id: UUID,
        background_tasks: BackgroundTasks,
        user_id: UUID,
        user_email: str,
    ) -> PublishedPost:
        from app.modules.scheduled_post.repository import ScheduledPostRepository
        from app.modules.scheduled_post.models.scheduled_post_model import PostStatus

        scheduled_post = ScheduledPostRepository.get_by_id(db, scheduled_post_id)
        if not scheduled_post:
            raise HTTPException(status_code=404, detail="Scheduled post not found")

        existing = PublishedPostRepository.get_by_scheduled_post(db, scheduled_post_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This scheduled post has already been published",
            )

        fb_id = scheduled_post.page_ids.get("facebook")
        fb_page = db.query(Facebook).filter(Facebook.id == fb_id).first() if fb_id else None
        if not fb_page:
            raise HTTPException(status_code=404, detail="Facebook page not found")

        images: list[ScheduledPostImage] = scheduled_post.images  # ordonnées par position
        caption = scheduled_post.caption or ""

        # ── Appel Meta ────────────────────────────────────────────────────────
        try:
            meta_post_id = await PublishedPostService._send_to_meta(
                fb_page=fb_page,
                caption=caption,
                images=images,
            )
        except HTTPException as e:
            PublishedPostService._notify(
                db=db,
                background_tasks=background_tasks,
                user_id=user_id,
                user_email=user_email,
                type="post_failed",
                title="Échec de publication ❌",
                message=e.detail,
                template_body={"reason": e.detail},
            )
            raise

        # ── Permalink Meta ────────────────────────────────────────────────────
        meta_permalink = f"https://www.facebook.com/{meta_post_id}"

        # ── Sauvegarde PublishedPost ──────────────────────────────────────────
        published = PublishedPostRepository.create(db, {
            "scheduled_post_id": scheduled_post_id,
            "facebook_page_id": fb_id,
            "post_id": meta_post_id,
            "meta_permalink": meta_permalink,
            "channel": "facebook",
            "image_count": len(images),
            "published_at": datetime.now(timezone.utc),
            "initial_reach": 0,
            "initial_impressions": 0,
        })

        # ── Mise à jour statut ScheduledPost ──────────────────────────────────
        ScheduledPostRepository.update(
            db, scheduled_post, {"status": PostStatus.PUBLISHED}
        )

        # ── Nettoyage fichiers uploadés (background) ──────────────────────────
        upload_images = [img for img in images if img.image_source == ImageSource.UPLOAD]
        if upload_images:
            background_tasks.add_task(
                _cleanup_uploaded_files,
                [img.image_url for img in upload_images],
            )

        # ── Notification succès ───────────────────────────────────────────────
        PublishedPostService._notify(
            db=db,
            background_tasks=background_tasks,
            user_id=user_id,
            user_email=user_email,
            type="post_published",
            title="Post publié ✅",
            message=f"Votre post sur {fb_page.page_name} a été publié.",
            template_body={
                "page_name": fb_page.page_name,
                "post_id": meta_post_id,
                "permalink": meta_permalink,
            },
        )

        return published

    # ── Meta API helper ───────────────────────────────────────────────────────

    @staticmethod
    async def _send_to_meta(
        fb_page: Facebook,
        caption: str,
        images: list[ScheduledPostImage],
    ) -> str:
        """
        Envoie le post à Meta et retourne le meta_post_id.

        - 0 image  → feed text-only
        - 1 image  → photos endpoint
        - N images → carrousel (upload unpublished + feed avec attached_media)
        """
        base_payload = {
            "message": caption,
            "access_token": fb_page.access_token,
        }

        async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:

            if not images:
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/feed",
                    data=base_payload,
                )

            elif len(images) == 1:
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/photos",
                    data={**base_payload, "url": images[0].image_url},
                )

            else:
                # Carrousel : upload chaque photo sans publication
                media_fbids = []
                for img in images:
                    photo_r = await client.post(
                        f"{META_GRAPH_URL}/{fb_page.fb_page_id}/photos",
                        data={
                            "url": img.image_url,
                            "published": "false",
                            "access_token": fb_page.access_token,
                        },
                    )
                    photo_data = photo_r.json()
                    if "error" in photo_data:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Meta photo upload error: {photo_data['error']['message']}",
                        )
                    media_fbids.append({"media_fbid": photo_data["id"]})

                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/feed",
                    data={
                        **base_payload,
                        "attached_media": json.dumps(media_fbids),
                    },
                )

        data = r.json()
        if "error" in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meta API error: {data['error']['message']}",
            )

        meta_post_id = data.get("post_id") or data.get("id")
        if not meta_post_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Impossible de récupérer l'ID du post depuis Meta",
            )

        return meta_post_id

    # ── METRICS ───────────────────────────────────────────────────────────────

    @staticmethod
    async def sync_initial_metrics(db: Session, published_post_id: UUID) -> PublishedPost:
        post = PublishedPostService.get_by_id(db, published_post_id)
        if not post.post_id:
            raise HTTPException(status_code=400, detail="No Meta post ID available")

        fb_page = post.facebook_page

        async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:
            r = await client.get(
                f"{META_GRAPH_URL}/{post.post_id}/insights",
                params={
                    "metric": "post_impressions,post_reach",
                    "access_token": fb_page.access_token,
                },
            )

        data = r.json()
        if "error" in data:
            return post

        metrics = {
            item["name"]: item["values"][0]["value"]
            for item in data.get("data", [])
        }

        return PublishedPostRepository.update(db, post, {
            "initial_reach": metrics.get("post_reach", 0),
            "initial_impressions": metrics.get("post_impressions", 0),
        })

    # ── DELETE ────────────────────────────────────────────────────────────────

    @staticmethod
    def delete(db: Session, post_id: UUID) -> dict:
        post = PublishedPostService.get_by_id(db, post_id)
        PublishedPostRepository.delete(db, post)
        return {"detail": "Published post deleted"}

    # ── Notification helper ───────────────────────────────────────────────────

    @staticmethod
    def _notify(
        db: Session,
        background_tasks: BackgroundTasks,
        user_id: UUID,
        user_email: str,
        type: str,
        title: str,
        message: str,
        template_body: dict,
    ) -> None:
        from app.modules.notifications.service import NotificationService
        from app.modules.notifications.model import NotificationType, NotificationChannel

        NotificationService.create(
            db=db,
            background_tasks=background_tasks,
            user_id=user_id,
            title=title,
            message=message,
            type=NotificationType(type),
            channel=NotificationChannel.BOTH,
            user_email=user_email,
            template_body=template_body,
        )


# ── Background task : nettoyage fichiers uploadés ─────────────────────────────

def _cleanup_uploaded_files(image_urls: list[str]) -> None:
    """
    Supprime les fichiers uploadés localement après publication réussie.
    En prod (Cloudinary/S3), appeler l'API de suppression à la place.
    """
    base_url = settings.SERVER_URL

    for url in image_urls:
        try:
            # Extrait le chemin relatif depuis l'URL publique
            # ex: http://localhost:8000/static/uploads/org-id/uuid.jpg
            relative = url.removeprefix(base_url).lstrip("/")
            # ex: static/uploads/org-id/uuid.jpg
            path = Path("app") / relative

            if path.exists() and path.is_file():
                path.unlink()

            # ── Prod Cloudinary ───────────────────────────────────────────────
            # public_id = url.split("/")[-1].rsplit(".", 1)[0]
            # cloudinary.uploader.destroy(f"feosync/{org_id}/{public_id}")

        except Exception:
            pass  # Ne jamais bloquer la publication pour un échec de nettoyage