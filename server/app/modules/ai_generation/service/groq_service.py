from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import AsyncIterator

from groq import AsyncGroq
from groq.types.chat import ChatCompletionMessageParam

from app.core.config import settings

logger = logging.getLogger(__name__)


# ── Configuration ──────────────────────────────────────────────────────────────

@dataclass
class GroqConfig:
    """Paramètres d'une requête Groq, tous avec valeurs par défaut."""
    models: list[str] = field(default_factory=lambda: [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
    ])
    temperature: float = 0.7
    max_tokens: int = 800
    system_prompt: str = "Tu es un assistant technique utile et concis."
    stream: bool = False


# ── Résultat typé ──────────────────────────────────────────────────────────────

@dataclass
class GroqResult:
    content: str
    model_used: str
    attempts: int


# ── Service ────────────────────────────────────────────────────────────────────

class GroqService:
    """
    Wrapper réutilisable autour de l'API Groq.

    Utilisation basique
    -------------------
    service = GroqService()
    result  = await service.complete("Explique les transformers en 3 lignes.")

    Avec config personnalisée
    -------------------------
    cfg    = GroqConfig(temperature=0.2, max_tokens=200)
    result = await service.complete("Résume ce texte.", config=cfg)
    result = await service.complete("Résume ce texte.", system="Tu es un résumeur.")

    Streaming
    ---------
    async for chunk in service.stream("Écris une histoire courte."):
        print(chunk, end="", flush=True)
    """

    def __init__(
        self,
        api_key: str | None = None,
        default_config: GroqConfig | None = None,
    ) -> None:
        self._client = AsyncGroq(api_key=api_key or settings.GROQ_API_KEY)
        self._default_config = default_config or GroqConfig()

    # ── API publique ───────────────────────────────────────────────────────────

    async def complete(
        self,
        prompt: str,
        *,
        config: GroqConfig | None = None,
        system: str | None = None,
        history: list[ChatCompletionMessageParam] | None = None,
    ) -> GroqResult:
        """
        Génère une réponse complète avec fallback automatique sur les modèles.

        Args:
            prompt:  Message utilisateur.
            config:  Surcharge la config par défaut du service.
            system:  Surcharge le system prompt de la config.
            history: Messages précédents pour les conversations multi-tours.

        Returns:
            GroqResult avec le contenu, le modèle utilisé et le nombre de tentatives.

        Raises:
            RuntimeError: Si tous les modèles échouent.
        """
        cfg = config or self._default_config
        messages = self._build_messages(prompt, system or cfg.system_prompt, history)

        for attempt, model in enumerate(cfg.models, start=1):
            try:
                logger.debug("Tentative %d/%d avec %s", attempt, len(cfg.models), model)

                response = await self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=cfg.temperature,
                    max_tokens=cfg.max_tokens,
                )
                content = response.choices[0].message.content or ""
                return GroqResult(content=content, model_used=model, attempts=attempt)

            except Exception as exc:
                logger.warning("Échec avec %s : %s", model, exc)
                if attempt == len(cfg.models):
                    raise RuntimeError(
                        f"Tous les modèles Groq ont échoué ({cfg.models})"
                    ) from exc

        raise RuntimeError("Aucun modèle disponible.")  # unreachable, rassure mypy

    async def stream(
        self,
        prompt: str,
        *,
        config: GroqConfig | None = None,
        system: str | None = None,
        history: list[ChatCompletionMessageParam] | None = None,
    ) -> AsyncIterator[str]:
        """
        Génère une réponse en streaming, chunk par chunk.

        Usage:
            async for chunk in service.stream("Raconte-moi une histoire"):
                print(chunk, end="", flush=True)
        """
        cfg = config or self._default_config
        messages = self._build_messages(prompt, system or cfg.system_prompt, history)
        last_exc: Exception | None = None

        for attempt, model in enumerate(cfg.models, start=1):
            try:
                logger.debug("Stream — tentative %d avec %s", attempt, model)
                async with self._client.chat.completions.stream(
                    model=model,
                    messages=messages,
                    temperature=cfg.temperature,
                    max_tokens=cfg.max_tokens,
                ) as stream_ctx:
                    async for chunk in stream_ctx:
                        delta = chunk.choices[0].delta.content
                        if delta:
                            yield delta
                return  # succès → on sort

            except Exception as exc:
                logger.warning("Stream — échec avec %s : %s", model, exc)
                last_exc = exc

        raise RuntimeError(
            f"Tous les modèles Groq ont échoué en streaming ({cfg.models})"
        ) from last_exc

    # ── Helpers privés ─────────────────────────────────────────────────────────

    @staticmethod
    def _build_messages(
        prompt: str,
        system: str,
        history: list[ChatCompletionMessageParam] | None,
    ) -> list[ChatCompletionMessageParam]:
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": system}
        ]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})
        return messages