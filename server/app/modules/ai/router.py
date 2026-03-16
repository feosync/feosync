from fastapi import APIRouter,  Depends
import app.modules.ai.service as ai_service
from .schemas import AiCreate, AiResponse
from sqlalchemy.orm import Session
from app.core.database import get_db

ai_router = APIRouter()

@ai_router.get("/generate")
async def generate():
    return {"message": "AI generation endpoint"}

@ai_router.post("/generate")
async def generate_ai(ai_create: AiCreate, db:Session=Depends(get_db))->AiResponse:
   return ai_service.add_ai_gen(db=db, ai_create=ai_create)
