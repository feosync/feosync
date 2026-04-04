from __future__ import annotations
from app.core.base import Base
from sqlalchemy import Text, DateTime, ForeignKey, Integer, Index
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
from app.modules.scheduled_post.models.scheduled_post_model import ImageSource


class ScheduledPostImage(Base):
    __tablename__ = "scheduled_post_image"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    image_source: Mapped[str] = mapped_column(
        SAEnum(ImageSource, name="image_source", native_enum=False),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ai_gen_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("ai_generation.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    scheduled_post_id: Mapped[UUID] = mapped_column(
        ForeignKey("scheduled_post.id", ondelete="CASCADE"), nullable=False
    )

    scheduled_post = relationship("ScheduledPost", back_populates="images")
    ai_generation = relationship("AiGeneration", back_populates="post_images")

    __table_args__ = (
        Index("uq_image_position_per_post", "scheduled_post_id", "position", unique=True),
    )