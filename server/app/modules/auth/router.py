from fastapi import APIRouter, Depends
from requests import Session
from app.core.database import get_db
from app.modules.auth.user import User


auth_router = APIRouter()
@auth_router.get("/login")
async def login():
    return {"message": "Login endpoint"}

@auth_router.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    user = User(email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}
