from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.user.model import User

from .init_stripe import InitStripe
from ..schemas.subscription import SubscriptionRequest, SubscriptionCreate
from ..repository.subscription import SubscriptionRepository
from app.modules.payment.schemas import subscription
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
    def attach_payment_method(self, payment_method_id, customer_id):
        return self.stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )
    
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

            # 3. Create subscription on Stripe
            new_subscription = self.stripe.Subscription.create(
                customer=subscription_request.stripe_customer_id,
                items=[{"price": subscription_request.stripe_price_id}],
                default_payment_method=subscription_request.payment_method_id,
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

        
    @staticmethod
    def save_subscription(db:Session, subscription: SubscriptionCreate) -> Subscription:
        return SubscriptionRepository.create(db, subscription)
    