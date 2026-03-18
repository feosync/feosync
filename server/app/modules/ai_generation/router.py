from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.ai_generation.dependencies import get_ai_context, get_ai_service
from app.modules.ai_generation.schemas import (
    AiContext, CaptionRequest, ImageRequest,
    AiGenerationResponse, AiQuotaResponse,
)
from app.modules.ai_generation.llm_service import AiGenerationService
from app.modules.ai_generation.models.ai_quota_model import AiQuota
from app.modules.ai_generation.repository import AiGenerationRepository

ai_router = APIRouter()


@ai_router.post("/caption", response_model=AiGenerationResponse)
async def generate_caption(
    org_id: UUID,
    request: CaptionRequest,
    db: Session = Depends(get_db),
    ctx: AiContext = Depends(get_ai_context),
    service: AiGenerationService = Depends(get_ai_service),
):
    gen = await service.generate_caption(db=db, ctx=ctx, req=request)
    return AiGenerationResponse.model_validate(gen)


@ai_router.post("/image", response_model=AiGenerationResponse)
async def generate_image(
    org_id: UUID,
    request: ImageRequest,
    db: Session = Depends(get_db),
    ctx: AiContext = Depends(get_ai_context),
    service: AiGenerationService = Depends(get_ai_service),
):
    gen = await service.generate_image(db=db, ctx=ctx, req=request)
    return AiGenerationResponse.model_validate(gen)


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
    period = datetime.now(timezone.utc).strftime("%Y-%m")
    quota = db.query(AiQuota).filter(
        AiQuota.user_id == current_user.id,
        AiQuota.organisation_id == org_id,
        AiQuota.period == period,
    ).first()
    if not quota:
        return AiQuotaResponse(period=period, caption_count=0, image_count=0, total_tokens=0)
    return AiQuotaResponse.model_validate(quota)