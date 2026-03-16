from __future__ import annotations
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Text, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from uuid import UUID, uuid4
from app.core.base import Base
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB


class AiGeneration(Base):
    __tablename__ = "ai_generation"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    organisation_id: Mapped[UUID] = mapped_column(
        ForeignKey("organisations.id"), nullable=False
    )
    organisation = relationship("Organisation", back_populates="ai_generations")

    input_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    prompt_used: Mapped[str] = mapped_column(Text, nullable=False)        # Text, pas String(255)
    output_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)  # URLs peuvent être longues
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)      # Text, pas String(255)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Relation vers la table intermédiaire (plus de lien direct vers ScheduledPost)
    post_ai_images: Mapped[list["ScheduledPostAiImage"]] = relationship(
        "ScheduledPostAiImage", back_populates="ai_generation"
    )
    