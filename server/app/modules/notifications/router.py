from fastapi import APIRouter


notif_router = APIRouter()
@notif_router.get("/notifications")
async def get_notifications():
    return {"message": "List of notifications"}