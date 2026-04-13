from sqlalchemy.orm import Session

from app.modules.payment.models.subscription import Subscription
from app.modules.payment.schemas.subscription import SubscriptionCreate
from app.core.logger import get_logger

logger = get_logger(__name__)


class SubscriptionRepository:
    """Repository pour gérer les opérations sur les souscriptions"""

    @staticmethod
    def create(db: Session, subscription_in: SubscriptionCreate) -> Subscription:
        """Créer une nouvelle souscription en base de données"""
        try:
            new_subscription = Subscription(
                user_id=subscription_in.user_id,
                stripe_subscription_id=subscription_in.stripe_subscription_id,
                stripe_customer_id=subscription_in.stripe_customer_id,
                stripe_price_id=subscription_in.stripe_price_id,
                payment_method_id=subscription_in.payment_method_id,
                
                status=subscription_in.status,
                is_active=subscription_in.is_active,
                
                # Timestamps Unix (entiers)
                current_period_start=subscription_in.current_period_start,
                current_period_end=subscription_in.current_period_end,
                last_payment_date=subscription_in.last_payment_date,
                created_at=subscription_in.created_at,
                updated_at=subscription_in.updated_at or subscription_in.created_at,  # fallback
                
                last_payment_amount=subscription_in.last_payment_amount,
                last_payment_status=subscription_in.last_payment_status,
            )

            db.add(new_subscription)
            db.commit()
            db.refresh(new_subscription)

            logger.info(
                "✅ Subscription saved in database",
                subscription_id=new_subscription.stripe_subscription_id,
                user_id=str(new_subscription.user_id),
                status=new_subscription.status
            )

            return new_subscription

        except Exception as e:
            db.rollback()
            logger.error(
                "❌ Failed to save subscription in database",
                stripe_subscription_id=subscription_in.stripe_subscription_id,
                user_id=str(subscription_in.user_id),
                error=str(e),
                exc_info=True
            )
            raise