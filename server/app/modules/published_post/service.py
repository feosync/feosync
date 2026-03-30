from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.modules.published_post.repository import PublishedPostRepository
from app.modules.published_post.model import PublishedPost
from app.modules.fb_page.model import Facebook
from app.shared.pagination.paginator import PaginationParams

META_GRAPH_URL = "https://graph.facebook.com/v19.0"
META_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class PublishedPostService:

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
    def get_by_post_id_with_page_id(db:Session, post_id:str):
        post = PublishedPostRepository.get_by_post_id_with_page_id(db, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Published post not found")
        return post
    
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
            
        #  Accès direct par channel 
        fb_id  = scheduled_post.page_ids.get("facebook")
        

        if fb_id:
            fb_page = db.query(Facebook).filter(Facebook.id == fb_id).first()
        
    

        if not fb_page:
            raise HTTPException(status_code=404, detail="Facebook page not found")

        # Appelle Meta Graph API
        async with httpx.AsyncClient(timeout=META_TIMEOUT) as client:
            payload = {
                "message": scheduled_post.caption or "",
                "access_token": fb_page.access_token,
            }
            if scheduled_post.image_url:
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/photos",
                    data={**payload, "url": scheduled_post.image_url},
                )
            else:
                r = await client.post(
                    f"{META_GRAPH_URL}/{fb_page.fb_page_id}/feed",
                    data=payload,
                )

        data = r.json()
        if "error" in data:
            # ── Notif échec ───────────────────────────────────────────────────
            PublishedPostService._notify(
                db=db,
                background_tasks=background_tasks,
                user_id=user_id,
                user_email=user_email,
                type="post_failed",
                title="Échec de publication ❌",
                message=data['error']['message'],
                template_body={"reason": data['error']['message']},
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Meta API error: {data['error']['message']}"
            )

        if "post_id" in data and data["post_id"]:
            meta_post_id = data["post_id"]
        elif "id" in data and data["id"]:
            meta_post_id = data["id"]
        else:

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Impossible de récupérer l'ID du post depuis Meta"
            )
        
        

        # Crée le PublishedPost
        published = PublishedPostRepository.create(db, {
            "scheduled_post_id": scheduled_post_id,
            "facebook_page_id": fb_id,
            "post_id": meta_post_id,
            "channel": "facebook",
            "published_at": datetime.now(timezone.utc),
            "initial_reach": 0,
            "initial_impressions": 0,
        })

        # Met à jour le statut du ScheduledPost
        ScheduledPostRepository.update(
            db, scheduled_post, {"status": PostStatus.PUBLISHED}
        )

        # ── Notif succès ──────────────────────────────────────────────────────
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
            },
        )

        return published

    @staticmethod
    def _notify(
        db,
        background_tasks: BackgroundTasks,
        user_id: UUID,
        user_email: str,
        type: str,
        title: str,
        message: str,
        template_body: dict,
    ) -> None:
        """Helper — centralise l'appel NotificationService"""
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

    @staticmethod
    def delete(db: Session, post_id: UUID) -> dict:
        post = PublishedPostService.get_by_id(db, post_id)
        PublishedPostRepository.delete(db, post)
        return {"detail": "Published post deleted"}