"""Internal service-to-service authentication for the RAG HTTP API."""

from __future__ import annotations

import hmac

from fastapi import Header

from vaxify_rag.config import get_settings
from vaxify_rag.errors import (
    SAFE_MESSAGES,
    SERVICE_UNAVAILABLE,
    UNAUTHORIZED,
    RagError,
)

INTERNAL_KEY_HEADER = "X-RAG-Internal-Key"


def require_internal_key(
    x_rag_internal_key: str | None = Header(default=None, alias=INTERNAL_KEY_HEADER),
) -> None:
    """Reject requests that do not present the shared internal key."""
    expected = (get_settings().rag_internal_key or "").strip()
    if not expected:
        raise RagError(
            code=SERVICE_UNAVAILABLE,
            message=SAFE_MESSAGES[SERVICE_UNAVAILABLE],
            stage="auth",
            detail="RAG_INTERNAL_KEY is not configured",
        )
    provided = (x_rag_internal_key or "").strip()
    if not provided or not hmac.compare_digest(provided, expected):
        raise RagError(
            code=UNAUTHORIZED,
            message=SAFE_MESSAGES[UNAUTHORIZED],
            stage="auth",
            detail="Invalid or missing internal key",
        )
