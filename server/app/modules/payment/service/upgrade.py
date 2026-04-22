from .init_stripe import InitStripe
from ..repository.subscription import SubscriptionRepository
from sqlalchemy.orm import Session
from ..schemas.subscription import SubcriptionUpdate
from app.core.logger import get_logger

logger = get_logger()

class UpgradeSubcription:
    def __init__(self):
        self.stripe_client = InitStripe()
        self.stripe = self.stripe_client.exececute()
        
    def upgrade_subscription(self, stripe_subscription_id:str, stripe_price_id:str, db:Session):
        subscription = self.stripe.Subscription.retrieve(stripe_subscription_id)
        current_price_id = subscription['items']['data'][0]['price']['id']
        
        if current_price_id == stripe_price_id:
            raise ValueError("The new price is the same as the current price.")
        
        # Update the subscription with the new price
        updated_subscription = self.stripe.Subscription.modify(
            stripe_subscription_id,
            items=[{
                'id': subscription["items"]["data"][0]["id"], 
                'price': stripe_price_id,
            }],
            proration_behavior="create_prorations",
        )
        if not updated_subscription:
            raise ValueError("Failed to update the subscription on Stripe.")
        
        logger.info(
            "✅ Subscription updated on Stripe",
            stripe_subscription_id=stripe_subscription_id,
            new_price_id=stripe_price_id,
            status=updated_subscription['status']
        )
        data: SubcriptionUpdate = {
            "stripe_price_id": stripe_price_id,
            "stripe_subscription_id": stripe_subscription_id,
            "status": updated_subscription['status'],
            "curent_period_start": updated_subscription["items"]["data"][0]["current_period_start"],
            "current_period_end": updated_subscription["items"]["data"][0]["current_period_end"]
        }
        try:
            updated_subscription = SubscriptionRepository.update(data=data, stripe_subscription_id=stripe_subscription_id, db=db)
        except Exception as e:
            logger.error(
                "❌ Failed to update subscription in database",
                stripe_subscription_id=stripe_subscription_id,
                error=str(e),
                exc_info=True
            )
            raise(e)

        return updated_subscription
        
    