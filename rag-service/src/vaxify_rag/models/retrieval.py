"""Retrieval result models (Phase 2A — no LLM generation)."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class RetrievedChunk:
    rank: int
    id: str
    score: float
    text: str
    source: str
    source_path: str
    source_id: str
    source_type: str
    publisher: str
    region: str
    doc_date: str
    capture_date: str
    chapter: str
    section: str
    page_start: int | None
    page_end: int | None
    topic: str
    audience: str
    superseded: bool
    retrievable: bool
    authority_rank: int
    chunk_index: int
    total_chunks: int
    ingestion_version: str
    embedding_model: str

    def preview(self, limit: int = 160) -> str:
        text = " ".join(self.text.split())
        if len(text) <= limit:
            return text
        return text[: limit - 1] + "…"

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["preview"] = self.preview()
        return data


@dataclass
class RetrievalResult:
    query: str
    top_k: int
    matches: list[RetrievedChunk]
    filter_applied: dict[str, Any]

    @property
    def evidence_sufficient(self) -> bool:
        """Heuristic abstention signal for Phase 2A (no LLM).

        Cosine scores on this small corpus run high even for weak matches, so
        use a conservative floor. Final grounded answers come in Phase 2B.
        """
        if not self.matches:
            return False
        return self.matches[0].score >= 0.60

    def to_dict(self) -> dict[str, Any]:
        return {
            "query": self.query,
            "top_k": self.top_k,
            "filter_applied": self.filter_applied,
            "evidence_sufficient": self.evidence_sufficient,
            "matches": [m.to_dict() for m in self.matches],
        }
