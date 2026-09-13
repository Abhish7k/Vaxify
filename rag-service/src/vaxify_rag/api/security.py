"""Internal service-to-service authentication for the RAG HTTP API."""

from __future__ import annotations

import hmac

from fastapi import Header, HTTPException, status

from vaxify_rag.config import get_settings

INTERNAL_KEY_HEADER = "X-RAG-Internal-Key"


def require_internal_key(
    x_rag_internal_key: str | None = Header(default=None, alias=INTERNAL_KEY_HEADER),
) -> None:
    """Reject requests that do not present the shared internal key."""
    expected = (get_settings().rag_internal_key or "").strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG internal key is not configured",
        )
    provided = (x_rag_internal_key or "").strip()
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal key",
        )
