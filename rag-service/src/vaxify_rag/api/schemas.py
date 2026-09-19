"""HTTP request/response models for the ask endpoint."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from vaxify_rag.config import trusted_https_url


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)

    @field_validator("question")
    @classmethod
    def question_must_be_non_blank(cls, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise ValueError("question must be non-blank")
        return cleaned


class CitationResponse(BaseModel):
    """Public citation provenance. No chunk text, vector ids, scores, or paths."""

    source: str
    source_id: str
    title: str = ""
    publisher: str | None = None
    document_date: str | None = None
    source_url: str | None = None
    page_start: int | None = None
    page_end: int | None = None
    section: str = ""
    topic: str = ""

    @field_validator("source_url")
    @classmethod
    def source_url_must_be_https(cls, value: str | None) -> str | None:
        return trusted_https_url(value)


class AskResponse(BaseModel):
    """Full ask payload for the Spring gateway (public fields are filtered there)."""

    query: str
    status: Literal["answered", "abstained"]
    answer: str
    abstention_reason: str | None = None
    citations: list[CitationResponse] = Field(default_factory=list)
    used_chunk_ids: list[str] = Field(default_factory=list)
    top_score: float | None = None
    term_overlap: float | None = None
    answerability_reason: str = ""
    model: str = ""

    @classmethod
    def from_result_dict(cls, payload: dict[str, Any]) -> AskResponse:
        return cls.model_validate(payload)
