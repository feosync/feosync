from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.modules.user.model import User

from .init_stripe import InitStripe
from ..schemas.subscription import SubscriptionRequest, SubscriptionCreate
from ..repository.subscription import SubscriptionRepository
from ..models.subscription import Subscription  
from app.core.logger import get_logger


logger = get_logger(__name__)
class SubscriptionService:
    def __init__(self):
        self.stripe_client = InitStripe()
        self.stripe = self.stripe_client.exececute()
        
    def create_product(self, name, description):
        product = self.stripe.Product.create(
            name=name,
            description=description
        )
        return product
    
    def create_price(self, product_id, unit_amount, currency, recurring_interval):
        return self.stripe.Price.create(
            product=product_id,
            unit_amount=unit_amount,
            currency=currency,
            recurring={"interval": recurring_interval}
        )
    def setup_intent(self, customer_id):
        return self.stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=["card"]
        )

    def create_customer(self, email, name=None):
        customer = self.stripe.Customer.create(
            email=email,
            name=name
        )
        return customer
    
    
    def create_subscription(self, db: Session, subscription_request: SubscriptionRequest, user: User):
        try:
            # 1. Attach payment method
            self.stripe.PaymentMethod.attach(
                subscription_request.payment_method_id,
                customer=subscription_request.stripe_customer_id
            )
            logger.info(f"✅ Payment method {subscription_request.payment_method_id} attached to customer {subscription_request.stripe_customer_id}")

            # 2. Set default payment method
            self.stripe.Customer.modify(
                subscription_request.stripe_customer_id,
                invoice_settings={"default_payment_method": subscription_request.payment_method_id}
            )
            logger.info(f"✅ Customer {subscription_request.stripe_customer_id} default payment method updated")
            
            self.stripe.Customer.retrieve(subscription_request.stripe_customer_id)

            # 3. Create subscription on Stripe
            new_subscription = self.stripe.Subscription.create(
                customer=subscription_request.stripe_customer_id,
                items=[{"price": subscription_request.stripe_price_id}],
                default_payment_method=subscription_request.payment_method_id,
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice", "items.data.price"]
            )

            logger.info(f"✅ Subscription created successfully: {new_subscription.id}")

            # 4. Extract data safely
            item = new_subscription.items.data[0] if new_subscription.items.data else {}

            # 5. Create database object (IMPORTANT : bien respecter les types)
            subscription_in = SubscriptionCreate(
                user_id=user.id,
                stripe_subscription_id=new_subscription.id,
                stripe_customer_id=new_subscription.customer,
                stripe_price_id=subscription_request.stripe_price_id,
                payment_method_id=subscription_request.payment_method_id,
                
                status=new_subscription.status,
                
                # Ces champs doivent être des entiers (Unix timestamp)
                current_period_start=item.current_period_start,
                current_period_end=item.current_period_end,
                last_payment_date= None,  # ou new_subscription.created
                last_payment_amount=item.price.unit_amount,
                last_payment_status="succeeded",   # car la souscription est active
                
                created_at=new_subscription.created,
                updated_at=new_subscription.created,
                
                is_active=True
            )

            # 6. Save to database
            db_subscription = SubscriptionRepository.create(db, subscription_in)
            logger.info(f"✅ Subscription saved in database for user {user.id}")
            
            return db_subscription

        except Exception as e:
            logger.error(f"❌ Failed to create subscription: {str(e)}", exc_info=True)
            raise
    def extract_subscription_id(self, invoice)-> str:
        # ✅ ancien format
        if "subscription" in invoice and invoice["subscription"]:
            return invoice["subscription"]

        # ✅ nouveau format Stripe
        if "parent" in invoice:
            parent = invoice["parent"]
            if parent["subscription_details"]:
                return parent["subscription_details"]["subscription"]

        raise ValueError("No subscription ID found in invoice")
    def update_subscription_from_invoice(
        self,
        db: Session,
        invoice: dict
    ) -> Subscription:
        """
        Met à jour une subscription après un paiement Stripe (renouvellement)
        """

        # try:
        stripe_subscription_id = self.extract_subscription_id(invoice)
        print(f"invoice: {invoice}")

        subscription:Subscription = (
            db.query(Subscription)
            .filter(Subscription.stripe_subscription_id == stripe_subscription_id)
            .first()
        )

        if not subscription:
            raise ValueError(f"Subscription {stripe_subscription_id} not found")

        # 🔥 Récupération des données Stripe
        line = invoice["lines"]["data"][0]

        period_start = line["period"]["start"]
        period_end = line["period"]["end"]

        paid_at = invoice["status_transitions"]["paid_at"]
        amount_paid = invoice["amount_paid"]

        # 🔥 Mise à jour complète
        subscription.status = "active"
        subscription.is_active = True

        subscription.current_period_start = period_start
        subscription.current_period_end = period_end

        subscription.last_payment_date = paid_at
        subscription.last_payment_amount = amount_paid
        subscription.last_payment_status = "paid"

        # 🔥 Mise à jour du plan (important si upgrade/downgrade)
        subscription.stripe_price_id = line["pricing"]["price_details"]["price"]

        subscription.updated_at = int(datetime.now(timezone.utc).timestamp())

        db.commit()
        db.refresh(subscription)

        logger.info(
            "✅ Subscription renewed successfully",
            subscription_id=subscription.stripe_subscription_id,
            user_id=str(subscription.user_id),
            period_end=subscription.current_period_end,
            amount=subscription.last_payment_amount,
        )

        return subscription

        # except Exception as e:
        #     db.rollback()
        #     logger.error(
        #         "❌ Failed to update subscription after renewal",
        #         subscription_id=invoice.get("subscription"),
        #         error=str(e),
        #         exc_info=True
        #     )
        # raise
    
    
    
    def update_subscription_payment_failed(
        db: Session,
        invoice: dict
    ) -> Subscription:
        try:
            stripe_subscription_id = invoice["subscription"]

            subscription:Subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == stripe_subscription_id
            ).first()

            if not subscription:
                raise ValueError("Subscription not found")

            subscription.last_payment_status = "failed"
            subscription.is_active = False
            subscription.status = "past_due"

            subscription.updated_at = int(datetime.now(timezone.utc).timestamp())

            db.commit()
            db.refresh(subscription)

            return subscription

        except Exception:
            db.rollback()
            raise
        
    @staticmethod
    def save_subscription(db:Session, subscription: SubscriptionCreate) -> Subscription:
        return SubscriptionRepository.create(db, subscription)
    