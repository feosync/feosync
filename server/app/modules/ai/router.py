from fastapi import APIRouter
import app.modules.ai.service as ai_service


ai_router = APIRouter()

@ai_router.get("/generate")
async def generate():
    return {"message": "AI generation endpoint"}

@ai_router.post("/generate")
async def generate_ai(prompt: str):
    response = ai_service.generate_ai_response(prompt)
    return {"response": response}
