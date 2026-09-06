"""Chunk and intermediate data models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Topic = Literal[
    "schedule",
    "pregnancy",
    "newborn",
    "pcv",
    "td_tt",
    "side_effects",
    "safety",
    "cost",
    "immunity",
    "campaign",
]

SourceType = Literal["PDF", "HTML"]
Audience = Literal["public", "health_worker"]


@dataclass
class PageBlock:
    source_id: str
    page_num: int
    text: str


@dataclass
class RawChunk:
    source_id: str
    text: str
    question: str | None = None
    question_number: int | None = None
    chapter: str | None = None
    section: str | None = None
    page_start: int | None = None
    page_end: int | None = None
    topic: Topic | None = None
    retrievable: bool = True


@dataclass
class ChunkRecord:
    id: str
    text: str
    source: str
    source_path: str
    source_type: SourceType
    publisher: str
    region: str
    doc_date: str | None
    capture_date: str | None
    chapter: str | None
    section: str | None
    page_start: int | None
    page_end: int | None
    topic: Topic
    audience: Audience
    superseded: bool
    retrievable: bool
    authority_rank: int
    chunk_index: int
    total_chunks: int
    source_id: str = ""
    question_number: int | None = None
    ingestion_version: str = ""
    embedding_model: str = ""

    def embedding_text(self) -> str:
        if self.section and self.section not in self.text:
            return f"{self.section}\n\n{self.text}"
        return self.text

    def to_pinecone_metadata(self) -> dict:
        """Pinecone metadata — no null values."""
        return {
            "text": self.text[:35000],
            "source": self.source,
            "source_path": self.source_path,
            "source_type": self.source_type,
            "publisher": self.publisher,
            "region": self.region,
            "doc_date": self.doc_date or "",
            "capture_date": self.capture_date or "",
            "chapter": self.chapter or "",
            "section": self.section or "",
            "page_start": self.page_start if self.page_start is not None else -1,
            "page_end": self.page_end if self.page_end is not None else -1,
            "topic": self.topic,
            "audience": self.audience,
            "superseded": self.superseded,
            "retrievable": self.retrievable,
            "authority_rank": self.authority_rank,
            "chunk_index": self.chunk_index,
            "total_chunks": self.total_chunks,
            "ingestion_version": self.ingestion_version,
            "embedding_model": self.embedding_model,
            "source_id": self.source_id,
        }


@dataclass
class IngestManifest:
    ingestion_version: str
    corpus_hash: str
    source_hashes: dict[str, str] = field(default_factory=dict)
    embedding_model: str = ""
    embedding_dimension: int = 0
    chunk_ids: list[str] = field(default_factory=list)
    indexed_chunk_ids: list[str] = field(default_factory=list)
    chunk_count: int = 0
    retrievable_count: int = 0
    superseded_count: int = 0
    embedded_at: str | None = None

    def to_dict(self) -> dict:
        return {
            "ingestion_version": self.ingestion_version,
            "corpus_hash": self.corpus_hash,
            "source_hashes": self.source_hashes,
            "embedding_model": self.embedding_model,
            "embedding_dimension": self.embedding_dimension,
            "chunk_ids": self.chunk_ids,
            "indexed_chunk_ids": self.indexed_chunk_ids,
            "chunk_count": self.chunk_count,
            "retrievable_count": self.retrievable_count,
            "superseded_count": self.superseded_count,
            "embedded_at": self.embedded_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> IngestManifest:
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
