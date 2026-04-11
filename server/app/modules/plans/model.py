from typing import List, TYPE_CHECKING
from sqlalchemy import  Integer, String, Float, ARRAY, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base


class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    features: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    max_org: Mapped[int] = mapped_column(Integer, nullable=False)
    max_post_month:Mapped[int] = mapped_column(Integer, nullable=False)  
   
    max_ai_caption: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    max_ai_image: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    price_id: Mapped[str] = mapped_column(String, nullable=False)  # ID du prix Stripe associé
    is_active: Mapped[bool] = mapped_column(Boolean, default=True) 
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    user = relationship("User", back_populates="plan")
    