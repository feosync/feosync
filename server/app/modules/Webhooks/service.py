from app.modules.fb_page.service import FacebookService
from app.modules.fb_page.model import Facebook
from app.core.database import get_db
import httpx
from app.core.logger import get_logger
from app.modules.published_post.service import PublishedPostService as pub_service

logger = get_logger(__name__)

class WebhooksService:
    def __init__(self):
        self.fb_service = FacebookService()

    async def abonner_page_au_webhook(self, page_id: str, page_access_token: str):
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"https://graph.facebook.com/v25.0/{page_id}/subscribed_apps",
                params={
                    "subscribed_fields": "feed",
                    "access_token": page_access_token
                }
            )
            data = res.json()
            if data.get("success"):
               logger.info(f"Page {page_id} abonnée au webhook")
            else:
               logger.info(f"❌ Erreur page {page_id}: {data}")

    async def startup(self):
        # ✅ appel direct de get_db() sans Depends()
        logger.info("initalisation de l'abonnement webhook")
        db = next(get_db())
        pages: list[Facebook] = self.fb_service.get_all(db)
        for page in pages:
            
            await self.abonner_page_au_webhook(          # ✅ await ajouté
                page_id=page.fb_page_id,
                page_access_token=page.access_token
            )

    async def process_entries(self, entries: list, db):
        for entry in entries:
            page_id = entry.get("id")
            post_id= entry.get("changes", [{}])[0].get("value", {}).get("post_id")
            page: Facebook = FacebookService.get_by_fb_page_id(db=db, fb_page_id=page_id)
            if page is None:
                continue
            published_post = pub_service.get_by_post_id(db, post_id)  # Vérifie si le post existe déjà dans notre DB
            if not published_post:
                continue
            if not published_post.is_auto_comment:  # Vérifie si le post est configuré pour les commentaires automatiques
                continue
            
            for change in entry.get("changes", []):
                if change.get("field") == "feed":
                    value = change.get("value", {})

                    if value.get("item") == "comment" and value.get("verb") == "add":
                        
                        from_id      = value.get("from", {}).get("id")
                        from_name    = value.get("from", {}).get("name", "quelqu'un")
                        comment_id   = value.get("comment_id")
                        comment_text = value.get("message", "")
                        if from_id == page_id:
                            continue

                        logger.info(f"💬 [{page.page_name}] {from_name}: {comment_text}")
                        await self.repondre_commentaire(
                            comment_id=comment_id,
                            nom=from_name,
                            page_access_token=page.access_token
                        )

    async def repondre_commentaire(self, comment_id: str, nom: str, page_access_token: str):
        reponse = f"Merci {nom} pour votre commentaire ! 🙏"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    f"https://graph.facebook.com/v25.0/{comment_id}/comments",
                    json={
                        "message": reponse,
                        "access_token": page_access_token
                    }
                )
                res.raise_for_status()
                print(f"✅ Réponse postée: {reponse}")
            except httpx.HTTPStatusError as e:
                print(f"❌ Erreur API Facebook: {e.response.text}")