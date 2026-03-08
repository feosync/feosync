from fastapi import APIRouter


post_router = APIRouter()

@post_router.get("/posts")
async def get_posts():
    return {"message": "List of posts"}