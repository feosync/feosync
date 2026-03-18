from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from app.modules.ai_generation.models.ai_generation_model import AiGeneration, AiGenerationType
from app.modules.ai_generation.models.ai_quota_model import AiQuota


class AiGenerationRepository:

    @staticmethod
    def create(db: Session, data: dict) -> AiGeneration:
        gen = AiGeneration(**data)
        db.add(gen)
        db.commit()
        db.refresh(gen)
        return gen

    @staticmethod
    def get_by_id(db: Session, gen_id: UUID) -> AiGeneration | None:
        return db.query(AiGeneration).filter(AiGeneration.id == gen_id).first()

    @staticmethod
    def get_by_org(db: Session, org_id: UUID) -> list[AiGeneration]:
        return (
            db.query(AiGeneration)
            .filter(AiGeneration.organisation_id == org_id)
            .order_by(AiGeneration.created_at.desc())
            .all()
        )


class AiQuotaRepository:

    @staticmethod
    def get_or_create(db: Session, user_id: UUID, org_id: UUID) -> AiQuota:
        period = datetime.now(timezone.utc).strftime("%Y-%m")
        quota = db.query(AiQuota).filter(
            AiQuota.user_id == user_id,
            AiQuota.organisation_id == org_id,
            AiQuota.period == period,
        ).first()
        if not quota:
            quota = AiQuota(user_id=user_id, organisation_id=org_id, period=period)
            db.add(quota)
            db.commit()
            db.refresh(quota)
        return quota

    @staticmethod
    def increment(
        db: Session, quota: AiQuota,
        generation_type: str, tokens: int
    ) -> None:
        if generation_type == AiGenerationType.CAPTION:
            quota.caption_count += 1
        else:
            quota.image_count += 1
        quota.total_tokens += tokens
        db.commit()