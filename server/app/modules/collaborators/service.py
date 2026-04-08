import secrets
import logging
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from fastapi_mail import MessageSchema, MessageType

from app.modules.collaborators.model import Collaborator, Invitation, RoleEnum, InvitationStatusEnum
from app.modules.collaborators.repository import (
    CollaboratorRepository,
    InvitationRepository,
)
from app.modules.user.model import User
from app.modules.user.repository import UserRepository
from app.modules.auth.service import AuthService
from app.core.mail import fastmail
from app.core.config import settings

logger = logging.getLogger(__name__)


class CollaboratorService:
    """Service pour gérer les collaborateurs et invitations"""

    # Durée d'expiration des invitations en minutes
    INVITATION_EXPIRY_MINUTES = 10
    
    # Quota de collaborateurs par compte (peut être configuré par tier)
    COLLABORATORS_QUOTA = 50

    @staticmethod
    def get_all_collaborators(
        db: Session, organisation_id: UUID, skip: int = 0, limit: int = 20
    ) -> tuple[list[Collaborator], int]:
        """Récupérer tous les collaborateurs d'une organisation"""
        collaborators, total = CollaboratorRepository.get_all_by_organisation(
            db, organisation_id, skip, limit
        )
        return collaborators, total

    @staticmethod
    def remove_collaborator(
        db: Session, organisation_id: UUID, collaborator_id: UUID, current_user_id: UUID
    ) -> bool:
        """Supprimer un collaborateur d'une organisation (seul owner ou admin peut le faire)"""
        collaborator = CollaboratorRepository.get_by_id(db, collaborator_id)
        
        if not collaborator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborateur non trouvé"
            )
        
        if collaborator.organisation_id != organisation_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce collaborateur ne fait pas partie de votre organisation"
            )
        
        # Vérifier que l'utilisateur courant est propriétaire ou admin de l'organisation
        current_collaborator = CollaboratorRepository.get_by_organisation_and_user(
            db, organisation_id, current_user_id
        )
        if not current_collaborator or current_collaborator.role not in [
            RoleEnum.ADMIN
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas la permission de retirer un collaborateur"
            )
        
        # Ne pas permettre de supprimer le dernier admin
        admin_count = db.query(Collaborator).filter(
            Collaborator.organisation_id == organisation_id,
            Collaborator.role == RoleEnum.ADMIN
        ).count()
        
        if current_collaborator.role == RoleEnum.ADMIN and admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer le dernier admin de l'organisation"
            )
        
        return CollaboratorRepository.delete(db, collaborator_id)

    @staticmethod
    def _generate_invitation_token() -> str:
        """Générer un token d'invitation sécurisé (64 caractères hex)"""
        return secrets.token_hex(32)

    @staticmethod
    async def create_invitation(
        db: Session,
        organisation_id: UUID,
        email: str,
        role: RoleEnum,
        current_user_id: UUID,
        background_tasks: BackgroundTasks,
    ) -> Invitation:
        """
        Créer une invitation pour un nouvel collaborateur
        
        Vérifications :
        - L'organisation appartient au l'utilisateur courant
        - Vérifier le quota de collaborateurs
        - Vérifier la limite d'invitations en attente
        """
        from app.modules.organisations.repository import OrganisationRepository
        
        # 1. Vérifier que l'organisation appartient à l'utilisateur
        organisation = OrganisationRepository.get_by_id(db, organisation_id, current_user_id)
        
        if not organisation:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="L'organisation n'existe pas ou vous n'avez pas les droits"
            )
        
        # 2. Vérifier que l'email ne fait pas déjà partie de l'organisation
        existing_collaborator = db.query(Collaborator).filter(
            Collaborator.organisation_id == organisation_id,
            Collaborator.user_id == (
                db.query(User.id).filter(User.email == email).subquery()
            )
        ).first()
        
        if existing_collaborator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà collaborateur de l'organisation"
            )
        
        # 3. Vérifier le quota de collaborateurs
        collaborators_count = db.query(Collaborator).filter(
            Collaborator.organisation_id == organisation_id
        ).count()
        
        if collaborators_count >= CollaboratorService.COLLABORATORS_QUOTA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Quota de collaborateurs atteint ({CollaboratorService.COLLABORATORS_QUOTA})"
            )
        
        # 4. Vérifier qu'il n'y a pas déjà une invitation en attente pour cet email
        pending_invitation = db.query(Invitation).filter(
            Invitation.organisation_id == organisation_id,
            Invitation.email == email,
            Invitation.status == InvitationStatusEnum.PENDING
        ).first()
        
        if pending_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Une invitation est déjà en attente pour cet email"
            )
        
        # 5. Générer le token et créer l'invitation
        token = CollaboratorService._generate_invitation_token()
        expires_at = datetime.utcnow() + timedelta(minutes=CollaboratorService.INVITATION_EXPIRY_MINUTES)
        
        invitation_data = {
            "organisation_id": organisation_id,
            "email": email,
            "role": role,
            "token": token,
            "expires_at": expires_at,
            "status": InvitationStatusEnum.PENDING,
        }
        
        invitation = InvitationRepository.create(db, invitation_data)
        
        # 6. Envoyer l'email en arrière-plan
        invitation_link = f"{settings.FRONTEND_URL}/invite?token={token}"
        background_tasks.add_task(
            CollaboratorService._send_invitation_email,
            email=email,
            invitation_link=invitation_link,
            inviter_email=current_user_id,
            organisation_id=organisation_id,
        )
        
        return invitation

    @staticmethod
    def _send_invitation_email(
        email: str,
        invitation_link: str,
        inviter_email: str,
        organisation_id: UUID,
    ):
        """
        Envoyer l'email d'invitation via FastAPI-Mail
        Appelée en BackgroundTask - utilise le pattern synchrone
        
        Args:
            email: Email du destinataire
            invitation_link: Lien d'acceptation d'invitation
            inviter_email: Email de l'inviteur
            organisation_id: UUID de l'organisation
        """
        try:
            import asyncio
            
            # Créer et exécuter la coroutine pour l'environnement BackgroundTask
            async def send_async():
                template_body = {
                    "email": email,
                    "invitation_link": invitation_link,
                    "inviter_email": inviter_email,
                    "organisation_id": str(organisation_id),
                    "expiry_minutes": CollaboratorService.INVITATION_EXPIRY_MINUTES,
                }
                
                message = MessageSchema(
                    subject="Invitation à collaborer sur FeoSync",
                    recipients=[email],
                    template_body=template_body,
                    subtype=MessageType.html,
                )
                
                await fastmail.send_message(message, template_name="invitation.html")
            
            # Exécuter la coroutine dans le contexte actuel
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(send_async())
            
            logger.info(f"✅ Email d'invitation envoyé à {email} (org: {organisation_id})")
            
        except Exception as e:
            # Log l'erreur mais ne la propage pas (l'API a déjà répondu)
            logger.error(
                "❌ Échec envoi email d'invitation",
                extra={
                    "email": email,
                    "organisation_id": str(organisation_id),
                    "error_type": type(e).__name__,
                    "error_msg": str(e),
                },
                exc_info=True
            )

    @staticmethod
    def accept_invitation(
        db: Session,
        token: str,
        name: str | None = None,
    ) -> tuple[User, str]:  # (user, jwt_token)
        """
        Accepter une invitation et créer le collaborateur
        
        Double vérification de sécurité :
        1. Token existe et status = 'pending'
        2. Vérifier que datetime.utcnow() < expires_at (10 min)
        
        Si expiré → status='expired', retourner erreur 410
        Sinon :
        - Consommer le token (status = 'used')
        - Créer utilisateur si inexistant
        - Ajouter dans collaborators
        - Retourner JWT pour connexion automatique
        """
        
        # 1. Chercher l'invitation par token
        invitation = InvitationRepository.get_by_token(db, token)
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation introuvable"
            )
        
        # 2. Vérifier que l'invitation est en statut 'pending'
        if invitation.status != InvitationStatusEnum.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cette invitation n'est plus valide (statut: {invitation.status})"
            )
        
        # 3. Vérifier l'expiration (10 minutes)
        now = datetime.utcnow()
        if now >= invitation.expires_at:
            # Marquer l'invitation comme expirée
            InvitationRepository.update_status(
                db, invitation.id, InvitationStatusEnum.EXPIRED
            )
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Cette invitation a expiré"
            )
        
        # 4. Chercher ou créer l'utilisateur
        user = UserRepository.get_by_email(db, invitation.email)
        
        if not user:
            # Créer un nouvel utilisateur (sans password, utilise OAuth)
            # Le `name` peut être fourni lors de l'acceptation, sinon utiliser email comme default
            user_data = {
                "name": name or invitation.email,
                "email": invitation.email,
                "is_active": True,
            }
            
            user = UserRepository.create(db, user_data)
        
        # 5. Vérifier que l'utilisateur n'est pas déjà collaborateur
        existing_collaborator = CollaboratorRepository.get_by_organisation_and_user(
            db, invitation.organisation_id, user.id
        )
        
        if existing_collaborator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous êtes déjà collaborateur de cette organisation"
            )
        
        # 6. Créer le collaborateur
        collaborator_data = {
            "organisation_id": invitation.organisation_id,
            "user_id": user.id,
            "role": invitation.role,
            "invited_by": None,  # Optionnel : extraire de l'app context
        }
        
        CollaboratorRepository.create(db, collaborator_data)
        
        # 7. Consommer le token (status = 'used')
        InvitationRepository.update_status(
            db, invitation.id, InvitationStatusEnum.USED
        )
        
        # 8. Générer un JWT pour connexion automatique
        access_token = AuthService.create_access_token(user_id=str(user.id), email=user.email)
        
        return user, access_token
