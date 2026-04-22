from __future__ import annotations
from app.core.base import Base
from sqlalchemy import ForeignKey, DateTime, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class PostStatus(str, Enum):
    DRAFT     = "DRAFT"
    SCHEDULED = "SCHEDULED"
    PUBLISHED = "PUBLISHED"
    FAILED    = "FAILED"


class ImageSource(str, Enum):
    URL    = "url"
    UPLOAD = "upload"
    AI     = "ai"


class ScheduledPost(Base):
    __tablename__ = "scheduled_post"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # ── Contenu ───────────────────────────────────────────────────────────────
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Planification ─────────────────────────────────────────────────────────
    publish_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(PostStatus, name="post_status", native_enum=False),
        nullable=False,
        default=PostStatus.DRAFT,
    )

    qstash_message_id: Mapped[str | None] = mapped_column(Text, nullable=True, server_default=None)

    # ── Cibles de publication ─────────────────────────────────────────────────
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ── FK ────────────────────────────────────────────────────────────────────
    organisation_id: Mapped[UUID] = mapped_column(
        ForeignKey("organisations.id"), nullable=False
    )
    post_template_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("post_templates.id"), nullable=True
    )

    # ── Relations ─────────────────────────────────────────────────────────────
    organisation  = relationship("Organisation", back_populates="scheduled_posts")
    post_template = relationship("PostTemplate", back_populates="scheduled_posts")
    published_posts = relationship("PublishedPost", back_populates="scheduled_post")
    images = relationship(
        "ScheduledPostImage",
        back_populates="scheduled_post",
        order_by="ScheduledPostImage.position",
        cascade="all, delete-orphan",
    )

    @property
    def cover_image(self) -> "ScheduledPostImage | None":
        return self.images[0] if self.images else None