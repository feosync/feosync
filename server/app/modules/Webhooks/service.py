from app.modules.fb_page.service import FacebookService
from app.modules.fb_page.model import Facebook
from app.core.database import get_db
import httpx
from app.core.logger import get_logger
from app.modules.published_post.service import PublishedPostService as pub_service
from app.modules.ai_generation.services.comment_service import CommentService 

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

            page: Facebook = FacebookService.get_by_fb_page_id(db=db, fb_page_id=page_id)
            if page is None:
                continue

            for change in entry.get("changes", []):
                if change.get("field") != "feed":
                    continue

                value = change.get("value", {})

                if value.get("item") != "comment" or value.get("verb") != "add":
                    continue

                # ✅ post_id récupéré ici dans la boucle, pas avant
                post_id      = value.get("post_id")
                from_id      = value.get("from", {}).get("id")
                from_name    = value.get("from", {}).get("name", "quelqu'un")
                comment_id   = value.get("comment_id")
                comment_text = value.get("message", "")

                # Ignorer les commentaires de la page elle-même
                if from_id == page_id:
                    continue

                # Vérifier si le post existe dans notre DB
                if post_id and "_" in post_id:
                        real_post_id = post_id.split("_")[1]
                        print(real_post_id)
                        published_post = pub_service.get_by_post_id(db, real_post_id)
                else:
                        published_post = None
                        
                if not published_post:
                    continue

                # Vérifier si les commentaires automatiques sont activés
                if not published_post.is_auto_comment:
                    continue

                comment_service = CommentService(published_post)

                # Générer et poster la réponse
                response = await comment_service.generate_reply(comment_text, db)
                await self.repondre_commentaire(
                    comment_id=comment_id,
                    nom=from_name,
                    page_access_token=page.access_token,
                    reponse=response
                )

            # Classification en parallèle (pas besoin d'await si c'est sync)
            comment_service.comment_classification(comment=comment_text)

    async def repondre_commentaire(self, comment_id: str, nom: str, page_access_token: str, reponse:str="Merci pour votre commentaire ! 🙏"):
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    f"https://graph.facebook.com/v25.0/{comment_id}/comments",
                    json={
                        "message": f"@{nom}, {reponse}" ,
                        "access_token": page_access_token
                    }
                )
                res.raise_for_status()
                print(f"✅ Réponse postée: {reponse}")
            except httpx.HTTPStatusError as e:
                print(f"❌ Erreur API Facebook: {e.response.text}")