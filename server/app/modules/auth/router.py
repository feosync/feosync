from fastapi import APIRouter, Depends
from requests import Session
from app.core.database import get_db


auth_router = APIRouter()
@auth_router.get("/login")
async def login():
    return {"message": "Login endpoint"}

@auth_router.post("/register")
def register():
    return {"message": "Register endpoint"}
