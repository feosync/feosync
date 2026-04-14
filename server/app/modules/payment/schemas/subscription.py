from datetime import datetime
from typing import Optional
from uuid import UUID

import enum
from pydantic import BaseModel, EmailStr
from enum import Enum


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    TRIALING = "trialing"


# ==================== REQUESTS ====================

class CreateProductRequest(BaseModel):
    name: str
    description: str


class CreatePriceRequest(BaseModel):
    product_id: str
    unit_amount: int          # en centimes
    currency: str = "eur"
    recurring_interval: str   # "month", "year", etc.


class CreateCustomerRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class SubscriptionRequest(BaseModel):
    """Ce que reçoit l'endpoint pour créer un abonnement"""
    stripe_price_id: str
    stripe_customer_id: str
    payment_method_id: str


# ==================== RESPONSES / INTERNAL ====================

class SubscriptionCreate(BaseModel):
    """Modèle utilisé pour créer l'abonnement en base de données"""
    
    user_id: UUID
    stripe_subscription_id: str
    stripe_customer_id: str
    stripe_price_id: str
    payment_method_id: Optional[str] = None

    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    is_active: bool = True

    # Timestamps Unix (entiers) - très important pour correspondre à ton modèle SQLAlchemy
    current_period_start: int
    current_period_end: int
    created_at: int
    updated_at: int

    last_payment_date: Optional[int] = None
    last_payment_amount: Optional[int] = None
    last_payment_status: Optional[str] = None

    class Config:
        use_enum_values = True  # Pour que les enums soient sauvegardés en string

    class Config:
        from_attributes = True


# Garder tes anciens modèles si tu en as besoin ailleurs
class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


class CustomerResponse(BaseModel):
    id: str
    email: str
class RecurringInfo(BaseModel):
    """Modèle pour les infos de récurrence"""
    interval: Optional[str] = None
    interval_count: Optional[int] = None
    aggregate_usage: Optional[str] = None
       
    
class PriceResponse(BaseModel):
    id: str
    product: str
    unit_amount: int
    currency: str
    recurring: Optional[RecurringInfo] = None
    type: Optional[str] = None
    billing_scheme: Optional[str] = None
    
class SubcriptionUpdate(BaseModel):
    stripe_price_id: str
    stripe_subscription_id: str
    status: SubscriptionStatus
    curent_period_start: int
    current_period_end: int