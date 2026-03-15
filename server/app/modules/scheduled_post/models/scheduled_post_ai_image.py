# scheduled_post_ai_image.py  ← nouveau fichier
from __future__ import annotations
from app.core.base import Base
from sqlalchemy import Boolean, String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from uuid import UUID, uuid4


class ScheduledPostAiImage(Base):
    __tablename__ = "scheduled_post_ai_image"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    scheduled_post_id: Mapped[UUID] = mapped_column(
        ForeignKey("scheduled_post.id", ondelete="CASCADE"), nullable=False
    )
    ai_gen_id: Mapped[UUID] = mapped_column(
        ForeignKey("ai_generation.id"), nullable=False
    )

    # Snapshot de l'URL au moment de la liaison (découplé de AI_GENERATION)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)

    # Une seule ligne active par post (enforced par partial unique index ci-dessous)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    linked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    # Renseigné quand l'utilisateur change d'image
    replaced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relations
    scheduled_post = relationship("ScheduledPost", back_populates="ai_images")
    ai_generation = relationship("AiGeneration", back_populates="post_ai_images")

    # Garantit qu'un seul is_active=True existe par scheduled_post
    __table_args__ = (
        Index(
            "uq_one_active_ai_image_per_post",
            "scheduled_post_id",
            unique=True,
            postgresql_where=mapped_column("is_active") == True,  # partial index
        ),
    )