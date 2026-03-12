
from datetime import datetime

from app.core.base import Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid

class fresh_token(Base):
    __tablename__ = "refresh_token"
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_hased: Mapped[str] = mapped_column(nullable=False, unique=True)
    
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="refresh_tokens")    
    
    expire_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)