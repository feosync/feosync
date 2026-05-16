from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from app.core.logger import get_logger
from ..service.webhook import WebhookService

logger = get_logger(__name__)


webhook_router = APIRouter()
webhook_service = WebhookService()

@webhook_router.post(
            "/webhook/stripe",
            status_code=200,
            summary="Endpoint pour recevoir les webhooks Stripe",
            description= """ 
            Reçoit et traite les événements webhook envoyés par Stripe.
 
            Le corps brut de la requête (`raw body`) est utilisé pour vérifier
            la signature Stripe — ne pas parser le body en JSON avant cette vérification.
        
            Args:
                request (Request): La requête HTTP brute de Stripe, contenant
                    le payload JSON et l'en-tête `Stripe-Signature`.
        
            Returns:
                JSONResponse: Réponse 200 si l'événement est traité avec succès.
 
            Raises:
                HTTPException 400: Si la signature est invalide ou le payload illisible.
                HTTPException 422: Si le type d'événement n'est pas pris en charge.""",
            responses={
                200: {"description": "Événement reçu et traité avec succès"},
                400: {"description": "Signature Stripe invalide ou payload malformé"},
                422: {"description": "Type d'événement non reconnu ou non géré"},
            })
async def webhook_stripe(request: Request):
    try:
        # comment: 
        return await webhook_service.handle_stripe_webhook(request)
    except ValueError as ve:
        logger.error(f"Webhook Stripe - Erreur de validation: {str(ve)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(ve))
    except NotImplementedError as nie:
        logger.error(f"Webhook Stripe - Événement non implémenté: {str(nie)}", exc_info=True)
        raise HTTPException(status_code=422, detail=str(nie))