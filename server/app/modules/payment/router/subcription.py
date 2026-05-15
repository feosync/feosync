from fastapi import APIRouter, Depends, HTTPException, status

from app.modules.payment.service.upgrade import UpgradeSubcription
from ..service.subscription import SubscriptionService
from ..schemas.subscription import (
    CreateProductRequest,
    CreatePriceRequest,
    CreateCustomerRequest,
    ProductResponse,
    CustomerResponse,
    SubscriptionRequest,
    SubscriptionCreate
)
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.core.database import get_db
from sqlalchemy.orm import Session


# ============ ROUTER ============

subcription_router = APIRouter()

# Initialiser le service
subscription_service = SubscriptionService()
upgrade_service = UpgradeSubcription()
# ============ ENDPOINTS ============
@subcription_router.post("/setup-intent", status_code=status.HTTP_201_CREATED)
def setup_intent(customer_id:str, user: User = Depends(get_active_user)):
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
async def create_product(request: CreateProductRequest, user: User = Depends(get_active_user)):
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
async def create_price(request: CreatePriceRequest, user: User = Depends(get_active_user)):
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
async def create_customer(request: CreateCustomerRequest, user: User = Depends(get_active_user)):
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
async def create_subscription(request: SubscriptionRequest, user: User = Depends(get_active_user), db: Session = Depends(get_db)):
    """
    Créer un nouvel abonnement pour un client
    """    
    try:
        print("Creating subscription with request:", request)
        print("User:", user)
        return subscription_service.create_subscription(db, request, user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création de l'abonnement: {str(e)}"
        )

# @subcription_router.post("/add")
# async def add_subscription(request: SubscriptionCreate, db: Session = Depends(get_db), user: User = Depends(get_active_user)):
#     """
#     Ajouter un nouvel abonnement
#     """
#     try:
#         return subscription_service.save_subscription(db, request)
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Erreur lors de l'ajout de l'abonnement: {str(e)}"
#         )
        
@subcription_router.put("/update/{stripe_subscription_id}")
async def update_subscription(stripe_subscription_id: str, stripe_price_id:str, db: Session = Depends(get_db)):
    """
    Mettre à jour une souscription existante
    """
    try:
        return upgrade_service.upgrade_subscription(db=db, stripe_price_id=stripe_price_id, stripe_subscription_id=stripe_subscription_id)  
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la mise à jour de l'abonnement: {str(e)}"
        )