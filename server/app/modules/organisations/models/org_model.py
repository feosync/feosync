from typing import TYPE_CHECKING
from app.modules.organisations.models.tone_enum import tone_enum
from app.modules.organisations.models.sector_enum import sector_enum
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from app.modules.ai.ai_gen_model import ai_generattion
    from app.modules.post_template.models.post_temp_model import post_template



class organisation(Base):
    __tablename__ = "organisations"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(255), nullable=True)
    tone: Mapped[tone_enum] = mapped_column(nullable=False)
    sector: Mapped[sector_enum] = mapped_column(nullable=False)
    brand_color: Mapped[list[str]] = mapped_column(String(7), nullable=True)  # Hex color code

    owner = relationship("User", back_populates="organisations")
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    facebook_pages = relationship("facebook", back_populates="org", cascade="all, delete-orphan")
    whatsapp_accounts = relationship("whatsapp", back_populates="organisation", cascade="all, delete-orphan")

    ai_generations: Mapped[list["ai_generation"]] = relationship("ai_generattion", back_populates="organisation", cascade="all, delete-orphan")

    post_templates: Mapped[list["post_template"]] = relationship("post_template", back_populates="organisation", cascade="all, delete-orphan")

    schedule: Mapped[list["schedule"]] = relationship("schedule", back_populates="post_template", cascade="all, delete-orphan")