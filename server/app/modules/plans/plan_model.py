from typing import List, TYPE_CHECKING
from sqlalchemy import Column, Integer, String, Float, ARRAY, ForeignKey  # type: ignore
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base
from uuid import UUID

class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    features: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)


