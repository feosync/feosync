"""
Module de service pour gérer les paiements avec Stripe
Ce module contient la logique métier pour créer et capturer des paiements
"""

import stripe
from typing import Optional, Dict, Any
from decimal import Decimal
from app.core.config import settings

class StripeService:
    """
    Service pour gérer tous les paiements Stripe.
    
    Cette classe encapsule la logique d'interaction avec l'API Stripe
    et fournit des méthodes pour créer et capturer des paiements.
    """
    
    def __init__(self):
        """
        Initialise le service Stripe avec la clé secrète depuis les variables d'environnement.
        
        Assurez-vous que STRIPE_SECRET_KEY est défini dans votre .env ou vos variables d'environnement.
        """
        # Récupère la clé secrète Stripe depuis les variables d'environnement
        stripe.api_key = settings.STRIPE_API_KEY            
        # Stocke la clé pour utilisation dans d'autres méthodes si nécessaire
        self.stripe_key = stripe.api_key
        
        # Vérifie que la clé API est bien configurée
        if not self.stripe_key:
            raise ValueError("STRIPE_SECRET_KEY n'est pas configurée dans les variables d'environnement")
    
    def create_payment_intent(
        self, 
        amount: int, 
        currency: str = "usd",
        description: str = "",
        customer_email: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Crée une intention de paiement Stripe (PaymentIntent).
        
        Cette méthode crée une intention de paiement qui servira de base
        pour finaliser la transaction côté client.
        
        Args:
            amount (int): Montant en cents (ex: 1000 = 10.00 USD)
            currency (str): Code devise ISO 4217 (défaut: "usd")
            description (str): Description du paiement pour vos registres
            customer_email (str, optionnel): Email du client pour les reçus Stripe
            metadata (dict, optionnel): Données personnalisées à associer au paiement
        
        Returns:
            dict: Contient l'id de l'intention et le secret client
                  Exemple: {
                      "id": "pi_1234567890",
                      "client_secret": "pi_1234567890_secret_abcdef",
                      "status": "requires_payment_method"
                  }
        
        Raises:
            stripe.error.CardError: Si la carte est rejetée
            stripe.error.RateLimitError: Si le taux limite est atteint
            stripe.error.InvalidRequestError: Si les paramètres sont invalides
            ValueError: Si le montant est invalide
        """
        # Validation du montant
        if amount <= 0:
            raise ValueError("Le montant doit être supérieur à 0")
        
        # Prépare les paramètres du paiement
        payment_params = {
            "amount": amount,
            "currency": currency,
            "description": description,
            # Permet la confirmation automatique une fois le paiement autorisé
            "confirm": False,
        }
        
        # Ajoute l'email du client s'il est fourni
        if customer_email:
            payment_params["receipt_email"] = customer_email
        
        # Ajoute les métadonnées personnalisées s'il y en a
        if metadata:
            payment_params["metadata"] = metadata
        
        try:
            # Crée l'intention de paiement via l'API Stripe
            payment_intent = stripe.PaymentIntent.create(**payment_params)
            
            # Retourne les informations essentielles
            return {
                "id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "status": payment_intent.status,
                "amount": payment_intent.amount,
                "currency": payment_intent.currency
            }
        
        except stripe.error.StripeError as e:
            # Gère les erreurs Stripe spécifiques
            raise Exception(f"Erreur Stripe lors de la création du paiement: {str(e)}")
    
    def capture_payment(
        self, 
        payment_intent_id: str,
        amount_to_capture: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Capture un paiement après autorisation.
        
        Cette méthode finalise un paiement qui a été autorisé.
        Utile pour les captures différées ou les captures partielles.
        
        Args:
            payment_intent_id (str): L'ID de l'intention de paiement à capturer
                                    (ex: "pi_1234567890")
            amount_to_capture (int, optionnel): Montant en cents à capturer.
                                               Si None, capture le montant total autorisé
        
        Returns:
            dict: Informations sur le paiement capturé
                  Exemple: {
                      "id": "pi_1234567890",
                      "status": "succeeded",
                      "amount_received": 1000
                  }
        
        Raises:
            Exception: Si la capture échoue
        """
        try:
            # Prépare les paramètres de capture
            capture_params = {}
            
            # Ajoute le montant si une capture partielle est demandée
            if amount_to_capture is not None:
                capture_params["amount_to_capture"] = amount_to_capture
            
            # Capture l'intention de paiement
            captured_payment = stripe.PaymentIntent.capture(
                payment_intent_id,
                **capture_params
            )
            
            # Retourne les informations du paiement capturé
            return {
                "id": captured_payment.id,
                "status": captured_payment.status,
                "amount_received": captured_payment.amount_received,
                "amount_capturable": captured_payment.amount_capturable
            }
        
        except stripe.error.StripeError as e:
            # Gère les erreurs Stripe
            raise Exception(f"Erreur lors de la capture du paiement: {str(e)}")
    
    def confirm_payment(
        self,
        payment_intent_id: str,
        payment_method_id: str
    ) -> Dict[str, Any]:
        """
        Confirme un paiement avec une méthode de paiement.
        
        Cette méthode finalise l'authentification du paiement
        avec la méthode de paiement fournie.
        
        Args:
            payment_intent_id (str): L'ID de l'intention de paiement
            payment_method_id (str): L'ID de la méthode de paiement (carte)
        
        Returns:
            dict: Statut de la confirmation
                  Exemple: {
                      "id": "pi_1234567890",
                      "status": "succeeded",
                      "charged": True
                  }
        
        Raises:
            Exception: Si la confirmation échoue
        """
        try:
            # Confirme l'intention de paiement avec la méthode fournie
            confirmed_payment = stripe.PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method_id
            )
            
            return {
                "id": confirmed_payment.id,
                "status": confirmed_payment.status,
                "charged": confirmed_payment.status == "succeeded"
            }
        
        except stripe.error.StripeError as e:
            raise Exception(f"Erreur lors de la confirmation du paiement: {str(e)}")
    
    def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Remboursement total ou partiel d'un paiement.
        
        Args:
            payment_intent_id (str): L'ID de l'intention de paiement à rembourser
            amount (int, optionnel): Montant en cents. Si None, remboursement total
        
        Returns:
            dict: Informations sur le remboursement
        
        Raises:
            Exception: Si le remboursement échoue
        """
        try:
            # Prépare les paramètres du remboursement
            refund_params = {
                "payment_intent": payment_intent_id
            }
            
            # Ajoute le montant si remboursement partiel
            if amount is not None:
                refund_params["amount"] = amount
            
            # Crée le remboursement
            refund = stripe.Refund.create(**refund_params)
            
            return {
                "id": refund.id,
                "status": refund.status,
                "amount": refund.amount,
                "reason": refund.reason
            }
        
        except stripe.error.StripeError as e:
            raise Exception(f"Erreur lors du remboursement: {str(e)}")
    
    def retrieve_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """
        Récupère les détails d'une intention de paiement existante.
        
        Utile pour vérifier le statut d'un paiement.
        
        Args:
            payment_intent_id (str): L'ID de l'intention de paiement
        
        Returns:
            dict: Tous les détails du paiement
        
        Raises:
            Exception: Si la requête échoue
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "id": payment_intent.id,
                "status": payment_intent.status,
                "amount": payment_intent.amount,
                "amount_received": payment_intent.amount_received,
                "currency": payment_intent.currency,
                "created": payment_intent.created
            }
        
        except stripe.error.StripeError as e:
            raise Exception(f"Erreur lors de la récupération du paiement: {str(e)}")