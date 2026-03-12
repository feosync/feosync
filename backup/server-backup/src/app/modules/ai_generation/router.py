"""AI Generation – caption & image generation via Google Gemini."""
from __future__ import annotations

import uuid
from typing import Any

import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.config.settings import settings
from src.app.core.logging.logger import get_logger
from src.app.database.session import DbSession
from src.app.modules.auth.dependencies import CurrentUser
from src.app.modules.models import AIGeneration
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import NotFoundError, ServiceUnavailableError

logger = get_logger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Generation"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateCaptionsRequest(BaseModel):
    topic: str
    tone: str = "casual"
    language: str = "fr"
    sector: str | None = None
    num_variants: int = 3
    extra_context: str | None = None


class GenerateCaptionsResponse(BaseModel):
    id: uuid.UUID
    caption_variants: list[str]
    tokens_used: int
    cost_usd: float | None

    model_config = {"from_attributes": True}


class GenerateImageRequest(BaseModel):
    prompt: str
    style: str = "professional"
    width: int = 1080
    height: int = 1080


# ── Service ───────────────────────────────────────────────────────────────────

class AIGenerationService:
    # Gemini pricing (as of 2025): $0.075 / 1M input tokens, $0.30 / 1M output tokens
    INPUT_COST_PER_TOKEN = 0.075 / 1_000_000
    OUTPUT_COST_PER_TOKEN = 0.30 / 1_000_000

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.org_repo = OrganizationRepository(db)
        genai.configure(api_key=settings.GEMINI_API_KEY)

    async def generate_captions(
        self, user, payload: GenerateCaptionsRequest
    ) -> AIGeneration:
        org = await self.org_repo.get_by_user_id(user.id)
        if not org:
            raise NotFoundError("Organization")

        from src.app.modules.plans.service import PlanService
        await PlanService(self.db).check_ai_gen_limit(user, org)

        prompt = self._build_caption_prompt(payload, org)
        logger.info("ai_gen_start", org_id=str(org.id), topic=payload.topic)

        try:
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            raw_text = response.text
        except Exception as exc:
            logger.error("gemini_error", error=str(exc))
            raise ServiceUnavailableError("AI service temporarily unavailable")

        captions = self._parse_variants(raw_text, payload.num_variants)

        # Estimate cost (Gemini doesn't always return exact token counts via SDK)
        tokens = getattr(response, "usage_metadata", None)
        total_tokens = 0
        cost = None
        if tokens:
            total_tokens = (tokens.prompt_token_count or 0) + (tokens.candidates_token_count or 0)
            cost = (
                (tokens.prompt_token_count or 0) * self.INPUT_COST_PER_TOKEN
                + (tokens.candidates_token_count or 0) * self.OUTPUT_COST_PER_TOKEN
            )

        gen_record = AIGeneration(
            org_id=org.id,
            content_input=payload.model_dump(),
            prompt_used=prompt,
            model=settings.GEMINI_MODEL,
            caption_variants=captions,
            tokens_used=total_tokens,
            cost_usd=cost,
        )
        self.db.add(gen_record)
        await self.db.flush()
        logger.info("ai_gen_done", gen_id=str(gen_record.id), variants=len(captions))
        return gen_record

    @staticmethod
    def _build_caption_prompt(payload: GenerateCaptionsRequest, org: Any) -> str:
        org_ctx = ""
        if org.editorial_profile:
            org_ctx = f"\nOrganisation context: {org.editorial_profile}"
        if org.sector:
            org_ctx += f"\nSector: {org.sector.value}"

        return f"""You are a professional social media copywriter.{org_ctx}

Generate exactly {payload.num_variants} distinct Facebook post captions about:
Topic: {payload.topic}
Tone: {payload.tone}
Language: {payload.language}
{f"Sector: {payload.sector}" if payload.sector else ""}
{f"Additional context: {payload.extra_context}" if payload.extra_context else ""}

Rules:
- Each caption must be on its own line, starting with "---"
- Each caption should be 2-4 sentences max
- Include relevant emojis
- Include 3-5 relevant hashtags at the end
- Vary the hooks between captions

Output format:
--- [caption 1]
--- [caption 2]
--- [caption 3]"""

    @staticmethod
    def _parse_variants(raw: str, num: int) -> list[str]:
        lines = [
            line.strip().lstrip("- ").strip()
            for line in raw.strip().split("---")
            if line.strip() and not line.strip().startswith("You are")
        ]
        variants = [l for l in lines if len(l) > 10]
        return variants[:num] if variants else [raw]


# ── Router ────────────────────────────────────────────────────────────────────

@router.post("/captions", response_model=GenerateCaptionsResponse, status_code=201)
async def generate_captions(
    payload: GenerateCaptionsRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> AIGeneration:
    return await AIGenerationService(db).generate_captions(current_user, payload)
