import asyncio
import random
import time
from app.modules.fb_page.service import FacebookService
from app.modules.fb_page.model import Facebook
from app.core.database import get_db
import httpx
from app.core.logger import get_logger
from app.modules.ai_generation.service.comment_service import CommentService
from app.modules.published_post.service import PublishedPostService
from app.modules.published_post.model import PublishedPost

logger = get_logger(__name__)


class RateLimiter:
    """
    Empêche d'envoyer plus de `max_calls` réponses par `period` secondes,
    par page Facebook — évite le ban pour activité suspecte.
    """
    def __init__(self, max_calls: int = 1, period: float = 10.0):
        self.max_calls = max_calls
        self.period = period
        self._timestamps: dict[str, list[float]] = {}

    async def wait(self, page_id: str):
        now = time.monotonic()
        timestamps = self._timestamps.setdefault(page_id, [])

        # Nettoyer les anciens timestamps hors fenêtre
        self._timestamps[page_id] = [t for t in timestamps if now - t < self.period]

        if len(self._timestamps[page_id]) >= self.max_calls:
            oldest = self._timestamps[page_id][0]
            wait_time = self.period - (now - oldest)
            if wait_time > 0:
                logger.info(f"⏳ Rate limit page {page_id} — attente {wait_time:.1f}s")
                await asyncio.sleep(wait_time)

        self._timestamps[page_id].append(time.monotonic())


async def human_delay(min_s: float = 3.0, max_s: float = 12.0):
    """
    Simule le temps qu'un humain prendrait pour lire le commentaire
    et commencer à taper sa réponse.
    """
    delay = random.uniform(min_s, max_s)
    logger.info(f"🕐 Délai humain simulé : {delay:.1f}s")
    await asyncio.sleep(delay)


async def typing_delay(text: str, chars_per_second: float = 15.0):
    """
    Simule le temps de frappe en fonction de la longueur du texte.
    ~15 caractères/seconde = rythme de frappe humaine normale.
    """
    delay = len(text) / chars_per_second
    delay = max(1.0, min(delay, 20.0))  # Borné entre 1s et 20s
    logger.info(f"⌨️ Délai de frappe simulé : {delay:.1f}s pour {len(text)} chars")
    await asyncio.sleep(delay)


class WebhooksService:
    def __init__(self):
        self.fb_service = FacebookService()
        self.comment_service = CommentService()
        self.published_post_service = PublishedPostService()
        self.rate_limiter = RateLimiter(max_calls=1, period=10.0)

    async def abonner_page_au_webhook(self, page_id: str, page_access_token: str):
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"https://graph.facebook.com/v25.0/{page_id}/subscribed_apps",
                params={
                    "subscribed_fields": ",".join([
                        "feed",      # ✅ contient déjà les commentaires
                        "mention",   # ✅ quand quelqu'un mentionne la page
                    ]),
                    "access_token": page_access_token
                }
            )
            data = res.json()
            if data.get("success"):
                logger.info(f"✅ Page {page_id} abonnée au webhook")
            else:
                logger.error(f"❌ Erreur abonnement page {page_id}: {data}")
                
    async def startup(self):
        logger.info("Initialisation de l'abonnement webhook")
        db = next(get_db())
        pages: list[Facebook] = self.fb_service.get_all(db)
        for page in pages:
            await self.abonner_page_au_webhook(
                page_id=page.fb_page_id,
                page_access_token=page.access_token
            )

    async def process_entries(self, entries: list, db):
        for entry in entries:
            await asyncio.sleep(random.uniform(0.5, 2.0))

            page_id = entry.get("id")
            page: Facebook = FacebookService.get_by_fb_page_id(db=db, fb_page_id=page_id)
            if page is None:
                continue

            for change in entry.get("changes", []):
                if change.get("field") != "feed":
                    continue

                value = change.get("value", {})

                if value.get("item") == "comment" and value.get("verb") == "add":
                    post_id      = value.get("post_id")
                    from_id      = value.get("from", {}).get("id")
                    from_name    = value.get("from", {}).get("name", "quelqu'un")
                    comment_id   = value.get("comment_id")
                    comment_text = value.get("message", "")

                    # Ignorer les commentaires de la page elle-même
                    if from_id == page_id:
                        logger.info(f"⏭️ Commentaire ignoré (auteur = page) — {comment_id}")
                        continue

                    logger.info(f"💬 [{page.page_name}] {from_name}: {comment_text}")

                    published_post: PublishedPost = (
                        self.published_post_service
                        .get_by_post_id_with_page_id(db=db, post_id=post_id)
                    )

                    # ✅ Bug 1 corrigé : vérifier None EN PREMIER
                    if not published_post:
                        logger.info(f"Post {post_id} non trouvé pour le commentaire {comment_id}")
                        continue

                    # ✅ Ensuite seulement accéder aux attributs
                    if not published_post.is_auto_comment:
                        logger.info(f"⏭️ Auto-commentaire désactivé pour le post {post_id}")
                        continue

                    self.comment_service.publised_post = published_post

                    response, _ = await asyncio.gather(
                        self.comment_service.generate_reply(
                            comment=comment_text,
                            db=db,
                        ),
                        self.comment_service.comment_classification(comment=comment_text),
                    )
                    mention = f"@[{from_id}]"

                    reply_text = f"{mention} {response}" if response else f" {mention} Merci pour votre commentaire ! 😊"

                    if not response:
                        logger.info(f"⚠️ Pas de réponse générée pour {comment_id}, fallback utilisé")
                    # ── Délais anti-ban ──────────────────────────────────────
                    await self.rate_limiter.wait(page_id)
                    await human_delay(3.0, 12.0)
                    await typing_delay(reply_text)
                    # ─────────────────────────────────────────────────────────

                    await self.repondre_commentaire(
                        response=reply_text,
                        comment_id=comment_id,
                        page_access_token=page.access_token
                    )
    
    async def repondre_commentaire(
        self,
        comment_id: str,
        page_access_token: str,
        response: str):
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    f"https://graph.facebook.com/v25.0/{comment_id}/comments",
                    # ✅ params au lieu de json — meilleure compatibilité
                    #    avec le système de mention/notification Facebook
                    data={
                        "message": response,
                        "access_token": page_access_token
                    }
                )
                res.raise_for_status()
                logger.info(f"✅ Réponse postée pour commentaire {comment_id}")
            except httpx.HTTPStatusError as e:
                logger.error(f"❌ Erreur API Facebook [{comment_id}]: {e.response.text}")