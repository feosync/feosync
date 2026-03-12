from __future__ import annotations
import uuid

from app.core.base import Base
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

class PageInsights(Base):
    __tablename__ = "page_insights"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    fb_page_id: Mapped[UUID] = mapped_column(ForeignKey("facebook_pages.id"), nullable=False)
    fb_page = relationship("Facebook", back_populates="page_insights")

    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    fans_totals: Mapped[int] = mapped_column(nullable=False)
    impressions_unique: Mapped[int] = mapped_column(nullable=False)
    engaged_users: Mapped[int] = mapped_column(nullable=False)
    new_followers: Mapped[int] = mapped_column(nullable=False)

