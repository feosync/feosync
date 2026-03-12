from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.modules import auth_router, ai_router, fb_page_router, organisation_router, notif_router, plans_router
from app.core.database import engine
from app.core.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to FeoSync API! Visit /docs for API documentation."}

# Monte le dossier static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Route pour accéder à la page
@app.get("/dev/get-token")
async def get_token_page():
    return FileResponse("app/static/get_token.html")


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(fb_page_router, prefix="/api/v1/fb", tags=["fb"] )
app.include_router(organisation_router, prefix="/api/v1/org", tags=["org"])
app.include_router(notif_router, prefix="/api/v1/notif", tags=["notif"])
app.include_router(plans_router, prefix="/api/v1/plans", tags=["plans"])

