from sqlalchemy.orm import Session
from uuid import UUID
from .model import AiGeneration

class AiGenerationRepository:
    @staticmethod
    def add_ai_generation(ai_gen: AiGeneration, db:Session):
        db.add(ai_gen)
        db.commit()
        db.refresh(ai_gen)
        db.close()
        return ai_gen

