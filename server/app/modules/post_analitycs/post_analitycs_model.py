from datetime import datetime

from app.core.base import Base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid

class post_analitycs(Base):
    __tablename__ = 'post_analitycs'
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    published_post_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("published_post.id"), nullable=False)
    published_post = relationship("published_post", back_populates="post_analitycs")
    mesured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reach: Mapped[int] = mapped_column(nullable=True)
    impressions: Mapped[int] = mapped_column(nullable=True)
    reactions: Mapped[dict] = mapped_column(JSONB, nullable=True)  # Dictionnaire associant chaque type de réaction à son nombre (ex: {"like": 100, "love": 50, "haha": 20})
    comments: Mapped[int] = mapped_column(nullable=True)
    shares: Mapped[int] = mapped_column(nullable=True)
    clicks: Mapped[int] = mapped_column(nullable=True)
