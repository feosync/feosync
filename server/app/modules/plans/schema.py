from typing import Optional

from pydantic import BaseModel, field_validator
 
class PlanCreate(BaseModel):
    name:str
    price: float
    features: list[str]
    max_page: int
    max_post_month: int
    max_ai_gen: int
    
class PlanResponse(PlanCreate):
    id: int
    class Config: 
        from_attributes=True
        
# schemas.py
class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    feature: Optional[list[str]] = None
    max_page: Optional[int] = None
    max_post_month: Optional[int] = None
    max_ai_gen: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, value):
        if value is not None and value < 0:
            raise ValueError("Le prix ne peut pas être négatif")
        return value
    model_config = {"from_attributes": True}