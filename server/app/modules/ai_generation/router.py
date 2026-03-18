from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.ai_generation.schemas import (
    AiGenerationResponse, AiQuotaResponse,
)
from app.modules.ai_generation.llm_service import AiGenerationService
from app.modules.ai_generation.repository import AiGenerationRepository, AiQuotaRepository

ai_router = APIRouter()



@ai_router.get("/history/{org_id}", response_model=list[AiGenerationResponse])
async def get_history(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    return AiGenerationRepository.get_by_org(db, org_id)


@ai_router.get("/quota", response_model=AiQuotaResponse)
async def get_quota(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
):
    from app.core.config import settings
    from datetime import datetime, timezone

    quota = AiQuotaRepository.get_current(db, current_user.id, org_id)

    caption_count = quota.caption_count if quota else 0
    image_count = quota.image_count if quota else 0

    return AiQuotaResponse(
        period=datetime.now(timezone.utc).strftime("%Y-%m"),
        caption_count=caption_count,
        image_count=image_count,
        total_tokens=quota.total_tokens if quota else 0,
        caption_limit=settings.AI_CAPTION_LIMIT_PER_MONTH,
        image_limit=settings.AI_IMAGE_LIMIT_PER_MONTH,
        caption_remaining=max(0, settings.AI_CAPTION_LIMIT_PER_MONTH - caption_count),
        image_remaining=max(0, settings.AI_IMAGE_LIMIT_PER_MONTH - image_count),
    )