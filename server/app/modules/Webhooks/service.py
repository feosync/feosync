from app.modules.fb_page.service import FacebookService
from app.modules.fb_page.model import Facebook
from app.core.database import get_db
import httpx
from app.core.logger import get_logger
from app.modules.ai_generation.comment_service import CommentService
from app.modules.published_post.service import PublishedPostService
from app.modules.published_post.model import PublishedPost

logger = get_logger(__name__)

class WebhooksService:
    def __init__(self):
        self.fb_service = FacebookService()
        self.comment_service = CommentService()
        self.published_post_service = PublishedPostService()

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
                if change.get("field") == "feed":
                    value = change.get("value", {})

                    if value.get("item") == "comment" and value.get("verb") == "add":
                        post_id     = value.get("post_id")
                        from_id      = value.get("from", {}).get("id")
                        from_name    = value.get("from", {}).get("name", "quelqu'un")
                        comment_id   = value.get("comment_id")
                        comment_text = value.get("message", "")
                        print(f"post_id: {post_id}, from_id: {from_id}, from_name: {from_name}, comment_id: {comment_id}, comment_text: {comment_text}")
                        published_post: PublishedPost = self.published_post_service.get_by_post_id_with_page_id(db=db, post_id=post_id)
                        if not published_post:
                            logger.info(f"Post {post_id} non trouvé pour le commentaire {comment_id}")
                            continue
                        self.comment_service.publised_post = published_post  # ✅ Assigner le published_post à la service de commentaire
                        response = await self.comment_service.generate_reply(comment=comment_text, db=db)  # ✅ Générer la réponse au commentaire
                        await self.comment_service.comment_classification(comment=comment_text)  # ✅ Classifier le commentaire
                        
                        # ✅ Ignorer les commentaires de la page elle-même
                        print(f"Received comment on page {post_id} from {from_name}: {comment_text}")
                        if from_id == page_id:
                            continue
                        print(f"Classification du commentaire: {response}")
                        logger.info(f"💬 [{page.page_name}] {from_name}: {comment_text}")
                        await self.repondre_commentaire(
                            response=response,
                            comment_id=comment_id,
                            nom=from_name,
                            page_access_token=page.access_token
                        )

    async def repondre_commentaire(self, comment_id: str, nom: str, page_access_token: str, response:str):
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    f"https://graph.facebook.com/v25.0/{comment_id}/comments",
                    json={
                        "message": response,
                        "access_token": page_access_token
                    }
                )
                res.raise_for_status()
                print(f"✅ Réponse postée: {response}")
            except httpx.HTTPStatusError as e:
                print(f"❌ Erreur API Facebook: {e.response.text}")