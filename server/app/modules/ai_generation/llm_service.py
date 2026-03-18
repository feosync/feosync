from __future__ import annotations
from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from app.core.config import settings
from app.modules.ai_generation.models.ai_generation_model import (
    AiGeneration, AiProvider, AiGenerationType
)
from app.modules.ai_generation.repository import AiGenerationRepository, AiQuotaRepository
from app.modules.ai_generation.schemas import AiContext, CaptionRequest, ImageRequest

logger = logging.getLogger(__name__)


# ── Interface Provider ────────────────────────────────────────────────────────

class LLMProvider(ABC):
    @abstractmethod
    async def generate_caption(self, prompt: str) -> tuple[str, int]:
        """Retourne (caption, tokens_used)"""
        ...

    @abstractmethod
    async def generate_image(self, prompt: str) -> str:
        """Retourne image_url"""
        ...


# ── Gemini Provider ───────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    TEXT_MODEL  = "gemini-1.5-flash"
    IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"

    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._genai = genai
        self.model = genai.GenerativeModel(self.TEXT_MODEL)

    async def generate_caption(self, prompt: str) -> tuple[str, int]:
        response = self.model.generate_content(prompt)
        tokens = (
            response.usage_metadata.total_token_count
            if hasattr(response, "usage_metadata") else 0
        )
        return response.text.strip(), tokens

    async def generate_image(self, prompt: str) -> str:
        model = self._genai.ImageGenerationModel(self.IMAGE_MODEL)
        result = model.generate_images(prompt=prompt, number_of_images=1)
        return result.images[0].uri  # à adapter selon SDK version


# ── Registry ──────────────────────────────────────────────────────────────────

PROVIDERS: dict[str, type[LLMProvider]] = {
    AiProvider.GEMINI: GeminiProvider,
}


# ── Service Central ───────────────────────────────────────────────────────────

class AiGenerationService:

    def __init__(self, provider: str = AiProvider.GEMINI):
        cls = PROVIDERS.get(provider)
        if not cls:
            raise ValueError(f"Provider '{provider}' not supported")
        self.provider = cls()
        self.provider_name = provider

    # ── Prompt Builders ───────────────────────────────────────────────────────

    def _caption_prompt(self, ctx: AiContext, req: CaptionRequest) -> str:
        return f"""
Tu es expert social media pour {ctx.organisation_name}.
Secteur : {ctx.organisation_sector} | Ton : {ctx.organisation_tone}
{f"Page : {ctx.facebook_page_name}" if ctx.facebook_page_name else ""}

Rédige un caption {ctx.organisation_tone} pour Facebook.
Sujet : {req.topic} | Langue : {req.language} | Max : {req.max_length} caractères
{f"Instructions : {req.additional_instructions}" if req.additional_instructions else ""}

Réponds uniquement avec le caption, sans guillemets ni commentaires.
""".strip()

    def _image_prompt(self, ctx: AiContext, req: ImageRequest) -> str:
        return f"""
Professional social media image for {ctx.organisation_name}.
Sector: {ctx.organisation_sector} | Style: {req.style}
Description: {req.description}
""".strip()

    # ── Check Quota ───────────────────────────────────────────────────────────

    def _check_quota(self, quota, generation_type: str) -> None:
        caption_limit = getattr(settings, "AI_CAPTION_LIMIT_PER_MONTH", None)
        image_limit = getattr(settings, "AI_IMAGE_LIMIT_PER_MONTH", None)
        if generation_type == AiGenerationType.CAPTION and caption_limit:
            if quota.caption_count >= caption_limit:
                raise ValueError(f"Quota caption dépassé ({caption_limit}/mois)")
        if generation_type == AiGenerationType.IMAGE and image_limit:
            if quota.image_count >= image_limit:
                raise ValueError(f"Quota image dépassé ({image_limit}/mois)")

    # ── Generate Caption ──────────────────────────────────────────────────────

    async def generate_caption(
        self, db: Session, ctx: AiContext, req: CaptionRequest
    ) -> AiGeneration:
        quota = AiQuotaRepository.get_or_create(db, ctx.user_id, ctx.organisation_id)
        self._check_quota(quota, AiGenerationType.CAPTION)

        prompt = self._caption_prompt(ctx, req)
        caption, tokens = await self.provider.generate_caption(prompt)

        gen = AiGenerationRepository.create(db, {
            "organisation_id": ctx.organisation_id,
            "user_id": ctx.user_id,
            "generation_type": AiGenerationType.CAPTION,
            "provider": self.provider_name,
            "model_used": GeminiProvider.TEXT_MODEL,
            "prompt_used": prompt,
            "input_data": req.model_dump(),
            "output_data": {"content": caption},
            "caption": caption,
            "tokens_used": tokens,
        })
        AiQuotaRepository.increment(db, quota, AiGenerationType.CAPTION, tokens)
        logger.info(f"Caption generated org={ctx.organisation_id} tokens={tokens}")
        return gen

    # ── Generate Image ────────────────────────────────────────────────────────

    async def generate_image(
        self, db: Session, ctx: AiContext, req: ImageRequest
    ) -> AiGeneration:
        quota = AiQuotaRepository.get_or_create(db, ctx.user_id, ctx.organisation_id)
        self._check_quota(quota, AiGenerationType.IMAGE)

        prompt = self._image_prompt(ctx, req)
        image_url = await self.provider.generate_image(prompt)

        gen = AiGenerationRepository.create(db, {
            "organisation_id": ctx.organisation_id,
            "user_id": ctx.user_id,
            "generation_type": AiGenerationType.IMAGE,
            "provider": self.provider_name,
            "model_used": GeminiProvider.IMAGE_MODEL,
            "prompt_used": prompt,
            "input_data": req.model_dump(),
            "output_data": {"image_url": image_url},
            "image_url": image_url,
            "tokens_used": 0,
        })
        AiQuotaRepository.increment(db, quota, AiGenerationType.IMAGE, 0)
        return gen