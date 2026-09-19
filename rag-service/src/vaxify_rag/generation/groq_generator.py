"""Groq-hosted Qwen generator for grounded answers."""

from __future__ import annotations

import time
from typing import Any

from groq import APIConnectionError, APIStatusError, APITimeoutError, Groq, RateLimitError

from vaxify_rag.config import get_settings
from vaxify_rag.generation.json_parse import parse_generation_json
from vaxify_rag.generation.prompts import SYSTEM_PROMPT, build_user_prompt
from vaxify_rag.logging import get_logger
from vaxify_rag.models.retrieval import RetrievedChunk

logger = get_logger(__name__)

PROVIDER = "groq"


def _status_code(exc: BaseException) -> int | None:
    for attr in ("status_code", "code"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
    return None


def _is_retryable_generation_error(exc: Exception) -> bool:
    if isinstance(exc, (RateLimitError, APITimeoutError, APIConnectionError)):
        return True
    status = _status_code(exc)
    if status == 404:
        return False
    if status in {429, 500, 502, 503, 504}:
        return True
    message = str(exc).lower()
    return any(
        token in message
        for token in (
            "429",
            "500",
            "502",
            "503",
            "504",
            "timeout",
            "timed out",
            "unavailable",
            "rate limit",
            "empty model response",
            "not json",
            "expecting value",
        )
    )


def _retry_delay_for_generation(exc: Exception, attempt: int) -> float:
    headers = getattr(exc, "headers", None) or {}
    retry_after = None
    if isinstance(headers, dict):
        retry_after = headers.get("retry-after") or headers.get("Retry-After")
    if retry_after is not None:
        try:
            return max(float(retry_after), 1.0)
        except (TypeError, ValueError):
            pass
    return float(2**attempt)


def _extract_message_text(response: Any) -> str:
    try:
        message = response.choices[0].message
    except Exception:  # noqa: BLE001
        return ""
    content = getattr(message, "content", None)
    if isinstance(content, str):
        return content
    return ""


class GroqAnswerGenerator:
    """Answer generator backed by Groq chat completions (Qwen)."""

    def __init__(self, *, client: Any | None = None) -> None:
        settings = get_settings()
        if client is None and not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is required for answer generation")
        self._client = client or Groq(
            api_key=settings.groq_api_key,
            timeout=settings.generation_timeout_seconds,
        )
        self.model = settings.groq_model
        self.temperature = settings.generation_temperature
        self.max_output_tokens = settings.generation_max_output_tokens
        self.max_retries = settings.generation_max_retries
        self.timeout_seconds = settings.generation_timeout_seconds

    def generate(self, query: str, chunks: list[RetrievedChunk]) -> dict[str, Any]:
        user_prompt = build_user_prompt(query, chunks)
        logger.info(
            "generation_start",
            provider=PROVIDER,
            model=self.model,
            evidence_count=len(chunks),
            query=query[:120],
        )
        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=self.temperature,
                    max_completion_tokens=self.max_output_tokens,
                    response_format={"type": "json_object"},
                    reasoning_format="hidden",
                    reasoning_effort="none",
                )
                raw = _extract_message_text(response)
                parsed = parse_generation_json(raw)
                logger.info(
                    "generation_done",
                    provider=PROVIDER,
                    model=self.model,
                    abstain=bool(parsed.get("abstain")),
                    citation_count=len(parsed.get("citation_ids") or []),
                )
                return parsed
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                status = _status_code(exc)
                if attempt >= self.max_retries or not _is_retryable_generation_error(exc):
                    break
                sleep_s = _retry_delay_for_generation(exc, attempt)
                logger.warning(
                    "generation_retry",
                    attempt=attempt,
                    sleep_s=sleep_s,
                    provider=PROVIDER,
                    model=self.model,
                    stage="generation",
                    http_status=status,
                    exception_type=type(exc).__name__,
                    error=str(exc)[:200],
                )
                time.sleep(sleep_s)

        assert last_error is not None
        logger.error(
            "generation_failed",
            provider=PROVIDER,
            model=self.model,
            stage="generation",
            http_status=_status_code(last_error),
            exception_type=type(last_error).__name__,
            error=str(last_error)[:300],
        )
        raise last_error
