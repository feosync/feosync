from __future__ import annotations
from app.modules.organisations.models.tone_enum import tone_enum
from app.modules.organisations.models.sector_enum import sector_enum
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base
from uuid import UUID, uuid4


class Organisation(Base):
    __tablename__ = "organisations"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(255), nullable=True)
    tone: Mapped[tone_enum] = mapped_column(nullable=False)
    sector: Mapped[sector_enum] = mapped_column(nullable=False)
    brand_color: Mapped[list[str]] = mapped_column(String(7), nullable=True)  # Hex color code

    user = relationship("User", back_populates="organisations")
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    facebook_pages = relationship("Facebook", back_populates="org", cascade="all, delete-orphan")
    whatsapp_accounts = relationship("Whatsapp", back_populates="organisation", cascade="all, delete-orphan")

    ai_generations: Mapped[list[AiGeneration]] = relationship("AiGeneration", back_populates="organisation", cascade="all, delete-orphan")
    post_templates: Mapped[list[PostTemplate]] = relationship("PostTemplate", back_populates="organisation", cascade="all, delete-orphan")
    schedules: Mapped[list[Schedule]] = relationship("Schedule", back_populates="organisation", cascade="all, delete-orphan")
    scheduled_posts: Mapped[list[ScheduledPost]] = relationship("ScheduledPost", back_populates="organisation", cascade="all, delete-orphan")