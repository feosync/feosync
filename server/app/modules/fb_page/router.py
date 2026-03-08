from fastapi import APIRouter


fb_page_router = APIRouter()

@fb_page_router.get("/pages")
async def get_pages():
    return {"message": "List of Facebook pages"}