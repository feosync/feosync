from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.modules.fb_page.model import Facebook, PageInsights


class FacebookPageRepository:

    @staticmethod
    def get_all_by_org(db: Session, org_id: UUID) -> list[Facebook]:
        return (
            db.query(Facebook)
            .filter(Facebook.organisation_id == org_id)
            .order_by(Facebook.created_at.desc())
            .all()
        )
        
    @staticmethod
    def get_all(db:Session)->list[Facebook]:
        return db.query(Facebook).all()
    

    @staticmethod
    def get_by_id_and_org(db: Session, page_id: UUID, org_id: UUID) -> Facebook | None:
        return db.query(Facebook).filter(
            Facebook.id == page_id,
            Facebook.organisation_id == org_id
        ).first()

    @staticmethod
    def get_by_fb_page_id(db: Session, fb_page_id: str) -> Facebook | None:
        return db.query(Facebook).filter(
            Facebook.fb_page_id == fb_page_id
        ).first()
    
    @staticmethod
    def create(db: Session, data: dict) -> Facebook:
        page = Facebook(**data)
        db.add(page)
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def update(db: Session, page: Facebook, data: dict) -> Facebook:
        for key, value in data.items():
            if hasattr(page, key):
                setattr(page, key, value)
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def delete(db: Session, page: Facebook) -> None:
        db.delete(page)
        db.commit()


class PageInsightsRepository:

    @staticmethod
    def get_by_page(db: Session, fb_page_id: UUID) -> list[PageInsights]:
        return (
            db.query(PageInsights)
            .filter(PageInsights.fb_page_id == fb_page_id)
            .order_by(PageInsights.date.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, data: dict) -> PageInsights:
        insight = PageInsights(**data)
        db.add(insight)
        db.commit()
        db.refresh(insight)
        return insight