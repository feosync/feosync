from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.post_template.model import PostTemplate
from app.modules.organisations.model import SectorEnum


class PostTemplateRepository:

    @staticmethod
    def get_app_templates(db: Session, sector: SectorEnum | None = None) -> list[PostTemplate]:
        """Templates fournis par l'app — disponibles pour tous"""
        q = db.query(PostTemplate).filter(PostTemplate.is_app_template == True)
        if sector:
            q = q.filter(PostTemplate.sector == sector)
        return q.order_by(PostTemplate.usage_count.desc()).all()

    @staticmethod
    def get_org_templates(db: Session, org_id: UUID, sector: SectorEnum | None = None) -> list[PostTemplate]:
        """Templates créés par une organisation"""
        q = db.query(PostTemplate).filter(
            PostTemplate.organisation_id == org_id,
            PostTemplate.is_app_template == False
        )
        if sector:
            q = q.filter(PostTemplate.sector == sector)
        return q.order_by(PostTemplate.created_at.desc()).all()

    @staticmethod
    def get_all_available(db: Session, org_id: UUID, sector: SectorEnum | None = None) -> list[PostTemplate]:
        """App templates + templates de l'organisation"""
        q = db.query(PostTemplate).filter(
            (PostTemplate.is_app_template == True) |
            (PostTemplate.organisation_id == org_id)
        )
        if sector:
            q = q.filter(PostTemplate.sector == sector)
        return q.order_by(PostTemplate.usage_count.desc()).all()

    @staticmethod
    def get_by_id(db: Session, template_id: UUID) -> PostTemplate | None:
        return db.query(PostTemplate).filter(PostTemplate.id == template_id).first()

    @staticmethod
    def create(db: Session, data: dict) -> PostTemplate:
        template = PostTemplate(**data)
        db.add(template)
        db.commit()
        db.refresh(template)
        return template

    @staticmethod
    def update(db: Session, template: PostTemplate, data: dict) -> PostTemplate:
        for key, value in data.items():
            if hasattr(template, key) and value is not None:
                setattr(template, key, value)
        db.commit()
        db.refresh(template)
        return template

    @staticmethod
    def increment_usage(db: Session, template_id: UUID) -> None:
        template = PostTemplateRepository.get_by_id(db, template_id)
        if template:
            template.usage_count += 1
            db.commit()

    @staticmethod
    def delete(db: Session, template: PostTemplate) -> None:
        db.delete(template)
        db.commit()