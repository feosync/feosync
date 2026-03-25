from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.organisations.model import Organisation
from sqlalchemy import or_
from app.shared.pagination.paginator import PaginationParams


class OrganisationRepository:

    @staticmethod
    def get_all(db: Session, user_id: UUID) -> list[Organisation]:
        return db.query(Organisation).filter(
            Organisation.user_id == user_id
        ).all()
    
    @staticmethod
    def get_all_paginated(
        db: Session,
        user_id: UUID,
        params: PaginationParams,
        search: str | None = None,
    ) -> tuple[list[Organisation], int]:
        
        query = db.query(Organisation).filter(Organisation.user_id == user_id)

        # Recherche optionnelle sur le nom ou la description
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Organisation.name.ilike(term),
                    Organisation.description.ilike(term),
                )
            )

        # Compte total
        total = query.count()

        # Récupération paginée + tri (les plus récentes en premier)
        organisations = (
            query
            .order_by(Organisation.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
            .all()
        )

        return organisations, total

    @staticmethod
    def get_by_id(db: Session, org_id: UUID, user_id: UUID) -> Organisation | None:
        return db.query(Organisation).filter(
            Organisation.id == org_id,
            Organisation.user_id == user_id
        ).first()

    @staticmethod
    def create(db: Session, user_id: UUID, data: dict) -> Organisation:
        org = Organisation(**data, user_id=user_id)
        db.add(org)
        db.commit()
        db.refresh(org)
        return org

    @staticmethod
    def update(db: Session, org: Organisation, data: dict) -> Organisation:
        for key, value in data.items():
            if hasattr(org, key):
                setattr(org, key, value)
        db.commit()
        db.refresh(org)
        
        return org

    @staticmethod
    def delete(db: Session, org: Organisation) -> None:
        db.delete(org)
        db.commit()