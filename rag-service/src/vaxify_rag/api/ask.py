"""POST /ask — thin HTTP adapter over AskService."""

from __future__ import annotations

from functools import lru_cache

from fastapi import APIRouter, Depends

from vaxify_rag.api.schemas import AskRequest, AskResponse
from vaxify_rag.api.security import require_internal_key
from vaxify_rag.errors import RagError, classify_exception
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
    question = (body.question or "").strip()
    logger.info(
        "ask_received",
        stage="ask",
        question_chars=len(question),
        question_preview=question[:80],
    )
    try:
        result = service.ask(body.question)
    except RagError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise classify_exception(exc, stage="ask") from exc

    logger.info(
        "ask_completed",
        stage="ask",
        status=result.status,
        citation_count=len(result.citations or []),
        abstention_reason=result.abstention_reason,
        model=result.model,
        answer_chars=len(result.answer or ""),
    )
    return AskResponse.from_result_dict(result.to_dict())

