# app/modules/payment/service/webhook.py

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from zope import event
from app.core.logger import get_logger
from .init_stripe import InitStripe
from app.core.config import settings
from .subscription import SubscriptionService as subcription_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

logger = get_logger(__name__)

webhook_secret = settings.STRIPE_WEBHOOK_SECRET

class WebhookService:
    def __init__(self):
        self.stripe_client = InitStripe()
        self.stripe = self.stripe_client.exececute()
        
    async def handle_stripe_webhook(self, request: Request):
        """Webhook Stripe avec logs détaillés"""
        
        payload = await request.body()
        logger.info(f"📬 Payload reçu: {len(payload)} bytes")
        
        sig_header = request.headers.get("stripe-signature")
        # logger.info(f"🔐 Signature header: {sig_header}")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing signature")
        
        if not webhook_secret:
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
        try:
            event = self.stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            # logger.info(f"✅ Signature vérifiée!")
            
        except ValueError as e:
            logger.error(f"❌ Erreur payload: {str(e)}")
            raise HTTPException(status_code=400)
        except self.stripe.error.SignatureVerificationError as e:
            logger.error(f"❌ Signature invalide: {str(e)}")
            raise HTTPException(status_code=400)
        
        # ✅ CHANGEMENT: Utiliser l'indexation [] au lieu de .get()
        event_type = event["type"]  # ← PAS .get()
        logger.info(f"📨 Événement reçu: {event_type}")
        
        if event_type == "customer.subscription.created":
            subscription = event["data"]["object"]
            logger.info(f"✅ ABONNEMENT CRÉÉ:")
            logger.info(f"Client: {subscription['customer']}")
            logger.info(f"Status: {subscription['status']}")
            
        elif event_type == "customer.subscription.updated":
            subscription = event["data"]["object"]
            logger.info(f"🔄 ABONNEMENT MODIFIÉ: {subscription['id']}")
            logger.info(f"Nouveau subscription: {subscription}")
            
            
        elif event_type == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            logger.info(f"❌ ABONNEMENT SUPPRIMÉ: {subscription['id']}")
        
        elif event_type == "invoice.created":
            invoice = event["data"]["object"]
            logger.info(f"📄 FACTURE CRÉÉE: {invoice['id']}")
            
        elif event_type == "invoice.payment_succeeded":
            db_gen = get_db()
            db: Session = next(db_gen)
            invoice = event["data"]["object"]
            logger.info(f"✅ PAIEMENT FACTURE: {invoice['id']}")
            subcription_service().update_subscription_from_invoice(db=db ,invoice=invoice)
        elif event_type == "invoice.payment_failed":
            db_gen = get_db()
            db: Session = next(db_gen)
            invoice = event["data"]["object"]
            subcription_service().update_subscription_payment_failed(db=db, invoice=invoice)
        else:
            logger.debug(f"Événement non géré: {event_type}")
        
        return JSONResponse({"status": "success"}, status_code=200) 