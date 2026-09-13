"""HTTP request/response models for the ask endpoint."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


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
    chunk_id: str
    source: str
    source_id: str
    source_path: str
    page_start: int | None = None
    page_end: int | None = None
    section: str = ""
    topic: str = ""
    score: float
    preview: str = ""


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
