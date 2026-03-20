from typing import List, TYPE_CHECKING
from sqlalchemy import Column, Integer, String, Float, ARRAY, ForeignKey  # type: ignore
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base
from uuid import UUID

class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    features: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    max_page: Mapped[int] = mapped_column(Integer, nullable=False)
    max_post_month:Mapped[int] = mapped_column(Integer, nullable=False)  
    max_ai_gen: Mapped[int] = mapped_column(Integer, nullable=False)
    user = relationship("User", back_populates="plan", cascade="all, delete-orphan")
    