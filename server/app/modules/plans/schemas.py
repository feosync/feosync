from typing import Optional
from pydantic import BaseModel, field_validator


class PlanCreate(BaseModel):
    name: str
    price: float
    features: list[str]
    max_org: int
    max_post_month: int
    max_ai_gen: int

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Le prix ne peut pas être négatif")
        return v


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    features: Optional[list[str]] = None
    max_org: Optional[int] = None
    max_post_month: Optional[int] = None
    max_ai_gen: Optional[int] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Le prix ne peut pas être négatif")
        return v

    model_config = {"from_attributes": True}


class PlanResponse(BaseModel):
    id: int
    name: str
    price: float
    features: list[str]
    max_org: int
    max_post_month: int
    max_ai_gen: int
    is_active: bool
    is_default: bool

    model_config = {"from_attributes": True}