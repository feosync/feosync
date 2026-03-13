from __future__ import annotations
from datetime import datetime
from uuid import UUID, uuid4

from app.core.base import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column


class PostAnalytics(Base):
    __tablename__ = "post_analytics"          # corrigé (pluriel + orthographe)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    # === Relation avec PublishedPost ===
    published_post_id: Mapped[UUID] = mapped_column(
        ForeignKey("published_posts.id"), nullable=False
    )
    published_post = relationship(
        "PublishedPost", back_populates="post_analytics"   
    )

    mesured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reach: Mapped[int] = mapped_column(nullable=True)
    impressions: Mapped[int] = mapped_column(nullable=True)
    reactions: Mapped[dict] = mapped_column(JSONB, nullable=True)
    comments: Mapped[int] = mapped_column(nullable=True)
    shares: Mapped[int] = mapped_column(nullable=True)
    clicks: Mapped[int] = mapped_column(nullable=True)

    # === Timestamps (cohérence avec tous tes autres modèles) ===
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )