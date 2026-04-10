from typing import Any

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class CreatePaymentRequest(BaseModel):
    """
    Modèle pour la création d'une intention de paiement.
    
    Valide les données envoyées par le client avant traitement.
    """
    # Montant en cents (ex: 1000 = 10.00 USD)
    amount: int = Field(..., gt=0, description="Montant en cents")
    
    # Devise ISO 4217 (par défaut USD)
    currency: str = Field(default="usd", description="Code devise (usd, eur, etc.)")
    
    # Description optionnelle du paiement
    description: Optional[str] = Field(default="", description="Description du paiement")
    
    # Email du client pour les reçus
    customer_email: Optional[str] = Field(default=None, description="Email du client")
    
    # Métadonnées personnalisées
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Données personnalisées")


class CapturePaymentRequest(BaseModel):
    """
    Modèle pour la capture d'un paiement.
    
    Contient l'ID du paiement à capturer et le montant optionnel.
    """
    # ID de l'intention de paiement à capturer
    payment_intent_id: str = Field(..., description="ID de l'intention de paiement")
    
    # Montant optionnel pour capture partielle
    amount_to_capture: Optional[int] = Field(default=None, description="Montant à capturer en cents")


class ConfirmPaymentRequest(BaseModel):
    """
    Modèle pour la confirmation d'un paiement avec une méthode de paiement.
    """
    # ID de l'intention de paiement
    payment_intent_id: str = Field(..., description="ID de l'intention de paiement")
    
    # ID de la méthode de paiement (générée côté client)
    payment_method_id: str = Field(..., description="ID de la méthode de paiement")


class RefundPaymentRequest(BaseModel):
    """
    Modèle pour le remboursement d'un paiement.
    """
    # ID de l'intention de paiement à rembourser
    payment_intent_id: str = Field(..., description="ID de l'intention de paiement")
    
    # Montant optionnel pour remboursement partiel
    amount: Optional[int] = Field(default=None, description="Montant à rembourser en cents")

