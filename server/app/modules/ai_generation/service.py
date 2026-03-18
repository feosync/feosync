from sqlalchemy.orm import Session
from google import genai
from app.core.config import settings
from google.genai import types
from .schemas import AiCreate
from .repository import AiGenerationRepository as repository
from .model import AiGeneration


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def add_ai_gen(db:Session, ai_create:AiCreate) -> str:
    
    response = client.models.generate_content(
        model=ai_create.model_used,
        config=types.GenerateContentConfig(
        system_instruction="You are a exeprt in marketing digital. Your name is Neko."
        ),
        contents=ai_create.prompt_used
    )
    ai_gen = AiGeneration(
        **ai_create.model_dump(), 
        output_data=response.text,
        )
    
    return repository.add_ai_generation(db=db, ai_gen=ai_gen)

#gemini-3-flash-preview