from pydantic import BaseModel, EmailStr
 
class PlanInputOutput(BaseModel):
    name:str
    price: float
    features: list[str]
    max_page: int
    max_post_month: int
    max_ai_gen: int
    
    



    