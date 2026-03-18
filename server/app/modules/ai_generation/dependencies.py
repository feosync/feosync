from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.dependencies import get_active_user
from app.modules.user.model import User
from app.modules.organisations.model import Organisation
from app.modules.fb_page.model import Facebook
from app.modules.ai_generation.schemas import AiContext
from app.modules.ai_generation.llm_service import AiGenerationService, AiProvider


async def get_ai_context(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_active_user),
    page_id: UUID | None = None,
) -> AiContext:
    org = db.query(Organisation).filter(
        Organisation.id == org_id,
        Organisation.user_id == current_user.id,
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    fb_page_name = fb_page_fb_id = None
    if page_id:
        page = db.query(Facebook).filter(
            Facebook.id == page_id,
            Facebook.organisation_id == org_id,
        ).first()
        if page:
            fb_page_name = page.page_name
            fb_page_fb_id = page.fb_page_id

    return AiContext(
        user_id=current_user.id,
        user_email=current_user.email,
        organisation_id=org.id,
        organisation_name=org.name,
        organisation_sector=org.sector.value if hasattr(org.sector, "value") else str(org.sector),
        organisation_tone=org.tone.value if hasattr(org.tone, "value") else str(org.tone),
        facebook_page_name=fb_page_name,
        facebook_page_id=fb_page_fb_id,
    )


def get_ai_service() -> AiGenerationService:
    return AiGenerationService(provider=AiProvider.GEMINI)