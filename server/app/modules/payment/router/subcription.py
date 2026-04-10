from fastapi import APIRouter, HTTPException, status

from app.modules.collaborators import router
from ..service.subscription import SubscriptionService
from ..schemas.subscription import (
    CreateProductRequest,
    CreatePriceRequest,
    CreateCustomerRequest,
    CreateSubscriptionRequest,
    ProductResponse,
    PriceResponse,
    CustomerResponse,
    SubscriptionResponse
)


# ============ ROUTER ============

subcription_router = APIRouter()

# Initialiser le service
subscription_service = SubscriptionService()

# ============ ENDPOINTS ============
@subcription_router.post("/setup-intent", status_code=status.HTTP_201_CREATED)
def setup_intent(customer_id:str):
    """
    Endpoint pour créer une initiation de paiement (SetupIntent) pour un client donné.
    
    """
    try:
        intent = subscription_service.setup_intent(customer_id) 
        return {
            "client_secret": intent.client_secret,
            "status": intent.status
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création de l'intention de paiement: {str(e)}"
        )

@subcription_router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(request: CreateProductRequest):
    """
    Créer un nouveau produit Stripe
    """
    try:
        product = subscription_service.create_product(
            name=request.name,
            description=request.description
        )
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création du produit: {str(e)}"
        )

@subcription_router.post("/prices", status_code=status.HTTP_201_CREATED)
async def create_price(request: CreatePriceRequest):
    """
    Créer un prix pour un produit
    """
    try:
        return subscription_service.create_price(
            product_id=request.product_id,
            unit_amount=request.unit_amount,
            currency=request.currency,
            recurring_interval=request.recurring_interval
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création du prix: {str(e)}"
        )

@subcription_router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(request: CreateCustomerRequest):
    """
    Créer un nouveau client
    """
    try:
        customer = subscription_service.create_customer(
            email=request.email
        )
        return CustomerResponse(
            id=customer.id,
            email=customer.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création du client: {str(e)}"
        )

@subcription_router.post("/subscriptions", status_code=status.HTTP_201_CREATED)
async def create_subscription(request: CreateSubscriptionRequest):
    """
    Créer un nouvel abonnement pour un client
    """
    try:
       
        return subscription_service.create_subscription(
                customer_id=request.customer_id,
                price_id=request.price_id,
                payment_method_id=request.payment_method_id
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création de l'abonnement: {str(e)}"
        )