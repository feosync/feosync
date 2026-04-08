from datetime import datetime
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.modules.collaborators.model import Collaborator, Invitation, RoleEnum


class CollaboratorRepository:
    """Repository pour les collaborateurs"""

    @staticmethod
    def create(db: Session, collaborator_data: dict) -> Collaborator:
        """Créer un nouveaux collaborateur"""
        collaborator = Collaborator(**collaborator_data)
        db.add(collaborator)
        db.commit()
        db.refresh(collaborator)
        return collaborator

    @staticmethod
    def get_by_id(db: Session, collaborator_id: UUID) -> Collaborator | None:
        """Récupérer un collaborateur par ID"""
        return db.query(Collaborator).filter(Collaborator.id == collaborator_id).first()

    @staticmethod
    def get_by_organisation_and_user(
        db: Session, organisation_id: UUID, user_id: UUID
    ) -> Collaborator | None:
        """Récupérer un collaborateur par organisation_id et user_id"""
        return db.query(Collaborator).filter(
            and_(Collaborator.organisation_id == organisation_id, Collaborator.user_id == user_id)
        ).first()

    @staticmethod
    def get_all_by_organisation(
        db: Session, organisation_id: UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[Collaborator], int]:
        """Récupérer tous les collaborateurs d'une organisation avec pagination"""
        query = db.query(Collaborator).filter(Collaborator.organisation_id == organisation_id)
        total = query.count()
        collaborators = query.offset(skip).limit(limit).all()
        return collaborators, total

    @staticmethod
    def delete(db: Session, collaborator_id: UUID) -> bool:
        """Supprimer un collaborateur"""
        collaborator = CollaboratorRepository.get_by_id(db, collaborator_id)
        if collaborator:
            db.delete(collaborator)
            db.commit()
            return True
        return False

    @staticmethod
    def update_role(db: Session, collaborator_id: UUID, new_role: RoleEnum) -> Collaborator | None:
        """Mettre à jour le rôle d'un collaborateur"""
        collaborator = CollaboratorRepository.get_by_id(db, collaborator_id)
        if collaborator:
            collaborator.role = new_role
            db.commit()
            db.refresh(collaborator)
        return collaborator


class InvitationRepository:
    """Repository pour les invitations"""

    @staticmethod
    def create(db: Session, invitation_data: dict) -> Invitation:
        """Créer une nouvelle invitation"""
        invitation = Invitation(**invitation_data)
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
        return invitation

    @staticmethod
    def get_by_token(db: Session, token: str) -> Invitation | None:
        """Récupérer une invitation par token"""
        return db.query(Invitation).filter(Invitation.token == token).first()

    @staticmethod
    def get_by_id(db: Session, invitation_id: UUID) -> Invitation | None:
        """Récupérer une invitation par ID"""
        return db.query(Invitation).filter(Invitation.id == invitation_id).first()

    @staticmethod
    def get_all_by_organisation(
        db: Session, organisation_id: UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[Invitation], int]:
        """Récupérer toutes les invitations d'une organisation avec pagination"""
        query = db.query(Invitation).filter(Invitation.organisation_id == organisation_id)
        total = query.count()
        invitations = query.order_by(Invitation.created_at.desc()).offset(skip).limit(limit).all()
        return invitations, total

    @staticmethod
    def update_status(db: Session, invitation_id: UUID, status: str) -> Invitation | None:
        """Mettre à jour le statut d'une invitation"""
        invitation = InvitationRepository.get_by_id(db, invitation_id)
        if invitation:
            invitation.status = status
            if status == "used":
                invitation.used_at = datetime.utcnow()
            db.commit()
            db.refresh(invitation)
        return invitation

    @staticmethod
    def delete(db: Session, invitation_id: UUID) -> bool:
        """Supprimer une invitation"""
        invitation = InvitationRepository.get_by_id(db, invitation_id)
        if invitation:
            db.delete(invitation)
            db.commit()
            return True
        return False
