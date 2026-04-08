from uuid import UUID

from fastapi import APIRouter, Depends, status, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.collaborators.model import RoleEnum
from app.modules.collaborators.service import CollaboratorService
from app.modules.collaborators.repository import (
    CollaboratorRepository,
    InvitationRepository,
)
from app.modules.collaborators.schemas import (
    InvitationCreate,
    InvitationResponse,
    InvitationAcceptPayload,
    InvitationAcceptResponse,
    CollaboratorResponse,
    CollaboratorListResponse,
)
from app.shared.pagination.paginator import PaginationParams

router = APIRouter()


# ========== ENDPOINTS INVITATIONS ==========

@router.post(
    "/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["invitations"],
    summary="Créer une invitation pour un collaborateur"
)
async def create_invitation(
    organisation_id: UUID = Query(..., description="ID de l'organisation"),
    payload: InvitationCreate = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Créer une invitation pour un collaborateur.
    
    Vérifications :
    - Seul owner/admin peut inviter
    - Vérifier le quota de collaborateurs
    - Générer un token sécurisé (64 car hex)
    - Expiration : 10 minutes
    - Envoyer un email avec le lien d'invitation
    
    Le token est envoyé à : `{FRONTEND_URL}/invite?token={token}`
    """
    invitation = await CollaboratorService.create_invitation(
        db=db,
        organisation_id=organisation_id,
        email=payload.email,
        role=payload.role,
        current_user_id=current_user.id,
        background_tasks=background_tasks,
    )
    return invitation


@router.get(
    "/invitations/accept",
    response_model=InvitationAcceptResponse,
    status_code=status.HTTP_200_OK,
    tags=["invitations"],
    summary="Accepter une invitation sans authentification préalable"
)
async def accept_invitation(
    token: str = Query(..., description="Token d'invitation"),
    name: str | None = Query(None, description="Nom complet pour nouvel utilisateur"),
    db: Session = Depends(get_db),
):
    """
    Accepter une invitation via le token.
    
    Double vérification de sécurité :
    1. Token existe + status = 'pending'
    2. Vérifier que maintenant < expires_at (10 min)
    
    Si expiré → erreur 410 Gone
    Sinon :
    - Consommer le token (status = 'used')
    - Créer l'utilisateur s'il n'existe pas
    - Ajouter dans collaborators
    - Retourner un JWT pour connexion automatique
    """
    user, access_token = CollaboratorService.accept_invitation(
        db=db,
        token=token,
        name=name,
    )
    
    return InvitationAcceptResponse(
        message="Invitation acceptée avec succès",
        access_token=access_token,
        user_id=user.id,
    )


# ========== ENDPOINTS COLLABORATEURS ==========

@router.get(
    "/collaborators",
    response_model=CollaboratorListResponse,
    tags=["collaborators"],
    summary="Lister les collaborateurs d'une organisation"
)
async def get_collaborators(
    organisation_id: UUID = Query(..., description="ID de l'organisation"),
    pagination: PaginationParams = Depends(PaginationParams),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Récupérer la liste des collaborateurs d'une organisation avec pagination.
    
    Accessibilité :
    - Tous les collaborateurs de l'organisation peuvent voir la liste
    - Vérification via organisation_id
    """
    collaborators, total = CollaboratorService.get_all_collaborators(
        db=db,
        organisation_id=organisation_id,
        skip=pagination.offset,
        limit=pagination.page_size,
    )
    
    # Charger les informations utilisateur
    collaborator_responses = []
    for collaborator in collaborators:
        from sqlalchemy.orm import joinedload
        # Recharger avec relationships si nécessaire
        db.refresh(collaborator, ["user"])
        
        collaborator_responses.append(
            CollaboratorResponse.model_validate(collaborator)
        )
    
    total_pages = (total + pagination.page_size - 1) // pagination.page_size
    
    return CollaboratorListResponse(
        items=collaborator_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=total_pages,
    )


@router.delete(
    "/collaborators/{collaborator_id}",
    status_code=status.HTTP_200_OK,
    tags=["collaborators"],
    summary="Retirer un collaborateur de l'organisation"
)
async def delete_collaborator(
    organisation_id: UUID = Query(..., description="ID de l'organisation"),
    collaborator_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    """
    Retirer un collaborateur de l'organisation.
    
    Restrictions :
    - Seul owner/admin peut retirer un collaborateur
    - Impossible de retirer le dernier admin de l'organisation
    """
    success = CollaboratorService.remove_collaborator(
        db=db,
        organisation_id=organisation_id,
        collaborator_id=collaborator_id,
        current_user_id=current_user.id,
    )
    
    if success:
        return {"detail": "Collaborateur supprimé avec succès"}
    
    return {"detail": "Collaborateur non trouvé"}
