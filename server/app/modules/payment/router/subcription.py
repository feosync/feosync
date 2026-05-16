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

@subcription_router.post(
    "/setup-intent",
    status_code=status.HTTP_201_CREATED,
    summary="Créer un SetupIntent Stripe",
    description="""
Initialise un **SetupIntent** Stripe pour un client existant.

Un SetupIntent permet de collecter les informations de carte bancaire d'un client
sans effectuer de paiement immédiat — utile pour préparer un abonnement futur.

**Retourne :**
- `client_secret` : à transmettre au frontend pour confirmer le SetupIntent via Stripe.js
- `status` : état actuel du SetupIntent (`requires_payment_method`, `succeeded`, etc.)
    """,
    responses={
        201: {"description": "SetupIntent créé avec succès"},
        400: {"description": "Erreur Stripe — client_id invalide ou problème de configuration"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
def setup_intent(
    customer_id: str,
    user: User = Depends(get_active_user)
):
    """
    Crée un SetupIntent Stripe pour le client identifié par `customer_id`.

    Args:
        customer_id (str): L'identifiant Stripe du client (ex: `cus_XXXXXXXXXX`).
        user (User): L'utilisateur authentifié (injecté via dépendance).

    Returns:
        dict: `client_secret` et `status` du SetupIntent.

    Raises:
        HTTPException 400: Si la création du SetupIntent échoue côté Stripe.
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


@subcription_router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un produit Stripe",
    description="""
Crée un nouveau **produit** dans le catalogue Stripe.

Un produit représente ce que vous vendez (ex: plan Basic, plan Pro).
Il doit ensuite être associé à un ou plusieurs **prix** via l'endpoint `/prices`.

**Corps de la requête :**
- `name` : nom du produit affiché sur Stripe
- `description` : description optionnelle du produit
    """,
    responses={
        201: {"description": "Produit Stripe créé avec succès", "model": ProductResponse},
        400: {"description": "Données invalides ou erreur Stripe"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
async def create_product(
    request: CreateProductRequest,
    user: User = Depends(get_active_user)
):
    """
    Crée un produit Stripe à partir des données fournies.

    Args:
        request (CreateProductRequest): Contient `name` et `description` du produit.
        user (User): L'utilisateur authentifié (injecté via dépendance).

    Returns:
        ProductResponse: L'objet produit créé avec son `id`, `name` et `description`.

    Raises:
        HTTPException 400: Si la création du produit échoue côté Stripe.
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


@subcription_router.post(
    "/prices",
    status_code=status.HTTP_201_CREATED,
    summary="Créer un prix pour un produit Stripe",
    description="""
Crée un **prix** et l'associe à un produit Stripe existant.

Le prix définit le montant, la devise et la fréquence de facturation
(mensuel, annuel, etc.) d'un produit.

**Corps de la requête :**
- `product_id` : identifiant Stripe du produit cible (ex: `prod_XXXXXXXXXX`)
- `unit_amount` : montant en centimes (ex: `1000` = 10,00 €)
- `currency` : code devise ISO 4217 (ex: `eur`, `usd`)
- `recurring_interval` : fréquence (`month`, `year`, `week`, `day`)
    """,
    responses={
        201: {"description": "Prix créé et associé au produit avec succès"},
        400: {"description": "Produit introuvable ou paramètres invalides"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
async def create_price(
    request: CreatePriceRequest,
    user: User = Depends(get_active_user)
):
    """
    Crée un prix Stripe pour un produit donné.

    Args:
        request (CreatePriceRequest): Contient `product_id`, `unit_amount`,
            `currency` et `recurring_interval`.
        user (User): L'utilisateur authentifié (injecté via dépendance).

    Returns:
        dict: L'objet prix Stripe retourné par l'API.

    Raises:
        HTTPException 400: Si le produit est introuvable ou les paramètres sont invalides.
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


@subcription_router.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un client Stripe",
    description="""
Crée un nouveau **client** dans Stripe à partir de son adresse email.

Le client Stripe est nécessaire pour lui associer un moyen de paiement
et créer des abonnements. L'identifiant retourné (`id`) devra être conservé
pour les appels suivants (SetupIntent, abonnement).

**Corps de la requête :**
- `email` : adresse email du client
    """,
    responses={
        201: {"description": "Client Stripe créé avec succès", "model": CustomerResponse},
        400: {"description": "Email invalide ou erreur Stripe"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
async def create_customer(
    request: CreateCustomerRequest,
    user: User = Depends(get_active_user)
):
    """
    Crée un client Stripe à partir d'une adresse email.

    Args:
        request (CreateCustomerRequest): Contient l'`email` du client.
        user (User): L'utilisateur authentifié (injecté via dépendance).

    Returns:
        CustomerResponse: L'objet client avec son `id` Stripe et son `email`.

    Raises:
        HTTPException 400: Si la création du client échoue côté Stripe.
    """
    try:
        customer = subscription_service.create_customer(email=request.email)
        return CustomerResponse(
            id=customer.id,
            email=customer.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création du client: {str(e)}"
        )


@subcription_router.post(
    "/subscriptions",
    status_code=status.HTTP_201_CREATED,
    summary="Créer un abonnement Stripe",
    description="""
Crée un **abonnement** Stripe pour un client et l'enregistre en base de données.

L'abonnement lie un client à un prix récurrent. Le client doit au préalable
avoir un moyen de paiement attaché (via SetupIntent).

**Corps de la requête :**
- `customer_id` : identifiant Stripe du client
- `price_id` : identifiant Stripe du prix à souscrire
- *(autres champs selon `SubscriptionRequest`)*

> **Note :** L'utilisateur authentifié est automatiquement associé à l'abonnement.
    """,
    responses={
        201: {"description": "Abonnement créé et sauvegardé en base avec succès"},
        400: {"description": "Client ou prix introuvable, ou moyen de paiement manquant"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
async def create_subscription(
    request: SubscriptionRequest,
    user: User = Depends(get_active_user),
    db: Session = Depends(get_db)
):
    """
    Crée un abonnement Stripe et le persiste en base de données.

    Args:
        request (SubscriptionRequest): Données de l'abonnement (customer_id, price_id, etc.).
        user (User): L'utilisateur authentifié, associé à l'abonnement.
        db (Session): Session SQLAlchemy injectée.

    Returns:
        dict: Les détails de l'abonnement créé.

    Raises:
        HTTPException 400: Si la création de l'abonnement échoue (Stripe ou BDD).
    """
    try:
        return subscription_service.create_subscription(db, request, user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création de l'abonnement: {str(e)}"
        )


@subcription_router.put(
    "/update/{stripe_subscription_id}",
    summary="Mettre à jour un abonnement Stripe",
    description="""
Met à jour (upgrade/downgrade) un **abonnement Stripe existant** en changeant son prix.

Permet de passer d'un plan à un autre (ex: Basic → Pro) sans interrompre l'abonnement.
Le changement est effectif immédiatement ou en fin de période selon la configuration Stripe.

**Paramètres :**
- `stripe_subscription_id` *(path)* : identifiant de l'abonnement à modifier (ex: `sub_XXXXXXXXXX`)
- `stripe_price_id` *(query)* : identifiant du nouveau prix à appliquer (ex: `price_XXXXXXXXXX`)
    """,
    responses={
        200: {"description": "Abonnement mis à jour avec succès"},
        400: {"description": "Abonnement ou prix introuvable, ou erreur Stripe"},
        401: {"description": "Utilisateur non authentifié"},
    }
)
async def update_subscription(
    stripe_subscription_id: str,
    stripe_price_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_active_user)
):
    """
    Met à jour le prix d'un abonnement Stripe existant.

    Args:
        stripe_subscription_id (str): L'identifiant Stripe de l'abonnement (ex: `sub_XXXXXXXXXX`).
        stripe_price_id (str): L'identifiant Stripe du nouveau prix (ex: `price_XXXXXXXXXX`).
        db (Session): Session SQLAlchemy injectée.
        user (User): L'utilisateur authentifié.

    Returns:
        dict: Les détails de l'abonnement mis à jour.

    Raises:
        HTTPException 400: Si la mise à jour échoue côté Stripe ou en base.
    """
    try:
        return upgrade_service.upgrade_subscription(
            db=db,
            stripe_price_id=stripe_price_id,
            stripe_subscription_id=stripe_subscription_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la mise à jour de l'abonnement: {str(e)}"
        )