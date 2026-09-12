"""Gemini generation client for grounded answers."""

from __future__ import annotations

import json
import re
import time
from typing import Any

from google import genai
from google.genai import types

from vaxify_rag.config import get_settings
from vaxify_rag.generation.prompts import SYSTEM_PROMPT, build_user_prompt
from vaxify_rag.logging import get_logger
from vaxify_rag.models.retrieval import RetrievedChunk

logger = get_logger(__name__)

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


def parse_generation_json(raw: str) -> dict[str, Any]:
    text = (raw or "").strip()
    if not text:
        raise ValueError("empty model response")
    fence = _JSON_FENCE_RE.search(text)
    if fence:
        text = fence.group(1).strip()
    # Prefer first JSON object if prose sneaks in.
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("model response is not JSON")
    return json.loads(text[start : end + 1])


def _is_retryable_generation_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(
        token in message
        for token in (
            "503",
            "429",
            "unavailable",
            "high demand",
            "resource_exhausted",
            "empty model response",
            "not json",
            "expecting value",
        )
    )


class GeminiAnswerGenerator:
    def __init__(self, *, client: Any | None = None) -> None:
        settings = get_settings()
        if client is None and not settings.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required for answer generation")
        self._client = client or genai.Client(api_key=settings.google_api_key)
        self.model = settings.generation_model
        self.temperature = settings.generation_temperature
        self.max_output_tokens = settings.generation_max_output_tokens
        self.max_retries = 5

    def generate(self, query: str, chunks: list[RetrievedChunk]) -> dict[str, Any]:
        user_prompt = build_user_prompt(query, chunks)
        logger.info(
            "generation_start",
            model=self.model,
            evidence_count=len(chunks),
            query=query[:120],
        )
        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self._client.models.generate_content(
                    model=self.model,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=self.temperature,
                        max_output_tokens=self.max_output_tokens,
                        response_mime_type="application/json",
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(
                            disable=True
                        ),
                    ),
                )
                raw = getattr(response, "text", None) or ""
                if not raw and getattr(response, "candidates", None):
                    try:
                        parts = response.candidates[0].content.parts
                        raw = "".join(getattr(p, "text", "") or "" for p in parts)
                    except Exception:  # noqa: BLE001
                        raw = ""
                parsed = parse_generation_json(raw)
                logger.info(
                    "generation_done",
                    abstain=bool(parsed.get("abstain")),
                    citation_count=len(parsed.get("citation_ids") or []),
                )
                return parsed
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                if attempt >= self.max_retries or not _is_retryable_generation_error(exc):
                    break
                sleep_s = 2**attempt
                logger.warning(
                    "generation_retry",
                    attempt=attempt,
                    sleep_s=sleep_s,
                    error=str(exc)[:200],
                )
                time.sleep(sleep_s)
        assert last_error is not None
        raise last_error
