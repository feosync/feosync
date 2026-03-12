
import uuid

from app.core.base import Base
from app.modules.scheduled_post.models.scheduled_post_model import scheduled_post
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone
from sqlalchemy import DateTime

class facebook(Base):
    __tablename__ = "facebook_pages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    page_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    page_name: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token: Mapped[str] = mapped_column(String(255), nullable=False)
    token_expiry: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),  # stocke la date avec timezone
        nullable=False)
    last_synced: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    org_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)
    org = relationship("Organisation", back_populates="facebook_pages")

    schelued_posts: Mapped[list["scheduled_post"]] = relationship("scheduled_post", back_populates="fb_page", cascade="all, delete-orphan")