from __future__ import annotations
from app.core.base import Base
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from uuid import UUID, uuid4
from datetime import datetime
import uuid


class Facebook(Base):
    __tablename__ = "facebook_pages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    fb_page_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    page_name: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token: Mapped[str] = mapped_column(Text, nullable=False)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="facebook_pages", cascade="all, delete-orphan")

    page_insights = relationship("PageInsights", back_populates="fb_page", cascade="all, delete-orphan")
    published_posts = relationship("PublishedPost", back_populates="facebook_page", cascade="all, delete-orphan")


class PageInsights(Base):
    __tablename__ = "page_insights"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fans_total: Mapped[int] = mapped_column(nullable=False, default=0)
    impressions_unique: Mapped[int] = mapped_column(nullable=False, default=0)
    engaged_users: Mapped[int] = mapped_column(nullable=False, default=0)
    new_followers: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    fb_page_id: Mapped[UUID] = mapped_column(ForeignKey("facebook_pages.id"), nullable=False)
    fb_page = relationship("Facebook", back_populates="page_insights", cascade="all, delete-orphan")