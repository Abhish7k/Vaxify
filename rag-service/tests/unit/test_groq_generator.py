"""Unit tests for Groq answer generator contract and reliability."""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any

import pytest

from vaxify_rag.generation.groq_generator import GroqAnswerGenerator
from vaxify_rag.generation.json_parse import parse_generation_json
from vaxify_rag.generation.pipeline import AskService
from vaxify_rag.models.retrieval import RetrievedChunk, RetrievalResult


def _chunk(
    *,
    chunk_id: str = "c1",
    text: str = "PCV is the pneumococcal conjugate vaccine given under UIP.",
    score: float = 0.88,
) -> RetrievedChunk:
    return RetrievedChunk(
        rank=1,
        id=chunk_id,
        score=score,
        text=text,
        source="PCV Operational Guidelines",
        source_path="india/PCV_Operational_Guidelines.pdf",
        source_id="S6",
        source_type="ops",
        publisher="MoHFW",
        region="India",
        doc_date="2021",
        capture_date="2024",
        chapter="",
        section="Background",
        page_start=19,
        page_end=20,
        topic="pcv",
        audience="general",
        superseded=False,
        retrievable=True,
        authority_rank=2,
        chunk_index=0,
        total_chunks=1,
        ingestion_version="1.0.0",
        embedding_model="gemini-embedding-001",
    )


def _retrieval(query: str, matches: list[RetrievedChunk]) -> RetrievalResult:
    return RetrievalResult(
        query=query,
        top_k=5,
        matches=matches,
        filter_applied={"superseded": False, "retrievable": True},
    )


class FakeRetriever:
    def __init__(self, result: RetrievalResult) -> None:
        self.result = result

    def retrieve(self, query: str, *, top_k: int | None = None) -> RetrievalResult:
        return self.result


class FakeGroqCompletions:
    def __init__(self, *, responses: list[Any] | None = None, error: Exception | None = None) -> None:
        self.responses = list(responses or [])
        self.error = error
        self.calls: list[dict[str, Any]] = []

    def create(self, **kwargs: Any) -> Any:
        self.calls.append(kwargs)
        if self.error is not None and not self.responses:
            raise self.error
        if self.responses:
            item = self.responses.pop(0)
            if isinstance(item, Exception):
                raise item
            return item
        raise AssertionError("no fake response configured")


class FakeGroqClient:
    def __init__(self, completions: FakeGroqCompletions) -> None:
        self.chat = SimpleNamespace(completions=completions)


class FakeStatusError(Exception):
    def __init__(self, status_code: int, message: str, *, headers: dict[str, str] | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.headers = headers or {}


def _json_response(content: str) -> Any:
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content, reasoning=None))]
    )


@pytest.fixture(autouse=True)
def _settings(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")
    monkeypatch.setenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    from vaxify_rag.config import get_settings

    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_groq_generate_parses_json_object():
    completions = FakeGroqCompletions(
        responses=[
            _json_response(
                '{"abstain": false, "answer": "PCV prevents pneumococcal disease.", '
                '"citation_ids": ["c1"], "rationale": "ok"}'
            )
        ]
    )
    generator = GroqAnswerGenerator(client=FakeGroqClient(completions))
    parsed = generator.generate("What is PCV?", [_chunk()])
    assert parsed["abstain"] is False
    assert "PCV" in parsed["answer"]
    assert parsed["citation_ids"] == ["c1"]
    call = completions.calls[0]
    assert call["model"] == "qwen/qwen3.6-27b"
    assert call["response_format"] == {"type": "json_object"}
    assert call["reasoning_format"] == "hidden"
    assert call["reasoning_effort"] == "none"


def test_groq_generate_retries_429_then_succeeds():
    completions = FakeGroqCompletions(
        responses=[
            FakeStatusError(429, "rate limited", headers={"retry-after": "1"}),
            _json_response(
                '{"abstain": false, "answer": "ok", "citation_ids": ["c1"], "rationale": "r"}'
            ),
        ]
    )
    generator = GroqAnswerGenerator(client=FakeGroqClient(completions))
    generator.max_retries = 3
    parsed = generator.generate("What is PCV?", [_chunk()])
    assert parsed["answer"] == "ok"
    assert len(completions.calls) == 2


def test_groq_generate_retries_5xx_then_raises():
    completions = FakeGroqCompletions(
        responses=[
            FakeStatusError(503, "unavailable"),
            FakeStatusError(503, "unavailable"),
        ]
    )
    generator = GroqAnswerGenerator(client=FakeGroqClient(completions))
    generator.max_retries = 2
    with pytest.raises(FakeStatusError):
        generator.generate("What is PCV?", [_chunk()])
    assert len(completions.calls) == 2


def test_groq_generate_timeout_is_retryable_then_raises():
    completions = FakeGroqCompletions(error=TimeoutError("request timed out"))
    generator = GroqAnswerGenerator(client=FakeGroqClient(completions))
    generator.max_retries = 1
    with pytest.raises(TimeoutError):
        generator.generate("What is PCV?", [_chunk()])


def test_groq_malformed_json_raises():
    completions = FakeGroqCompletions(responses=[_json_response("not-json")])
    generator = GroqAnswerGenerator(client=FakeGroqClient(completions))
    generator.max_retries = 1
    with pytest.raises(ValueError, match="not JSON"):
        generator.generate("What is PCV?", [_chunk()])


def test_empty_model_answer_abstains_in_pipeline():
    class EmptyAnswerGenerator:
        def generate(self, query: str, chunks: list[RetrievedChunk]) -> dict[str, Any]:
            return {
                "abstain": False,
                "answer": "   ",
                "citation_ids": ["c1"],
                "rationale": "empty",
            }

    result = AskService(
        retriever=FakeRetriever(_retrieval("What is PCV?", [_chunk(score=0.9)])),
        generator=EmptyAnswerGenerator(),  # type: ignore[arg-type]
    ).ask("What is PCV?")
    assert result.status == "abstained"
    assert result.abstention_reason == "empty_model_answer"


def test_parse_generation_json_valid():
    parsed = parse_generation_json(
        '{"abstain": true, "answer": "no", "citation_ids": [], "rationale": "x"}'
    )
    assert parsed["abstain"] is True
