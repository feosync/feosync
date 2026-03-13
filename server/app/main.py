from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.modules import auth_router, ai_router, fb_page_router, organisation_router, notif_router, plans_router
from app.core.database import engine
from app.core.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FeoSync API",
    description="FeoSync - Social Media Management Platform API",
    version="1.0.0",
)

# CORS en premier
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Routes avant le mount static
@app.get("/")
async def root():
    return {"message": "Welcome to FeoSync API!"}

@app.get("/dev/get-token")
async def get_token_page():
    return FileResponse("app/static/get_token.html")

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(fb_page_router, prefix="/api/v1/fb", tags=["fb"])
app.include_router(organisation_router, prefix="/api/v1/org", tags=["org"])
app.include_router(notif_router, prefix="/api/v1/notif", tags=["notif"])
app.include_router(plans_router, prefix="/api/v1/plans", tags=["plans"])

# Static mount en dernier
app.mount("/static", StaticFiles(directory="app/static"), name="static")