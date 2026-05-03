from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.modules.payment.models.subscription import Subscription
from app.modules.payment.schemas.subscription import SubscriptionCreate, SubcriptionUpdate
from app.core.logger import get_logger
from uuid import UUID

from app.modules.payment.service import subscription

logger = get_logger()


class SubscriptionRepository:
    """Repository pour gérer les opérations sur les souscriptions"""
     
    @staticmethod
    def update(db:Session, data:SubcriptionUpdate, stripe_subscription_id:UUID)->Subscription:
        """Met à jour une souscription en base de données"""
        try:
            subscription = db.query(Subscription).filter(Subscription.stripe_subscription_id == stripe_subscription_id).first()
            if not subscription:
                raise ValueError(f"Subscription with id {stripe_subscription_id} not found")

            for key, value in data.items():
                setattr(subscription, key, value)

            subscription.updated_at = int(datetime.now(timezone.utc).timestamp())            
            db.commit()
            db.refresh(subscription)

            logger.info(
                "✅ Subscription updated in database",
                subscription_id=subscription.stripe_subscription_id,
                user_id=str(subscription.user_id),
                status=subscription.status
            )
            return subscription
        
        except Exception as e:
            db.rollback()
            logger.error(
                "❌ Failed to update subscription in database",
                subscription_id=str(stripe_subscription_id),
                error=str(e),
                exc_info=True
            )
     
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
            raise('Failed to save subscription in database')

    @staticmethod
    def updateStatus(db: Session, stripe_subscription_id: UUID, new_status: str) -> Subscription:
        """Met à jour le statut d'une souscription"""
        try:
            subscription = db.query(Subscription).filter(Subscription.stripe_subscription_id == stripe_subscription_id).first()
            if not subscription:
                raise ValueError(f"Subscription with id {stripe_subscription_id} not found")

            subscription.status = new_status
            subscription.updated_at = int(datetime.now(timezone.utc).timestamp())
            db.commit()
            db.refresh(subscription)

            logger.info(
                "✅ Subscription status updated in database",
                subscription_id=subscription.stripe_subscription_id,
                user_id=str(subscription.user_id),
                new_status=subscription.status
            )
            return subscription
        
        except Exception as e:
            db.rollback()
            logger.error(
                "❌ Failed to update subscription status in database",
                subscription_id=str(stripe_subscription_id),
                error=str(e),
                exc_info=True
            )
            raise('Failed to update subscription status in database')