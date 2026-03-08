from fastapi import APIRouter


oauth_router = APIRouter()
@oauth_router.get("/authorize")
async def authorize():
    return {"message": "OAuth2 authorization endpoint"}