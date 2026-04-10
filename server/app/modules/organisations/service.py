from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.organisations.repository import OrganisationRepository
from app.modules.organisations.schemas import OrganisationCreate, OrganisationUpdate
from app.modules.organisations.model import Organisation
from app.shared.pagination.paginator import PaginationParams
from app.modules.user.model import User


class OrganisationService:
    
    @staticmethod
    def get_all(
        db: Session,
        user_id: UUID,
        params: PaginationParams,
        search: str | None = None,
    ) -> tuple[list[Organisation], int]:
        
        return OrganisationRepository.get_all_paginated(
            db, user_id, params, search=search
        )

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
    def create(db: Session, user: User, payload: OrganisationCreate) -> Organisation:
        from app.modules.plans.model import Plan
        plan = db.get(Plan, user.plan_id) if user.plan_id else None

        max_org = plan.max_org if plan else 1

        if max_org != -1:
            current_count = OrganisationRepository.count_by_user(db, user.id)
            if current_count >= max_org:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Votre plan vous limite à {max_org} organisation(s). Passez à un plan supérieur."
                )

        return OrganisationRepository.create(db, user.id, payload.model_dump())

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