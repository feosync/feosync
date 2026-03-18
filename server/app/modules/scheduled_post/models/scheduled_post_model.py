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
    SCHEDULED = "SCHEDULED"
    PUBLISHED = "PUBLISHED"
    FAILED    = "FAILED"


class ScheduledPost(Base):
    __tablename__ = "scheduled_post"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    publish_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[PostStatus] = mapped_column(
        SAEnum(PostStatus, name="post_status", native_enum=False),
        nullable=False,
        default=PostStatus.SCHEDULED,
    )
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    post_template_id: Mapped[UUID | None] = mapped_column(ForeignKey("post_templates.id"), nullable=True)

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