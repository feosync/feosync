from app.core.base import Base

from app.modules.scheduled_post.models.post_status import post_status
from app.modules.published_post.published_post_model import published_post
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime as Datetime
import uuid


class scheduled_post(Base):
    __tablename__ = 'scheduled_post'
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


    caption: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[dict] = mapped_column(JSONB, nullable=False) 
    image_url: Mapped[str] = mapped_column(nullable=True)
    publish_at: Mapped[Datetime] = mapped_column(nullable=False)
    status: Mapped[post_status] = mapped_column(nullable=False)
    chanels: Mapped[list[str]] = mapped_column(JSONB, nullable=False)  # Liste des plateformes de publication (ex: ["facebook", "twitter"])
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False)  # Dictionnaire associant chaque plateforme à l'ID de la page ou du compte (ex: {"facebook": "123456789", "twitter": "987654321"})
    
    organisation = relationship("organisation", back_populates="scheduled_posts")
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)

    post_template = relationship("post_template", back_populates="scheduled_posts")
    post_template_id: Mapped[UUID] = mapped_column(ForeignKey("post_template.id"), nullable=True)

    ai_generation = relationship("ai_generation", back_populates="scheduled_post")
    ai_generation_id: Mapped[UUID] = mapped_column(ForeignKey("ai_generation.id"), nullable=True)

    published_post: Mapped[list["published_post"]] = relationship("published_post", back_populates="schedule_post", uselist=False)


    
