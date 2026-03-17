# scheduled_post.py
from __future__ import annotations
from app.core.base import Base
from sqlalchemy import String, ForeignKey, DateTime,  Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum



class PostStatus(str, Enum):
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class ScheduledPost(Base):
    __tablename__ = "scheduled_post"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    caption: Mapped[str] = mapped_column(String, nullable=True)
    content: Mapped[dict] = mapped_column(JSONB, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)  # snapshot de l'image active
    publish_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[PostStatus] = mapped_column(
        SAEnum(PostStatus, native_enum=False), nullable=False, default=PostStatus.SCHEDULED
    )

    # Template (optionnel)
    post_template_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("post_template.id"), nullable=True
    )
    post_template = relationship("PostTemplate", back_populates="scheduled_posts")
    post_template_id: Mapped[UUID] = mapped_column(ForeignKey("post_templates.id"), nullable=True)

    # Schedule (nullable : post manuel possible sans schedule)
    schedule_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("schedule.id"), nullable=True   # corrigé : était nullable=False
    )
    schedule = relationship("Schedule", back_populates="scheduled_posts")

    # Published posts
    published_posts: Mapped[list["PublishedPost"]] = relationship(
        "PublishedPost", back_populates="scheduled_post"
    )

    # Historique des images IA (via table intermédiaire)
    ai_images: Mapped[list["ScheduledPostAiImage"]] = relationship(
        "ScheduledPostAiImage",
        back_populates="scheduled_post",
        order_by="ScheduledPostAiImage.linked_at",
    )

    # Propriété utilitaire : image active courante
    @property
    def active_ai_image(self) -> "ScheduledPostAiImage | None":
        return next((img for img in self.ai_images if img.is_active), None)
    