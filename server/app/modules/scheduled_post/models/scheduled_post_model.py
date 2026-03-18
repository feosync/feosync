from __future__ import annotations
from app.core.base import Base
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class PostStatus(str, Enum):
    DRAFT      = "DRAFT"       # créé, pas encore planifié
    SCHEDULED  = "SCHEDULED"   # confirmé → Celery task créée
    PUBLISHED  = "PUBLISHED"   # publié sur Meta
    FAILED     = "FAILED"      # échec publication


class ImageSource(str, Enum):
    URL    = "url"      # lien externe fourni par l'user
    UPLOAD = "upload"   # fichier uploadé → stocké en interne
    AI     = "ai"       # généré par Gemini


class ScheduledPost(Base):
    __tablename__ = "scheduled_post"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # ── Contenu ───────────────────────────────────────────────────────────────
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    image_source: Mapped[str | None] = mapped_column(
        SAEnum(ImageSource, name="image_source", native_enum=False),
        nullable=True
    )

    # ── Planification ─────────────────────────────────────────────────────────
    publish_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(PostStatus, name="post_status", native_enum=False),
        nullable=False,
        default=PostStatus.DRAFT,
    )

    # ── Cibles de publication ─────────────────────────────────────────────────
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # ex: {"facebook": "uuid_fb_page"}

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── FK ────────────────────────────────────────────────────────────────────
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    post_template_id: Mapped[UUID | None] = mapped_column(ForeignKey("post_templates.id"), nullable=True)

    # ── Relations ─────────────────────────────────────────────────────────────
    organisation = relationship("Organisation", back_populates="scheduled_posts")
    post_template = relationship("PostTemplate", back_populates="scheduled_posts")
    published_posts = relationship("PublishedPost", back_populates="scheduled_post")
    ai_images = relationship(
        "ScheduledPostAiImage",
        back_populates="scheduled_post",
        order_by="ScheduledPostAiImage.linked_at",
    )

    @property
    def active_ai_image(self) -> "ScheduledPostAiImage | None":
        return next((img for img in self.ai_images if img.is_active), None)