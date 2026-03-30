from .llm_service import GeminiProvider
from app.modules.published_post.model import PublishedPost
class CommentService:
    def __init__(self):
        self.llm = GeminiProvider()
        self.published_post:PublishedPost

    async def generate_comment(self, comments: str) -> str:
        question = f"Génère un commentaire pertinent et engageant pour ce post en ce basant sur l'instruction suivante. \n commentaire : {comments}  , instruction: {self.published_post.instructions}"
        comment, _ = await self.llm.generate_caption(question)
        return comment
