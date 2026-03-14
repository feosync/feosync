from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.base import Base
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from sqlalchemy import Enum as SAEnum

# ── Enums ─────────────────────────────────────────────────────────────────────
class SectorEnum(str, Enum):
    technology = "technology"
    finance = "finance"
    healthcare = "healthcare"
    education = "education"
    retail = "retail"
    manufacturing = "manufacturing"


class ToneEnum(str, Enum):
    formal = "formal"
    informal = "informal"
    friendly = "friendly"
    professional = "professional"
    casual = "casual"



# ── Model ─────────────────────────────────────────────────────────────────────
class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tone: Mapped[ToneEnum] = mapped_column(
        SAEnum(ToneEnum, native_enum=False), nullable=False
    )
    sector: Mapped[SectorEnum] = mapped_column(
        SAEnum(SectorEnum, native_enum=False), nullable=False
    )
    brand_color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # ── FK ────────────────────────────────────────────────────────────────────
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    user = relationship("User", back_populates="organisations")

    facebook_pages: Mapped[list["Facebook"]] = relationship(
        "Facebook", back_populates="organisation", cascade="all, delete-orphan"
    )
    whatsapp_accounts: Mapped[list["Whatsapp"]] = relationship(
        "Whatsapp", back_populates="organisation", cascade="all, delete-orphan"
    )
    ai_generations: Mapped[list["AiGeneration"]] = relationship(
        "AiGeneration", back_populates="organisation", cascade="all, delete-orphan"
    )
    post_templates: Mapped[list["PostTemplate"]] = relationship(
        "PostTemplate", back_populates="organisation", cascade="all, delete-orphan"
    )
    schedules: Mapped[list["Schedule"]] = relationship(
        "Schedule", back_populates="organisation", cascade="all, delete-orphan"
    )