from typing import List
from sqlalchemy import Column, Integer, String, Float, ARRAY  # type: ignore
from sqlalchemy.orm import relationship, Mapped
from app.core.base import Base
class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String, unique=True, nullable=False)
    description: Mapped[str] = Column(String, nullable=False)
    price: Mapped[float] = Column(Float, nullable=False)
    features: Mapped[List[str]] = Column(ARRAY(String), nullable=False)

    user = relationship("users", back_populates="plan_model", uselist=False)


