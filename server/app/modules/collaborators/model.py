from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import (
    ForeignKey,
    String,
    UniqueConstraint,
    DateTime,
    Index,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base


class RoleEnum(str, Enum):
    """Rôles disponibles pour les collaborateurs"""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class InvitationStatusEnum(str, Enum):
    """Statuts possibles d'une invitation"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    USED = "used"


class Collaborator(Base):
    """Modèle pour les collaborateurs d'une organisation"""
    __tablename__ = "collaborators"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organisation_id: Mapped[UUID] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[RoleEnum] = mapped_column(
        String(20), nullable=False, default=RoleEnum.VIEWER
    )
    invited_by: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Contraintes
    __table_args__ = (
        UniqueConstraint("organisation_id", "user_id", name="uq_organisation_user"),
        Index("idx_collaborators_organisation", "organisation_id"),
        Index("idx_collaborators_user", "user_id"),
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="collaborations")
    invited_by_user = relationship(
        "User", foreign_keys=[invited_by], back_populates="invited_collaborators"
    )


class Invitation(Base):
    """Modèle pour les invitations à rejoindre une organisation"""
    __tablename__ = "invitations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organisation_id: Mapped[UUID] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        String(20), nullable=False, default=RoleEnum.VIEWER
    )
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[InvitationStatusEnum] = mapped_column(
        String(20), nullable=False, default=InvitationStatusEnum.PENDING
    )
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Contraintes
    __table_args__ = (
        Index("idx_invitations_token", "token"),
        Index("idx_invitations_organisation", "organisation_id"),
        CheckConstraint("expires_at > created_at", name="ck_invitation_expiry"),
    )