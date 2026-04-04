import json

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from app.core.config import settings
from app.core.database import get_db
from .service import WebhooksService
import asyncio
from app.core.logger import get_logger

logger = get_logger(__name__)
app_webhooks_router = APIRouter()
webhooks_service = WebhooksService()


# ✅ Vérification Meta (GET)
@app_webhooks_router.get("/", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str         = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str    = Query(None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WEBHOOK_TOKEN:
        print("✅ Webhook vérifié !")
        return hub_challenge
    raise HTTPException(status_code=403, detail="Token invalide")


# router.py
@app_webhooks_router.post("/", response_class=PlainTextResponse)
async def receive_webhook(request: Request):
    logger.info("📩 Webhook reçu, traitement en cours...")
    raw_body = await request.body()
    if not raw_body:
        logger.warning("⚠️ Body vide reçu")
        return "EVENT_RECEIVED"

    try:
        body = json.loads(raw_body)
    except Exception as e:
        logger.error(f"❌ JSON invalide : {e}")
        logger.error(f"❌ Contenu reçu : {raw_body.decode('utf-8', errors='replace')}")
        return "EVENT_RECEIVED"


    if body.get("object") != "page":
        return "IGNORED"

    db = next(get_db())
    asyncio.create_task(
        webhooks_service.process_entries(body.get("entry", []), db)
    )

    return "EVENT_RECEIVED"