from __future__ import annotations
from app.modules.organisations.models.sector_enum import sector_enum
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.base import Base 
from uuid import UUID, uuid4
class PostTemplate(Base):
    __tablename__ = "post_template"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    asset_url: Mapped[str] = mapped_column(String(255), nullable=False)  # URL de l'image ou de la vidéo associée au post
    sector: Mapped[sector_enum] = mapped_column(nullable=False)  # Secteur d'activité ciblé par le template
    usage_acount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # Compteur d'utilisation du template
    is_template_app: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)  # Indique si c'est un template fourni par l'application
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=True)  # Clé étrangère vers l'organisation propriétaire du template si c'est un template ajouté par l'organistions
    organisation = relationship("Organisation", back_populates="post_templates")    

    scheduled_posts: Mapped[list[ScheduledPost]] = relationship("ScheduledPost", back_populates="post_template", cascade="all, delete-orphan")  
    schedules: Mapped[list[Schedule]] = relationship("Schedule", back_populates="post_template", cascade="all, delete-orphan")