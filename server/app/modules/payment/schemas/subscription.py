from pydantic import BaseModel, EmailStr
from typing import Optional

# Requêtes
class CreateProductRequest(BaseModel):
    name: str
    description: str

class CreatePriceRequest(BaseModel):
    product_id: str
    unit_amount: int  # en centimes
    currency: str = "usd"
    recurring_interval: str  # "day", "month", "year", "week"

class CreateCustomerRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class CreateSubscriptionRequest(BaseModel):
    customer_id: str
    price_id: str
    payment_method_id: str

# Réponses
class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    
class RecurringInfo(BaseModel):
    """Modèle pour les infos de récurrence"""
    interval: Optional[str] = None
    interval_count: Optional[int] = None
    aggregate_usage: Optional[str] = None
    
    class Config:
        extra = "allow"  # Permettre les champs supplémentaires
    
    
class PriceResponse(BaseModel):
    id: str
    product: str
    unit_amount: int
    currency: str
    recurring: Optional[RecurringInfo] = None
    type: Optional[str] = None
    billing_scheme: Optional[str] = None
    
class CustomerResponse(BaseModel):
    id: str
    email: str

class SubscriptionResponse(BaseModel):
    id: str
    customer: str
    items: dict
    status: str