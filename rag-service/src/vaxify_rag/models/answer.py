"""Phase 2B answer / citation models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

from vaxify_rag.config import lookup_source_provenance
from vaxify_rag.models.retrieval import RetrievedChunk

# Public citation fields. Internal ids, scores, and filesystem paths stay off this list.
PUBLIC_CITATION_FIELDS = (
    "source",
    "source_id",
    "title",
    "publisher",
    "document_date",
    "source_url",
    "page_start",
    "page_end",
    "section",
    "topic",
)


def _non_blank(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


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
    # Internal evidence text for CLI/debug only. Not part of the public citation.
    passage: str
    publisher: str = ""
    document_date: str | None = None
    source_url: str | None = None
    title: str = ""

    @classmethod
    def from_chunk(cls, chunk: RetrievedChunk) -> Citation:
        provenance = lookup_source_provenance(chunk.source_id)
        publisher = _non_blank(chunk.publisher) or provenance.get("publisher") or ""
        document_date = _non_blank(chunk.doc_date) or provenance.get("document_date")
        title = provenance.get("title") or chunk.source
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
            passage=chunk.text,
            publisher=publisher,
            document_date=document_date,
            source_url=provenance.get("source_url"),
            title=title,
        )

    @property
    def preview(self) -> str:
        """Short CLI snippet. Not part of the public citation contract."""
        text = " ".join((self.passage or "").split())
        limit = 180
        if len(text) <= limit:
            return text
        return text[: limit - 1] + "…"

    def to_public_dict(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "source_id": self.source_id,
            "title": self.title,
            "publisher": _non_blank(self.publisher),
            "document_date": _non_blank(self.document_date),
            "source_url": self.source_url,
            "page_start": self.page_start,
            "page_end": self.page_end,
            "section": self.section,
            "topic": self.topic,
        }

    def to_dict(self) -> dict[str, Any]:
        return self.to_public_dict()


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
            "citations": [c.to_public_dict() for c in self.citations],
            "used_chunk_ids": self.used_chunk_ids,
            "top_score": self.top_score,
            "term_overlap": self.term_overlap,
            "answerability_reason": self.answerability_reason,
            "model": self.model,
        }
