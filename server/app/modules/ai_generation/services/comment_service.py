from .llm_service import GeminiProvider as gemini_provider
from app.modules.published_post.service import PublishedPostService
from app.modules.published_post.model import PublishedPost
from app.modules.scheduled_post.service import ScheduledPostService as scheduled_post_service
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from sqlalchemy.orm import Session
class CommentService:
    def __init__(self):
        self.llm = gemini_provider
        self.publised_post: PublishedPost | None = None
    

    async def comment_classification(self, comment:str)-> str:
        prompt = f"classifier ce commentaire parmis le mot clés suivants: {self.publised_post.keywords} et retourne le mot clé correspondant. Commentaire: {comment}"
        classification = await self.llm.response_to_text(prompt)
        return classification.strip()
    
    async def generate_reply(self, comment:str, db:Session)-> str:
        scheduled_post = scheduled_post_service.get_by_published_post(db=db, published_post_id=self.publised_post.id)
        prompt = f"Génère une réponse pertinente et engageante pour un commentaire d'une publication à base du contexte suivant: {self.publised_post.instructions} et la légende: {scheduled_post.caption} . Commentaire: {comment}"
        reply = await self.llm.response_to_text(prompt)
        return reply.strip()