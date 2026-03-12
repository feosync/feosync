"""Organization endpoints."""
from fastapi import APIRouter

from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import Organization
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.modules.organizations.schemas import OrganizationResponse, OrganizationUpdate
from src.app.shared.exceptions.http_exceptions import NotFoundError

router = APIRouter(prefix="/organizations", tags=["Organizations"])


async def _get_org_or_404(user, db) -> Organization:
    repo = OrganizationRepository(db)
    org = await repo.get_by_user_id(user.id)
    if not org:
        raise NotFoundError("Organization")
    return org


@router.get("/me", response_model=OrganizationResponse)
async def get_my_organization(current_user: CurrentUser, db: DbSession) -> Organization:
    return await _get_org_or_404(current_user, db)


@router.patch("/me", response_model=OrganizationResponse)
async def update_my_organization(
    payload: OrganizationUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> Organization:
    org = await _get_org_or_404(current_user, db)
    repo = OrganizationRepository(db)
    return await repo.update(org, payload.model_dump(exclude_none=True))
