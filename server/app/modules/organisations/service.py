from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.organisations.repository import OrganisationRepository
from app.modules.organisations.schemas import OrganisationCreate, OrganisationUpdate
from app.modules.organisations.model import Organisation


class OrganisationService:

    @staticmethod
    def get_all(db: Session, user_id: UUID) -> list[Organisation]:
        return OrganisationRepository.get_all(db, user_id)

    @staticmethod
    def get_by_id(db: Session, org_id: UUID, user_id: UUID) -> Organisation:
        org = OrganisationRepository.get_by_id(db, org_id, user_id)
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organisation not found"
            )
        return org

    @staticmethod
    def create(db: Session, user_id: UUID, payload: OrganisationCreate) -> Organisation:
        return OrganisationRepository.create(
            db, user_id, payload.model_dump()
        )

    @staticmethod
    def update(
        db: Session, org_id: UUID, user_id: UUID, payload: OrganisationUpdate
    ) -> Organisation:
        org = OrganisationService.get_by_id(db, org_id, user_id)
        return OrganisationRepository.update(
            db, org, payload.model_dump(exclude_unset=True)
        )

    @staticmethod
    def delete(db: Session, org_id: UUID, user_id: UUID) -> dict:
        org = OrganisationService.get_by_id(db, org_id, user_id)
        OrganisationRepository.delete(db, org)
        return {"detail": "Organisation deleted successfully"}