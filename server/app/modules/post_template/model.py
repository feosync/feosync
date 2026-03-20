from __future__ import annotations
from sqlalchemy import String, ForeignKey, Boolean, Integer, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import Enum as SAEnum
from sqlalchemy.sql import func
from app.core.base import Base
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class SectorEnum(str, Enum):
    technology = "technology"
    finance = "finance"
    healthcare = "healthcare"
    education = "education"
    retail = "retail"
    manufacturing = "manufacturing"


class PostTemplate(Base):
    __tablename__ = "post_templates"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    asset_url: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[SectorEnum] = mapped_column(
        SAEnum(SectorEnum, native_enum=False), nullable=False
    )
    usage_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_app_template: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # FK nullable → None si template app, rempli si template organisation
    organisation_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("organisations.id"), nullable=True
    )
    organisation = relationship("Organisation", back_populates="post_templates")

    scheduled_posts = relationship(
        "ScheduledPost", back_populates="post_template"
    )