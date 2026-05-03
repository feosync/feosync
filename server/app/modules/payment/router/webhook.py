from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from app.core.logger import get_logger
from ..service.webhook import WebhookService

logger = get_logger(__name__)


webhook_router = APIRouter()
webhook_service = WebhookService()

@webhook_router.post("/webhook/stripe")
async def webhook_stripe(request: Request):
    """Endpoint pour recevoir les webhooks Stripe"""
    return await webhook_service.handle_stripe_webhook(request)