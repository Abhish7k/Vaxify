"""Classified RAG errors for safe upstream propagation."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from vaxify_rag.embedding.google_embedder import is_rate_limit_error, parse_retry_delay_seconds

VALIDATION_ERROR = "validation_error"
UNAUTHORIZED = "unauthorized"
RATE_LIMITED = "rate_limited"
AI_PROVIDER_ERROR = "ai_provider_error"
SERVICE_UNAVAILABLE = "service_unavailable"
TIMEOUT = "timeout"
UNKNOWN = "unknown"

SAFE_MESSAGES: dict[str, str] = {
    VALIDATION_ERROR: "Invalid question",
    UNAUTHORIZED: "Unauthorized",
    RATE_LIMITED: "AI provider is temporarily busy",
    AI_PROVIDER_ERROR: "AI provider error",
    SERVICE_UNAVAILABLE: "RAG service temporarily unavailable",
    TIMEOUT: "Request timed out",
    UNKNOWN: "Unexpected error",
}

HTTP_STATUS_BY_CODE: dict[str, int] = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    RATE_LIMITED: 429,
    AI_PROVIDER_ERROR: 503,
    SERVICE_UNAVAILABLE: 503,
    TIMEOUT: 504,
    UNKNOWN: 500,
}


@dataclass
class RagError(Exception):
    """Typed service error with a safe public payload and private diagnostics."""

    code: str
    message: str
    stage: str = "ask"
    provider: str | None = None
    retry_after_seconds: int | None = None
    cause_type: str | None = None
    detail: str | None = None

    def __post_init__(self) -> None:
        Exception.__init__(self, self.message)

    @property
    def http_status(self) -> int:
        return HTTP_STATUS_BY_CODE.get(self.code, 500)

    def public_body(self, request_id: str) -> dict[str, Any]:
        body: dict[str, Any] = {
            "status": "error",
            "code": self.code,
            "message": self.message,
            "request_id": request_id,
        }
        if self.retry_after_seconds is not None and self.retry_after_seconds > 0:
            body["retry_after_seconds"] = self.retry_after_seconds
        return body


def _exception_code(exc: BaseException) -> int | None:
    for attr in ("status_code", "code"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
    return None


def _looks_like_timeout(exc: BaseException) -> bool:
    text = str(exc).lower()
    name = type(exc).__name__.lower()
    tokens = ("timeout", "timed out", "deadline exceeded", "readtimeout", "connecttimeout")
    return any(token in text or token in name for token in tokens)


def _looks_like_provider_error(exc: BaseException) -> bool:
    code = _exception_code(exc)
    if code is not None and code >= 500:
        return True
    text = str(exc).lower()
    name = type(exc).__name__.lower()
    return any(
        token in text or token in name
        for token in (
            "503",
            "500",
            "502",
            "unavailable",
            "high demand",
            "internal error",
            "server error",
            "google.genai",
            "generativeai",
            "groq",
            "apistatuserror",
            "apiconnectionerror",
        )
    )


def classify_exception(
    exc: BaseException,
    *,
    stage: str,
    provider: str | None = "groq",
) -> RagError:
    """Map an arbitrary exception into a safe RagError."""
    if isinstance(exc, RagError):
        return exc

    if isinstance(exc, ValueError):
        return RagError(
            code=VALIDATION_ERROR,
            message=SAFE_MESSAGES[VALIDATION_ERROR],
            stage=stage,
            cause_type=type(exc).__name__,
            detail=str(exc)[:300],
        )

    if is_rate_limit_error(exc) or _exception_code(exc) == 429:
        retry_after = int(round(parse_retry_delay_seconds(exc, default=20.0)))
        return RagError(
            code=RATE_LIMITED,
            message=SAFE_MESSAGES[RATE_LIMITED],
            stage=stage,
            provider=provider,
            retry_after_seconds=retry_after,
            cause_type=type(exc).__name__,
            detail=str(exc)[:300],
        )

    if _looks_like_timeout(exc):
        return RagError(
            code=TIMEOUT,
            message=SAFE_MESSAGES[TIMEOUT],
            stage=stage,
            provider=provider,
            cause_type=type(exc).__name__,
            detail=str(exc)[:300],
        )

    if _looks_like_provider_error(exc):
        return RagError(
            code=AI_PROVIDER_ERROR,
            message=SAFE_MESSAGES[AI_PROVIDER_ERROR],
            stage=stage,
            provider=provider,
            cause_type=type(exc).__name__,
            detail=str(exc)[:300],
        )

    text = str(exc).lower()
    if any(
        token in text
        for token in ("pinecone", "connection", "connect", "dns", "network", "unavailable")
    ):
        return RagError(
            code=SERVICE_UNAVAILABLE,
            message=SAFE_MESSAGES[SERVICE_UNAVAILABLE],
            stage=stage,
            provider=provider if "gemini" in text or "google" in text else None,
            cause_type=type(exc).__name__,
            detail=str(exc)[:300],
        )

    return RagError(
        code=UNKNOWN,
        message=SAFE_MESSAGES[UNKNOWN],
        stage=stage,
        provider=provider,
        cause_type=type(exc).__name__,
        detail=str(exc)[:300],
    )
