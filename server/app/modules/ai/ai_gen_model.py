from __future__ import annotations
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from uuid import UUID, uuid4
from app.core.base import Base
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
class AiGeneration(Base):
    __tablename__ = "ai_generation"

    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="ai_generations")

    input_data: Mapped[dict[any]] = mapped_column(JSONB, nullable=True)
    prompt_used: Mapped[str] = mapped_column(String(255), nullable=False)
    output_data: Mapped[str] = mapped_column(String(255), nullable=False)
    model_used: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)  # URL de l'image générée, si applicable
    token_used: Mapped[int] = mapped_column(Integer, nullable=False)  # Nombre de tokens utilisés pour la génération
    caption: Mapped[str] = mapped_column(String(255), nullable=True)  # Légende ou description de l'image générée, si applicable
    created_at: Mapped[datetime] =mapped_column(DateTime(timezone=True), nullable=False)

    scheduled_posts: Mapped[list[ScheduledPost]] = relationship("ScheduledPost", back_populates="ai_generation")