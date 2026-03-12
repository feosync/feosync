
from __future__ import annotations
from datetime import datetime

from app.core.base import Base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid

class Schedule(Base):
    __tablename__ = "schedule"
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organisation = relationship("Organisation", back_populates="schedules")
    organisation_id: Mapped[UUID] = mapped_column(ForeignKey("organisations.id"), nullable=False)  
    post_template = relationship("PostTemplate", back_populates="schedules")
    post_template_id: Mapped[UUID] = mapped_column(ForeignKey("post_template.id"), nullable=True)
    name: Mapped[str] = mapped_column(nullable=False)   
    cron_expression: Mapped[str] = mapped_column(nullable=False)   
    data_source_config: Mapped[dict]= mapped_column(JSONB, nullable=True)  # Configuration spécifique pour la source de données (ex: paramètres d'API, requêtes SQL, etc.)  
    last_run_at: Mapped[datetime] = mapped_column(nullable=True)  # Date et heure de la dernière exécution du schedule
    next_run_at: Mapped[datetime] = mapped_column(nullable=True)  # Date et heure de la prochaine exécution prévue du schedule
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)  # Indique si le schedule est actif ou non