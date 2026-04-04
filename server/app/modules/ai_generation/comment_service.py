from .llm_service import GeminiProvider as gemini_provider
from app.modules.published_post.model import PublishedPost
from app.modules.scheduled_post.service import ScheduledPostService as scheduled_post_service
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from google.genai.errors import ServerError
from sqlalchemy.orm import Session
import logging
import re


logger = logging.getLogger(__name__)

class CommentService:
    def __init__(self):
        self.llm = gemini_provider()
        self.publised_post: PublishedPost
        
    def strip_markdown(self, text: str) -> str:
        """Convertit le Markdown en texte brut lisible pour Facebook."""
        # Gras / italique → texte nu
        text = re.sub(r'\*{1,2}(.+?)\*{1,2}', r'\1', text)
        text = re.sub(r'_{1,2}(.+?)_{1,2}', r'\1', text)
        # Titres → texte nu
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        # Listes → emoji bullet
        text = re.sub(r'^\s*[-*]\s+', '👉 ', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '👉 ', text, flags=re.MULTILINE)
        # Code inline → texte nu
        text = re.sub(r'`(.+?)`', r'\1', text)
        # Liens → texte nu
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        # Nettoyer les espaces multiples
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    async def comment_classification(self, comment: str) -> str:
        prompt = (
            f"Tu es un assistant de classification de commentaires pour une page Facebook.\n"
            f"Voici la liste des mots-clés disponibles : {self.publised_post.keywords}\n\n"
            f"Analyse le commentaire suivant et retourne UNIQUEMENT le mot-clé le plus pertinent "
            f"de la liste, sans explication ni ponctuation.\n\n"
            f"Commentaire : \"{comment}\""
        )
        classification: str = await self.llm.generate_response(prompt)
        return classification.strip()
     

    async def generate_reply(self, comment: str, db: Session) -> str:
        scheduled_post: ScheduledPost = scheduled_post_service.get_by_id_internal(
            db=db, post_id=self.publised_post.scheduled_post_id
        )
        if not scheduled_post:
            logger.warning(f"ScheduledPost not found for published_post.id={self.publised_post.id}")
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

        try:
            reply: str = await self.llm.generate_response(prompt)
            return reply.strip()
        except ServerError as e:
            logger.warning(f"⚠️ Gemini indisponible (503) — fallback utilisé : {e}")
            return "Merci pour votre commentaire ! 😊"
        except Exception as e:
            logger.error(f"❌ Erreur inattendue lors de la génération : {e}")
            return "Merci pour votre commentaire ! 😊"