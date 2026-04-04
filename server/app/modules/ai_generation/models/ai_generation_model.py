from __future__ import annotations
from sqlalchemy import String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.base import Base
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class AiProvider(str, Enum):
    GEMINI    = "gemini"
    OPENAI    = "openai"
    REPLICATE = "replicate"


class AiGenerationType(str, Enum):
    CAPTION = "caption"
    IMAGE   = "image"


class AiGeneration(Base):
    __tablename__ = "ai_generation"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    generation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default=AiProvider.GEMINI)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)

    prompt_used: Mapped[str] = mapped_column(Text, nullable=False)
    input_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    output_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    organisation = relationship("Organisation", back_populates="ai_generations")
    post_images = relationship("ScheduledPostImage", back_populates="ai_generation")