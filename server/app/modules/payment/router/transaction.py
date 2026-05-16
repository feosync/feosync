"""
Routes pour la gestion des paiements Stripe avec FastAPI.

Ce module contient tous les endpoints nécessaires pour gérer
les paiements: création, capture, confirmation et remboursement.
"""

from fastapi import APIRouter, HTTPException, status
from ..service.transaction import StripeService
from ..schemas.transaction import (
    CreatePaymentRequest,
    CapturePaymentRequest,
    ConfirmPaymentRequest,
    RefundPaymentRequest
)


# ============================================================================
# MODÈLES PYDANTIC - Validation des données
# ============================================================================


# ============================================================================
# CONFIGURATION DU ROUTEUR
# ============================================================================

# Crée le routeur avec un préfixe pour tous les endpoints de paiement
app_payment_router = APIRouter(
    responses={
        400: {"description": "Requête invalide"},
        500: {"description": "Erreur serveur"}
    }
)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app_payment_router.post("/create-intent", status_code=status.HTTP_201_CREATED)
async def create_payment_intent(request: CreatePaymentRequest):
    """
    Crée une nouvelle intention de paiement Stripe.
    
    Endpoint pour initier un paiement. Retourne un client_secret
    à utiliser côté client pour finaliser le paiement avec Stripe.js
    
    Args:
        request: Données du paiement (montant, devise, email, etc.)
    
    Returns:
        Dict contenant:
        - id: Identifiant unique de l'intention
        - client_secret: Secret à utiliser côté client
        - status: Statut du paiement (requires_payment_method, etc.)
        - amount: Montant en cents
        - currency: Devise
    
    Raises:
        HTTPException: Si la création échoue (validation, API Stripe, etc.)
    
    Exemple:
        POST /payments/create-intent
        {
            "amount": 2999,
            "currency": "usd",
            "description": "Achat produit XYZ",
            "customer_email": "client@example.com"
        }
    """
    try:
        # Initialise le service Stripe
        stripe_service = StripeService()
        
        # Crée l'intention de paiement avec les paramètres fournis
        payment_intent = stripe_service.create_payment_intent(
            amount=request.amount,
            currency=request.currency,
            description=request.description,
            customer_email=request.customer_email,
            metadata=request.metadata
        )
        
        # Retourne la réponse avec le statut 201 (créé)
        return {
            "success": True,
            "data": payment_intent,
            "message": "Intention de paiement créée avec succès"
        }
    
    except ValueError as e:
        # Erreur de validation des paramètres
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur de validation: {str(e)}"
        )
    
    except Exception as e:
        # Autres erreurs (API Stripe, etc.)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du paiement: {str(e)}"
        )


@app_payment_router.post("/capture")
async def capture_payment(request: CapturePaymentRequest):
    """
    Capture un paiement précédemment autorisé.
    
    Cette endpoint finalise un paiement qui a été autorisé.
    Utile pour les captures différées ou les captures partielles.
    
    Args:
        request: Contient l'ID du paiement et montant optionnel
    
    Returns:
        Dict avec statut de la capture et montant reçu
    
    Raises:
        HTTPException: Si la capture échoue
    
    Exemple:
        POST /payments/capture
        {
            "payment_intent_id": "pi_1234567890",
            "amount_to_capture": 2999
        }
    """
    try:
        stripe_service = StripeService()
        
        # Capture le paiement
        captured_payment = stripe_service.capture_payment(
            payment_intent_id=request.payment_intent_id,
            amount_to_capture=request.amount_to_capture
        )
        
        return {
            "success": True,
            "data": captured_payment,
            "message": "Paiement capturé avec succès"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la capture: {str(e)}"
        )


@app_payment_router.post("/confirm")
async def confirm_payment(request: ConfirmPaymentRequest):
    """
    Confirme un paiement avec une méthode de paiement.
    
    Finalise l'authentification du paiement avec la méthode de paiement
    (carte bancaire) fournie par le client.
    
    Args:
        request: ID du paiement et ID de la méthode de paiement
    
    Returns:
        Dict avec statut et confirmation du paiement
    
    Raises:
        HTTPException: Si la confirmation échoue
    
    Exemple:
        POST /payments/confirm
        {
            "payment_intent_id": "pi_1234567890",
            "payment_method_id": "pm_9876543210"
        }
    """
    try:
        stripe_service = StripeService()
        
        # Confirme le paiement
        confirmed_payment = stripe_service.confirm_payment(
            payment_intent_id=request.payment_intent_id,
            payment_method_id=request.payment_method_id
        )
        
        return {
            "success": True,
            "data": confirmed_payment,
            "message": "Paiement confirmé avec succès"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la confirmation: {str(e)}"
        )


@app_payment_router.post("/refund", status_code=status.HTTP_200_OK)
async def refund_payment(request: RefundPaymentRequest):
    """
    Crée un remboursement pour un paiement.
    
    Permet un remboursement total ou partiel d'un paiement existant.
    
    Args:
        request: ID du paiement et montant optionnel
    
    Returns:
        Dict avec détails du remboursement
    
    Raises:
        HTTPException: Si le remboursement échoue
    
    Exemple:
        POST /payments/refund
        {
            "payment_intent_id": "pi_1234567890",
            "amount": 1500
        }
    """
    try:
        stripe_service = StripeService()
        
        # Crée le remboursement
        refund = stripe_service.refund_payment(
            payment_intent_id=request.payment_intent_id,
            amount=request.amount
        )
        
        # Détermine le type de remboursement (total ou partiel)
        refund_type = "total" if request.amount is None else "partiel"
        
        return {
            "success": True,
            "data": refund,
            "message": f"Remboursement {refund_type} effectué avec succès"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du remboursement: {str(e)}"
        )


@app_payment_router.get("/status/{payment_intent_id}")
async def get_payment_status(payment_intent_id: str):
    """
    Récupère le statut actuel d'un paiement.
    
    Endpoint pour vérifier l'état d'un paiement sans effectuer d'action.
    Utile pour les vérifications asynchrones après le paiement côté client.
    
    Args:
        payment_intent_id: ID de l'intention de paiement
    
    Returns:
        Dict avec tous les détails du paiement (statut, montant, etc.)
    
    Raises:
        HTTPException: Si la récupération échoue
    
    Exemple:
        GET /payments/status/pi_1234567890
    """
    try:
        stripe_service = StripeService()
        
        # Récupère les détails du paiement
        payment_status = stripe_service.retrieve_payment_intent(payment_intent_id)
        
        return {
            "success": True,
            "data": payment_status
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du statut: {str(e)}"
        )
        
