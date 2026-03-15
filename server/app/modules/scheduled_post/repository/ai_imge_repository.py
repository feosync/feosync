from sqlalchemy.orm import Session

from ..models.scheduled_post_ai_image import ScheduledPostAiImage

class AiImageRepository:
    @staticmethod
    def add_ai_image(db:Session, ai_image: ScheduledPostAiImage)->ScheduledPostAiImage:
        db.add(ai_image)
        db.commit()
        db.refresh(ai_image)
        return ai_image