from fastapi import APIRouter


organisation_router = APIRouter()

@organisation_router.get("/organisations")
async def get_organisations():
    return {"message": "List of organisations"}