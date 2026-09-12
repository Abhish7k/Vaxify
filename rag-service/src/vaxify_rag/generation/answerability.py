"""Multi-signal evidence sufficiency for Phase 2B abstention."""

from __future__ import annotations

import re
from dataclasses import dataclass

from vaxify_rag.config import get_settings
from vaxify_rag.models.retrieval import RetrievedChunk, RetrievalResult

_STOPWORDS = {
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "what",
    "when",
    "where",
    "who",
    "why",
    "how",
    "do",
    "does",
    "did",
    "should",
    "i",
    "my",
    "me",
    "if",
    "of",
    "in",
    "on",
    "at",
    "to",
    "for",
    "and",
    "or",
    "with",
    "from",
    "by",
    "about",
    "during",
    "given",
}


@dataclass(frozen=True)
class AnswerabilityDecision:
    sufficient: bool
    reason: str
    top_score: float | None
    term_overlap: float | None


def content_terms(text: str) -> set[str]:
    tokens = re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)?", (text or "").lower())
    return {
        t
        for t in tokens
        if len(t) > 1 and t not in _STOPWORDS and not t.isdigit()
    }


def term_overlap_ratio(query: str, chunks: list[RetrievedChunk]) -> float:
    terms = content_terms(query)
    if not terms:
        return 1.0
    evidence = " ".join(c.text for c in chunks).lower()
    hits = sum(1 for term in terms if term in evidence)
    return hits / len(terms)


def assess_evidence(
    retrieval: RetrievalResult,
    *,
    min_top_score: float | None = None,
    strong_top_score: float | None = None,
    min_term_overlap: float | None = None,
) -> AnswerabilityDecision:
    """Decide whether retrieved chunks can support a grounded answer.

    Signals (all configurable; not a single score gate):
    1. Empty retrieval → abstain
    2. Top cosine score below ``min_top_score`` → abstain
    3. Query-term overlap with evidence below ``min_term_overlap`` → abstain
       (blocks OOD queries that still get mid/high cosine neighbors)
    4. Otherwise sufficient; reason notes strong vs mid score band
    """
    settings = get_settings()
    min_score = (
        min_top_score
        if min_top_score is not None
        else settings.answerability_min_top_score
    )
    strong_score = (
        strong_top_score
        if strong_top_score is not None
        else settings.answerability_strong_top_score
    )
    min_overlap = (
        min_term_overlap
        if min_term_overlap is not None
        else settings.answerability_min_term_overlap
    )

    if not retrieval.matches:
        return AnswerabilityDecision(
            sufficient=False,
            reason="no_matches",
            top_score=None,
            term_overlap=None,
        )

    top_score = retrieval.matches[0].score
    overlap = term_overlap_ratio(retrieval.query, retrieval.matches)

    if top_score < min_score:
        return AnswerabilityDecision(
            sufficient=False,
            reason="top_score_below_minimum",
            top_score=top_score,
            term_overlap=overlap,
        )

    if overlap < min_overlap:
        return AnswerabilityDecision(
            sufficient=False,
            reason="insufficient_term_overlap",
            top_score=top_score,
            term_overlap=overlap,
        )

    if top_score >= strong_score:
        return AnswerabilityDecision(
            sufficient=True,
            reason="strong_top_score",
            top_score=top_score,
            term_overlap=overlap,
        )

    return AnswerabilityDecision(
        sufficient=True,
        reason="mid_score_with_term_overlap",
        top_score=top_score,
        term_overlap=overlap,
    )
