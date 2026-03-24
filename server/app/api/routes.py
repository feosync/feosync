
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from app.core.config import settings

dev_router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@dev_router.get("/", tags=["health"])
async def root():
    return {"message": "Welcome to FeoSync API!"}

@dev_router.get("/dev/get-token", tags=["dev"])
async def get_token_page(request: Request):
    return templates.TemplateResponse("get_token.html", {
        "request": request,
        "google_client_id": settings.GOOGLE_CLIENT_ID,
    })