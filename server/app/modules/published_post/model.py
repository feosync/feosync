from __future__ import annotations
from datetime import datetime
from uuid import UUID, uuid4

from app.core.base import Base
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column


class PublishedPost(Base):
    __tablename__ = "published_posts"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # ── Relations ─────────────────────────────────────────────────────────────
    scheduled_post_id: Mapped[UUID] = mapped_column(
        ForeignKey("scheduled_post.id"), nullable=False
    )
    scheduled_post = relationship("ScheduledPost", back_populates="published_posts")

    facebook_page_id: Mapped[UUID] = mapped_column(
        ForeignKey("facebook_pages.id"), nullable=False
    )
    facebook_page = relationship("Facebook", back_populates="published_posts")

    # ── Meta ──────────────────────────────────────────────────────────────────
    post_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_permalink: Mapped[str | None] = mapped_column(Text, nullable=True)
    channel: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_count: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")  # nb images publiées

    # ── Auto-commentaire ──────────────────────────────────────────────────────
    is_auto_comment: Mapped[bool] = mapped_column(nullable=False, default=False)
    instructions: Mapped[str | None] = mapped_column(String(255), nullable=True)
    keywords: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Métriques ─────────────────────────────────────────────────────────────
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    initial_reach: Mapped[int | None] = mapped_column(nullable=True)
    initial_impressions: Mapped[int | None] = mapped_column(nullable=True)

    # ── Analytics ─────────────────────────────────────────────────────────────
    post_analytics: Mapped[list["PostAnalytics"]] = relationship(
        "PostAnalytics",
        back_populates="published_post",
        cascade="all, delete-orphan",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )