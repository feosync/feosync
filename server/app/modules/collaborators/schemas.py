from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.modules.collaborators.model import RoleEnum


# ========== Invitation Schemas ==========

class InvitationCreate(BaseModel):
    """Payload pour créer une invitation"""
    email: EmailStr = Field(..., description="Email du collaborateur à inviter")
    role: RoleEnum = Field(default=RoleEnum.VIEWER, description="Rôle du collaborateur")


class InvitationResponse(BaseModel):
    """Réponse d'une invitation"""
    id: UUID
    organisation_id: UUID
    email: str
    role: RoleEnum
    status: str
    created_at: datetime
    expires_at: datetime
    token: str | None = None

    model_config = {"from_attributes": True}


class InvitationAcceptPayload(BaseModel):
    """Payload pour accepter une invitation"""
    token: str = Field(..., description="Token d'invitation")
    password: str | None = Field(None, description="Mot de passe si nouvel utilisateur")
    first_name: str | None = Field(None, description="Prénom si nouvel utilisateur")
    last_name: str | None = Field(None, description="Nom si nouvel utilisateur")


class InvitationAcceptResponse(BaseModel):
    """Réponse après acceptation d'invitation"""
    message: str
    access_token: str = Field(..., description="JWT token pour connexion automatique")
    user_id: UUID


# ========== Collaborator Schemas ==========

class CollaboratorBase(BaseModel):
    """Base pour les collaborateurs"""
    role: RoleEnum = Field(default=RoleEnum.VIEWER, description="Rôle du collaborateur")


class UserCollaboratorSummary(BaseModel):
    """Résumé utilisateur pour réponse collaborateur"""
    id: UUID
    email: str
    name: str | None = None

    model_config = {"from_attributes": True}


class CollaboratorCreate(CollaboratorBase):
    """Payload pour créer un collaborateur (usage interne)"""
    user_id: UUID
    invited_by: UUID | None = None


class CollaboratorResponse(CollaboratorBase):
    """Réponse pour un collaborateur"""
    id: UUID
    organisation_id: UUID
    user_id: UUID
    invited_by: UUID | None = None
    created_at: datetime
    updated_at: datetime
    
    # Informations utilisateur complètes
    user: UserCollaboratorSummary | None = None

    model_config = {"from_attributes": True}


class CollaboratorListResponse(BaseModel):
    """Réponse pour la liste des collaborateurs"""
    items: list[CollaboratorResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
