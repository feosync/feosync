from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import httpx

from app.core.config import settings
from app.modules.published_post.repository import PublishedPostRepository
from app.modules.published_post.schemas import PublishedPostCreate, ManualPublishRequest
from app.modules.published_post.model import PublishedPost
from app.modules.fb_page.repository import FacebookPageRepository

META_GRAPH_URL = "https://graph.facebook.com/v19.0"
META_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class PublishedPostService:

    # ── Lecture ───────────────────────────────────────────────────────────────

    @staticmethod
    def get_all_by_org(db: Session, org_id: UUID) -> list[PublishedPost]:
        return PublishedPostRepository.get_all_by_org(db, org_id)

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> PublishedPost:
        post = PublishedPostRepository.get_by_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Published post not found")
        return post

    @staticmethod
    def get_by_page(db: Session, facebook_page_id: UUID, org_id: UUID) -> list[PublishedPost]:
        # Vérifie que la page appartient à l'org
        page = FacebookPageRepository.get_by_id(db, facebook_page_id, org_id)
        if not page:
            raise HTTPException(status_code=404, detail="Facebook page not found")
        return PublishedPostRepository.get_by_page(db, facebook_page_id)

    # ── Publication ───────────────────────────────────────────────────────────

    @staticmethod
    async def publish_to_facebook(
        db: Session,
        scheduled_post_id: UUID,
        facebook_page_id: UUID,
    ) -> PublishedPost:
        """
        Publie un ScheduledPost sur Facebook via Meta Graph API.
        Appelé par le scheduler OU manuellement.

        Flux :
        1. Récupère le ScheduledPost et la FacebookPage
        2. Appelle POST /{page_id}/feed via Meta API
        3. Meta retourne un post_id → on crée le PublishedPost
        """
        from app.modules.scheduled_post.repository.scheduled_post_repository import ScheduledPostRepository
        from app.modules.scheduled_post.models.scheduled_post_model import PostStatus

        # Récupère le scheduled post
        scheduled_post = ScheduledPostRepository.get_by_id(db, scheduled_post_id)
        if not scheduled_post:
            raise HTTPException(status_code=404, detail="Scheduled post not found")

        # Vérifie qu'il n'est pas déjà publié
        existing = PublishedPostRepository.get_by_scheduled_post(db, scheduled_post_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This scheduled post has already been published"
            )

        # Récupère la page Facebook
        fb_page = db.query(__import__(
            'app.modules.fb_page.model', fromlist=['Facebook']
        ).Facebook).filter_by(id=facebook_page_id).first()
        if not fb_page:
            raise HTTPException(status_code=404, detail="Facebook page not found")

        # Appelle Meta Graph API
        async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:
            payload = {
                "message": scheduled_post.caption or "",
                "access_token": fb_page.access_token,
            }
            if scheduled_post.image_url:
                # Post avec image
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/photos",
                    data={**payload, "url": scheduled_post.image_url},
                )
            else:
                # Post texte uniquement
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/feed",
                    data=payload,
                )

        data = r.json()
        if "error" in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meta API error: {data['error']['message']}"
            )

        # Meta retourne {"id": "page_id_post_id"} ou {"post_id": "..."}
        meta_post_id = data.get("id") or data.get("post_id")

        # Crée le PublishedPost
        published = PublishedPostRepository.create(db, {
            "scheduled_post_id": scheduled_post_id,
            "facebook_page_id": facebook_page_id,
            "post_id": meta_post_id,
            "channel": "facebook",
            "published_at": datetime.now(timezone.utc),
            "initial_reach": 0,
            "initial_impressions": 0,
        })

        # Met à jour le statut du ScheduledPost → published
        ScheduledPostRepository.update_scheduled(db, scheduled_post, {"status": PostStatus.PUBLISHED})

        return published

    @staticmethod
    async def sync_initial_metrics(db: Session, published_post_id: UUID) -> PublishedPost:
        """
        Récupère reach/impressions initiaux depuis Meta API
        Appelé ~1h après publication
        """
        post = PublishedPostService.get_by_id(db, published_post_id)
        if not post.post_id:
            raise HTTPException(status_code=400, detail="No Meta post ID available")

        # Récupère le token via la page
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
            return post  # Pas de metrics encore disponibles → pas d'erreur

        metrics = {item["name"]: item["values"][0]["value"] for item in data.get("data", [])}

        return PublishedPostRepository.update(db, post, {
            "initial_reach": metrics.get("post_reach", 0),
            "initial_impressions": metrics.get("post_impressions", 0),
        })

    @staticmethod
    def delete(db: Session, post_id: UUID) -> dict:
        post = PublishedPostService.get_by_id(db, post_id)
        PublishedPostRepository.delete(db, post)
        return {"detail": "Published post deleted"}