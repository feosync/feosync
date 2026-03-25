from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.organisations.schemas import (
    OrganisationCreate,
    OrganisationUpdate,
    OrganisationResponse,
)
from app.modules.organisations.service import OrganisationService
from app.shared.pagination.paginator import PaginatedResponse, Pagination

organisation_router = APIRouter()


from fastapi import APIRouter, Query, Depends
from uuid import UUID
# ... tes autres imports

@organisation_router.get(
    "/",
    response_model=PaginatedResponse[OrganisationResponse],
    summary="Lister les organisations de l'utilisateur connecté (avec pagination)",
)
async def get_organisations(
    params: Pagination,                                   
    search: str | None = Query(
        None, 
        description="Recherche par nom ou description"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    
    organisations, total = OrganisationService.get_all(
        db, 
        current_user.id, 
        params, 
        search=search
    )

    # Conversion en Pydantic (si OrganisationResponse est un modèle Pydantic)
    items = [OrganisationResponse.model_validate(org) for org in organisations]

    return PaginatedResponse.build(items, total, params)


@organisation_router.get("/{org_id}", response_model=OrganisationResponse)
async def get_organisation(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return OrganisationService.get_by_id(db, org_id, current_user.id)


@organisation_router.post("/", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
async def create_organisation(
    payload: OrganisationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return OrganisationService.create(db, current_user.id, payload)


@organisation_router.patch("/{org_id}", response_model=OrganisationResponse)
async def update_organisation(
    org_id: UUID,
    payload: OrganisationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return OrganisationService.update(db, org_id, current_user.id, payload)


@organisation_router.delete("/{org_id}", status_code=status.HTTP_200_OK)
async def delete_organisation(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return OrganisationService.delete(db, org_id, current_user.id)