"""Unit tests for classified RAG errors and ask error mapping."""

from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from vaxify_rag.api.ask import get_ask_service
from vaxify_rag.api.main import create_app
from vaxify_rag.config import get_settings
from vaxify_rag.errors import (
    AI_PROVIDER_ERROR,
    RATE_LIMITED,
    SERVICE_UNAVAILABLE,
    RagError,
    classify_exception,
)
from vaxify_rag.models.answer import AnswerResult


INTERNAL_KEY = "test-rag-internal-key"


class FakeAskService:
    def __init__(self, *, error: Exception | None = None) -> None:
        self.error = error
        self.calls: list[str] = []

    def ask(self, query: str, *, top_k: int | None = None) -> AnswerResult:
        self.calls.append(query)
        if self.error is not None:
            raise self.error
        return AnswerResult(
            query=query,
            status="answered",
            answer="ok",
            abstention_reason=None,
            citations=[],
            used_chunk_ids=[],
            top_score=0.9,
            term_overlap=0.8,
            answerability_reason="strong_evidence",
            model="gemini-test",
        )


class FakeAPIError(Exception):
    def __init__(self, code: int, message: str, *, status: str = "") -> None:
        super().__init__(message)
        self.code = code
        self.status = status


@pytest.fixture
def app_client(monkeypatch: pytest.MonkeyPatch):
    def _make(error: Exception | None = None) -> TestClient:
        get_settings.cache_clear()
        get_ask_service.cache_clear()
        monkeypatch.setenv("RAG_INTERNAL_KEY", INTERNAL_KEY)
        get_settings.cache_clear()

        fake = FakeAskService(error=error)
        app = create_app()
        app.dependency_overrides[get_ask_service] = lambda: fake
        client = TestClient(app)
        client.fake_ask = fake  # type: ignore[attr-defined]
        return client

    yield _make
    get_ask_service.cache_clear()
    get_settings.cache_clear()


def _headers(key: str = INTERNAL_KEY) -> dict[str, str]:
    return {"X-RAG-Internal-Key": key}


def test_classify_rate_limit():
    err = classify_exception(
        FakeAPIError(429, "Please retry in 12.0s", status="RESOURCE_EXHAUSTED"),
        stage="generation",
    )
    assert err.code == RATE_LIMITED
    assert err.retry_after_seconds == 12
    assert err.http_status == 429


def test_classify_provider_5xx():
    err = classify_exception(FakeAPIError(503, "unavailable high demand"), stage="generation")
    assert err.code == AI_PROVIDER_ERROR
    assert err.http_status == 503


def test_ask_maps_rate_limit(app_client) -> None:
    client = app_client(
        RagError(
            code=RATE_LIMITED,
            message="AI provider is temporarily busy",
            stage="generation",
            provider="gemini",
            retry_after_seconds=20,
            cause_type="ClientError",
            detail="429 RESOURCE_EXHAUSTED",
        )
    )
    response = client.post(
        "/ask",
        json={"question": "Are vaccines safe?"},
        headers={**_headers(), "X-Request-Id": "req-test-429"},
    )
    assert response.status_code == 429
    body: dict[str, Any] = response.json()
    assert body["status"] == "error"
    assert body["code"] == "rate_limited"
    assert body["request_id"] == "req-test-429"
    assert body["retry_after_seconds"] == 20
    assert response.headers.get("Retry-After") == "20"
    assert "busy" in body["message"].lower()
    assert "RESOURCE_EXHAUSTED" not in body["message"]


def test_ask_maps_service_unavailable(app_client) -> None:
    client = app_client(RuntimeError("pinecone connection refused"))
    response = client.post(
        "/ask",
        json={"question": "What is PCV?"},
        headers=_headers(),
    )
    assert response.status_code == 503
    body = response.json()
    assert body["code"] == SERVICE_UNAVAILABLE
    assert "request_id" in body


def test_ask_validation_returns_code(app_client) -> None:
    client = app_client()
    response = client.post(
        "/ask",
        json={"question": "   "},
        headers=_headers(),
    )
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "validation_error"


def test_ask_unauthorized_returns_code(app_client) -> None:
    client = app_client()
    response = client.post(
        "/ask",
        json={"question": "What vaccines are given at birth?"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["code"] == "unauthorized"
