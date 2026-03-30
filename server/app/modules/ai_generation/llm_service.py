from __future__ import annotations
from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
import base64
import logging

from fastapi import HTTPException
from app.core.config import settings
from app.modules.ai_generation.models.ai_generation_model import (
    AiGeneration, AiProvider, AiGenerationType
)
from app.modules.ai_generation.repository import AiGenerationRepository, AiQuotaRepository
from app.modules.ai_generation.schemas import AiContext, CaptionRequest, ImageRequest

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    @abstractmethod
    async def generate_caption(self, prompt: str) -> tuple[str, int]:
        ...

    @abstractmethod
    async def generate_image(self, prompt: str) -> bytes:
        ...


class GeminiProvider(LLMProvider):
    TEXT_MODEL  = "gemini-3-flash-preview"
    IMAGE_MODEL = "gemini-3.1-flash-image-preview"

    def __init__(self):
        from google import genai
        from google.genai import types
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.types = types

    async def generate_caption(self, prompt: str) -> tuple[str, int]:
        response = await self.client.aio.models.generate_content(
            model=self.TEXT_MODEL,
            contents=prompt,
        )
        tokens = response.usage_metadata.total_token_count if response.usage_metadata else 0
        return response.text.strip(), tokens
    
    async def generate_response(self, prompt: str) -> str:
        response = await self.client.aio.models.generate_content(
            model=self.TEXT_MODEL,
            contents=prompt,
        )
        return response.text.strip()
    
    async def generate_image(self, prompt: str) -> bytes:
        response = await self.client.aio.models.generate_content(
            model=self.IMAGE_MODEL,
            contents=[prompt],
            config=self.types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )
        for part in response.parts:
            if part.inline_data is not None:
                return part.inline_data.data
        raise ValueError("Aucune image retournée par Gemini")


PROVIDERS: dict[str, type[LLMProvider]] = {
    AiProvider.GEMINI: GeminiProvider,
}


class AiGenerationService:

    def __init__(self, provider: str = AiProvider.GEMINI):
        cls = PROVIDERS.get(provider)
        if not cls:
            raise ValueError(f"Provider '{provider}' non supporté")
        self.provider = cls()
        self.provider_name = provider

    def _check_quota(self, quota, generation_type: str) -> None:
        caption_limit = getattr(settings, "AI_CAPTION_LIMIT_PER_MONTH", None)
        image_limit = getattr(settings, "AI_IMAGE_LIMIT_PER_MONTH", None)
        if generation_type == AiGenerationType.CAPTION and caption_limit:
            if quota.caption_count >= caption_limit:
                raise HTTPException(
                    status_code=429,   # ← Too Many Requests
                    detail={
                        "error": "quota_exceeded",
                        "type": "caption",
                        "used": quota.caption_count,
                        "limit": caption_limit,
                        "resets_at": f"{quota.period}-01",
                    }
                )
        if generation_type == AiGenerationType.IMAGE and image_limit:
            if quota.image_count >= image_limit:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "quota_exceeded",
                        "type": "image",
                        "used": quota.image_count,
                        "limit": image_limit,
                        "resets_at": f"{quota.period}-01",
                    }
                )

    def _build_caption_prompt(self, ctx: AiContext, req: CaptionRequest) -> str:
        return f"""
            Tu es expert social media pour {ctx.organisation_name}.
            Secteur : {ctx.organisation_sector} | Ton : {ctx.organisation_tone}
            {f"Page Facebook : {ctx.facebook_page_name}" if ctx.facebook_page_name else ""}

            Rédige un caption {ctx.organisation_tone} pour Facebook.
            Sujet : {req.topic} | Langue : {req.language} | Max : {req.max_length} caractères
            {f"Instructions : {req.additional_instructions}" if req.additional_instructions else ""}

            Réponds uniquement avec le caption, sans guillemets ni commentaires.
            """.strip()

    def _build_image_prompt(self, ctx: AiContext, req: ImageRequest) -> str:
        return f"""
            Professional social media image for {ctx.organisation_name}.
            Sector: {ctx.organisation_sector} | Style: {req.style}
            Description: {req.description}
            """.strip()

    async def generate_caption(
        self, db: Session, ctx: AiContext, req: CaptionRequest
    ) -> AiGeneration:
        quota = AiQuotaRepository.get_or_create(db, ctx.user_id, ctx.organisation_id)
        self._check_quota(quota, AiGenerationType.CAPTION)

        prompt = self._build_caption_prompt(ctx, req)
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

    async def generate_image(
        self, db: Session, ctx: AiContext, req: ImageRequest
    ) -> AiGeneration:
        quota = AiQuotaRepository.get_or_create(db, ctx.user_id, ctx.organisation_id)
        self._check_quota(quota, AiGenerationType.IMAGE)

        prompt = self._build_image_prompt(ctx, req)
        image_bytes = await self.provider.generate_image(prompt)
        image_url = _bytes_to_storage(image_bytes, ctx.organisation_id)

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


def _bytes_to_storage(image_bytes: bytes, org_id) -> str:
    """
    Dev  → base64 data URL
    Prod → uploader vers Cloudinary/S3 et retourner l'URL
    """
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64}"
    # Prod :
    # import cloudinary.uploader
    # result = cloudinary.uploader.upload(image_bytes, folder=f"feosync/{org_id}")
    # return result["secure_url"]