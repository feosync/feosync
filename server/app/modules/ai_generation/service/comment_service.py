from .llm_service import GeminiProvider as gemini_provider
from .groq_service import GroqService, GroqConfig
from app.modules.published_post.model import PublishedPost
from app.modules.scheduled_post.service import ScheduledPostService as scheduled_post_service
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from google.genai.errors import ServerError
from sqlalchemy.orm import Session
import logging
import re

logger = logging.getLogger(__name__)

# Config Groq adaptée au community management
_GROQ_CM_CONFIG = GroqConfig(
    temperature=0.8,
    max_tokens=300,
    system_prompt="Tu es un community manager professionnel pour une page Facebook.",
)


class CommentService:
    def __init__(self):
        self.groq = GroqService(default_config=_GROQ_CM_CONFIG)
        self.gemini = gemini_provider()
        self.publised_post: PublishedPost

    # ── LLM avec fallback Groq → Gemini ───────────────────────────────────────
    async def _generate(self, prompt: str) -> str:
    # 1. Gemini (principal)
        try:
            reply: str = await self.gemini.generate_response(prompt)
            logger.debug("Réponse via Gemini")
            return reply.strip()
        except ServerError as exc:
            logger.warning("Gemini 503 — bascule sur Groq : %s", exc)
        except Exception as exc:
            logger.warning("Erreur Gemini — bascule sur Groq : %s", exc)

        # 2. Groq (fallback)
        try:
            result = await self.groq.complete(prompt)
            logger.debug("Réponse via Groq (%s)", result.model_used)
            return result.content.strip()
        except RuntimeError as exc:
            logger.error("Groq indisponible — tous les LLM ont échoué : %s", exc)
        except Exception as exc:
            logger.error("Erreur Groq inattendue : %s", exc)

        return ""
    # ── Méthodes publiques ─────────────────────────────────────────────────────

    def strip_markdown(self, text: str) -> str:
        """Convertit le Markdown en texte brut lisible pour Facebook."""
        text = re.sub(r'\*{1,2}(.+?)\*{1,2}', r'\1', text)
        text = re.sub(r'_{1,2}(.+?)_{1,2}', r'\1', text)
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*[-*]\s+', '👉 ', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '👉 ', text, flags=re.MULTILINE)
        text = re.sub(r'`(.+?)`', r'\1', text)
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    async def comment_classification(self, comment: str) -> str:
        prompt = (
            f"Tu es un assistant de classification de commentaires pour une page Facebook.\n"
            f"Voici la liste EXCLUSIVE des mots-clés disponibles : {self.publised_post.keywords}\n\n"
            f"Analyse le commentaire et retourne UNIQUEMENT l'une de ces deux options :\n"
            f"- Le mot-clé exact de la liste si le commentaire lui correspond clairement\n"
            f"- La valeur 'non_classe' si le commentaire ne correspond à aucun mot-clé\n\n"
            f"Règles strictes :\n"
            f"- Retourne UNIQUEMENT le mot-clé ou 'non_classe', rien d'autre\n"
            f"- Pas d'explication, pas de ponctuation, pas de majuscules\n"
            f"- En cas de doute, retourne 'non_classe'\n\n"
            f"Commentaire : \"{comment}\""
        )
        result = await self._generate(prompt)
        return result.strip().lower() or "non_classe"

    async def generate_reply(self, comment: str, db: Session) -> str:
        scheduled_post: ScheduledPost = scheduled_post_service.get_by_id_internal(
            db=db, post_id=self.publised_post.scheduled_post_id
        )
        if not scheduled_post:
            logger.warning(
                "ScheduledPost introuvable pour published_post.id=%s",
                self.publised_post.id,
            )
            return ""

        prompt = (
            f"Tu es le community manager d'une page Facebook. "
            f"Tu dois répondre à un commentaire de manière naturelle, chaleureuse et engageante.\n\n"
            f"Contexte de la publication : {self.publised_post.instructions}\n"
            f"Légende de la publication : {scheduled_post.caption}\n\n"
            f"Commentaire reçu : \"{comment}\"\n\n"
            f"Règles strictes :\n"
            f"- Réponds UNIQUEMENT avec le texte de la réponse, prêt à être posté\n"
            f"- Ne commence PAS par 'Réponse :' ou tout autre préfixe\n"
            f"- Sois naturel, comme un vrai humain qui gère la page\n"
            f"- Longueur : 1 à 3 phrases maximum\n"
            f"- Utilise des emojis avec modération si c'est approprié\n"
            f"- Adapte le ton au commentaire (humour si blague, empathie si question sincère, etc.)\n"
            f"- Ne répète pas le commentaire dans ta réponse\n"
            f"- Si le commentaire est négatif ou une critique, reste professionnel et constructif"
        )

        reply = await self._generate(prompt)
        return reply or "Merci pour votre commentaire ! 😊"