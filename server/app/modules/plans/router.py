from fastapi import APIRouter


plans_router = APIRouter()
@plans_router.get("/plans")
async def get_plans():
    return {"message": "List of plans"} 