from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.base import Base
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column


class published_post(Base):
    __tablename__ = "published_post"
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    schedule_post_id: Mapped[UUID] = mapped_column(ForeignKey("scheduled_post.id"), nullable=False)
    schedule_post = relationship("scheduled_post", back_populates="published_post")

    post_id: Mapped[str] = mapped_column(nullable=True)
    chanel: Mapped[str] = mapped_column(nullable=True)
    published_at: Mapped[datetime] =mapped_column(DateTime(timezone=True), nullable=False)
    initial_reach: Mapped[int] = mapped_column(nullable=True)
    initial_impressions: Mapped[int] = mapped_column(nullable=True)




    