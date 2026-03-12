
from __future__ import annotations
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from uuid import UUID, uuid4
from app.core.base import Base


class Whatsapp(Base):
    __tablename__ = "whatsapp"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    access_token: Mapped[str] = mapped_column(String(255), nullable=False)

    #identifiant unique d'un compte whatsapp business
    waba_id: Mapped[str] = mapped_column(String(255), nullable=False)

    #liste des contacts enregistrés pour le broadcast
    broadcast_list: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="whatsapp_accounts")