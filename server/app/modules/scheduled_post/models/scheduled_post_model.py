from __future__ import annotations
from app.core.base import Base

from app.modules.scheduled_post.models.post_status import post_status
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime as Datetime
import uuid

class ScheduledPost(Base):
    __tablename__ = 'scheduled_post'
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


    caption: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[dict] = mapped_column(JSONB, nullable=False) 
    image_url: Mapped[str] = mapped_column(nullable=True)
    publish_at: Mapped[Datetime] = mapped_column(nullable=False)
    status: Mapped[post_status] = mapped_column(nullable=False)
    chanels: Mapped[list[str]] = mapped_column(JSONB, nullable=False)  # Liste des plateformes de publication (ex: ["facebook", "twitter"])
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)  # Dictionnaire associant chaque plateforme à l'ID de la page ou du compte (ex: {"facebook": "123456789", "twitter": "987654321"})
    
    organisation = relationship("Organisation", back_populates="scheduled_posts")
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)

    post_template = relationship("PostTemplate", back_populates="scheduled_posts")
    post_template_id: Mapped[UUID] = mapped_column(ForeignKey("post_template.id"), nullable=True)

    ai_generation = relationship("AiGeneration", back_populates="scheduled_posts")
    ai_generation_id: Mapped[UUID] = mapped_column(ForeignKey("ai_generation.id"), nullable=True)

    published_posts: Mapped[list["PublishedPost"]] = relationship("PublishedPost", back_populates="scheduled_post")

    
    
