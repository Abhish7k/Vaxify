"""Phase 2B ask pipeline: retrieve → answerability → generate or abstain."""

from __future__ import annotations

from vaxify_rag.config import get_settings
from vaxify_rag.generation.answerability import AnswerabilityDecision, assess_evidence
from vaxify_rag.generation.gemini_generator import GeminiAnswerGenerator
from vaxify_rag.generation.prompts import ABSTENTION_MESSAGE
from vaxify_rag.logging import get_logger
from vaxify_rag.models.answer import AnswerResult, Citation
from vaxify_rag.models.retrieval import RetrievedChunk
from vaxify_rag.retrieval.retriever import Retriever

logger = get_logger(__name__)


def _abstain_result(
    query: str,
    *,
    reason: str,
    decision: AnswerabilityDecision | None = None,
    message: str | None = None,
    model: str = "",
) -> AnswerResult:
    return AnswerResult(
        query=query,
        status="abstained",
        answer=message or ABSTENTION_MESSAGE,
        abstention_reason=reason,
        citations=[],
        used_chunk_ids=[],
        top_score=decision.top_score if decision else None,
        term_overlap=decision.term_overlap if decision else None,
        answerability_reason=decision.reason if decision else reason,
        model=model,
    )


def _citations_for_ids(
    chunk_ids: list[str],
    chunks_by_id: dict[str, RetrievedChunk],
) -> list[Citation]:
    citations: list[Citation] = []
    seen: set[str] = set()
    for cid in chunk_ids:
        if cid in seen:
            continue
        chunk = chunks_by_id.get(cid)
        if chunk is None:
            continue
        seen.add(cid)
        citations.append(Citation.from_chunk(chunk))
    return citations


class AskService:
    """Grounded Q&A over the existing Retriever (no second retrieval path)."""

    def __init__(
        self,
        *,
        retriever: Retriever | None = None,
        generator: GeminiAnswerGenerator | None = None,
    ) -> None:
        self.settings = get_settings()
        self.retriever = retriever or Retriever()
        self.generator = generator or GeminiAnswerGenerator()

    def ask(self, query: str, *, top_k: int | None = None) -> AnswerResult:
        query = (query or "").strip()
        if not query:
            raise ValueError("query must be non-empty")

        retrieval = self.retriever.retrieve(query, top_k=top_k)
        decision = assess_evidence(retrieval)
        model = self.settings.generation_model

        if not decision.sufficient:
            logger.info(
                "ask_abstain_pre_generation",
                reason=decision.reason,
                top_score=decision.top_score,
                term_overlap=decision.term_overlap,
            )
            return _abstain_result(
                query,
                reason=decision.reason,
                decision=decision,
                model=model,
            )

        context = retrieval.matches[: self.settings.generation_max_context_chunks]
        chunks_by_id = {c.id: c for c in context}
        allowed_ids = set(chunks_by_id)

        try:
            payload = self.generator.generate(query, context)
        except Exception as exc:  # noqa: BLE001
            logger.warning("generation_failed", error=str(exc)[:300])
            return _abstain_result(
                query,
                reason="generation_error",
                decision=decision,
                message=(
                    "I could not generate a grounded answer right now. "
                    "Please try again shortly."
                ),
                model=model,
            )

        if bool(payload.get("abstain")):
            return _abstain_result(
                query,
                reason="model_abstained",
                decision=decision,
                message=str(payload.get("answer") or ABSTENTION_MESSAGE).strip()
                or ABSTENTION_MESSAGE,
                model=model,
            )

        raw_ids = payload.get("citation_ids") or []
        if not isinstance(raw_ids, list):
            raw_ids = []
        citation_ids = [str(x) for x in raw_ids if str(x) in allowed_ids]
        # If the model answered but forgot citations, attach the top evidence used.
        if not citation_ids and context:
            citation_ids = [context[0].id]

        answer_text = str(payload.get("answer") or "").strip()
        if not answer_text:
            return _abstain_result(
                query,
                reason="empty_model_answer",
                decision=decision,
                model=model,
            )

        return AnswerResult(
            query=query,
            status="answered",
            answer=answer_text,
            abstention_reason=None,
            citations=_citations_for_ids(citation_ids, chunks_by_id),
            used_chunk_ids=citation_ids,
            top_score=decision.top_score,
            term_overlap=decision.term_overlap,
            answerability_reason=decision.reason,
            model=model,
        )
