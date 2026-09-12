"""Phase 2B answer / citation models."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

from vaxify_rag.models.retrieval import RetrievedChunk


@dataclass
class Citation:
    chunk_id: str
    source: str
    source_id: str
    source_path: str
    page_start: int | None
    page_end: int | None
    section: str
    topic: str
    score: float
    preview: str

    @classmethod
    def from_chunk(cls, chunk: RetrievedChunk) -> Citation:
        return cls(
            chunk_id=chunk.id,
            source=chunk.source,
            source_id=chunk.source_id,
            source_path=chunk.source_path,
            page_start=chunk.page_start,
            page_end=chunk.page_end,
            section=chunk.section,
            topic=chunk.topic,
            score=chunk.score,
            preview=chunk.preview(180),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


AnswerStatus = Literal["answered", "abstained"]


@dataclass
class AnswerResult:
    query: str
    status: AnswerStatus
    answer: str
    abstention_reason: str | None
    citations: list[Citation] = field(default_factory=list)
    used_chunk_ids: list[str] = field(default_factory=list)
    top_score: float | None = None
    term_overlap: float | None = None
    answerability_reason: str = ""
    model: str = ""

    @property
    def abstained(self) -> bool:
        return self.status == "abstained"

    def to_dict(self) -> dict[str, Any]:
        return {
            "query": self.query,
            "status": self.status,
            "answer": self.answer,
            "abstention_reason": self.abstention_reason,
            "citations": [c.to_dict() for c in self.citations],
            "used_chunk_ids": self.used_chunk_ids,
            "top_score": self.top_score,
            "term_overlap": self.term_overlap,
            "answerability_reason": self.answerability_reason,
            "model": self.model,
        }
