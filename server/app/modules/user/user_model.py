from uuid import UUID, uuid4
from app.modules.organisations.models.org_model import organisation
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    plan = relationship("Plan", back_populates="user", uselist=False)
    plan_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("plans.id"))

   # un utilisateur peut avoir plusieurs organisations
    organisations: Mapped[list["organisation"]] = relationship(
        "organisation", back_populates="users"
    )



