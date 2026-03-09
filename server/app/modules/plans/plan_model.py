from unittest.mock import Base


class plan_model(Base):
    __tablename__ = "plans"

    id: int
    name: str
    description: str
    price: float
    features: list[str]