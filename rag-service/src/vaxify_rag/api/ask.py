"""POST /ask — thin HTTP adapter over AskService."""

from __future__ import annotations

from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, status

from vaxify_rag.api.schemas import AskRequest, AskResponse
from vaxify_rag.api.security import require_internal_key
from vaxify_rag.generation.pipeline import AskService
from vaxify_rag.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["ask"])


@lru_cache
def get_ask_service() -> AskService:
    return AskService()


@router.post(
    "/ask",
    response_model=AskResponse,
    dependencies=[Depends(require_internal_key)],
)
def ask(
    body: AskRequest,
    service: AskService = Depends(get_ask_service),
) -> AskResponse:
    try:
        result = service.ask(body.question)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.error("ask_endpoint_failed", error=str(exc)[:300])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG service temporarily unavailable",
        ) from exc

    return AskResponse.from_result_dict(result.to_dict())
