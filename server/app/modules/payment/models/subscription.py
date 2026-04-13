from datetime import datetime
from uuid import uuid4

from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.core.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=False, nullable=False
    )

    # Stripe IDs
    stripe_subscription_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    stripe_customer_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    stripe_price_id: Mapped[str] = mapped_column(String(100), nullable=False)
    payment_method_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="active")

    # === CHANGEMENT IMPORTANT : Utiliser Integer au lieu de DateTime ===
    current_period_start: Mapped[int] = mapped_column(Integer, nullable=False)
    current_period_end: Mapped[int] = mapped_column(Integer, nullable=False)
    last_payment_date: Mapped[int | None] = mapped_column(Integer, nullable=True)

    last_payment_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    last_payment_status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Timestamps
    created_at: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[int] = mapped_column(Integer, nullable=False)

    user = relationship("User", back_populates="subscription")