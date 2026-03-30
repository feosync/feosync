from __future__ import annotations
from datetime import datetime
from uuid import UUID, uuid4

from app.core.base import Base
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column


class PublishedPost(Base):
    __tablename__ = "published_posts"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # === Relation avec ScheduledPost ===
    scheduled_post_id: Mapped[UUID] = mapped_column(ForeignKey("scheduled_post.id"), nullable=False)
    scheduled_post = relationship("ScheduledPost", back_populates="published_posts")
    is_auto_comment: Mapped[bool] = mapped_column(nullable=False, default=False)  # Indique si le post est un auto-commentaire
    instructions: Mapped[str] = mapped_column(String(255), nullable=True)  # Instructions pour l'auto-commentaire
    keywords: Mapped[str] = mapped_column(String(255), nullable=True)  # Mots-clés pour l'auto-commentaire
    # === Relation avec Facebook (MANQUANTE AVANT) ===
    facebook_page_id: Mapped[UUID] = mapped_column(ForeignKey("facebook_pages.id"), nullable=False)
    facebook_page = relationship("Facebook", back_populates="published_posts")

    post_id: Mapped[str] = mapped_column(String(255), nullable=True)
    channel: Mapped[str] = mapped_column(String(255), nullable=True)         
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    initial_reach: Mapped[int] = mapped_column(nullable=True)
    initial_impressions: Mapped[int] = mapped_column(nullable=True)

        # === Relation avec les analytics ===
    post_analytics: Mapped[list["PostAnalytics"]] = relationship(
        "PostAnalytics", 
        back_populates="published_post", 
        cascade="all, delete-orphan"
    )
    # === Timestamps (cohérence) ===
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    