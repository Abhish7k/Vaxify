"""Unit tests for FastAPI POST /ask gateway."""

from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from vaxify_rag.api.ask import get_ask_service
from vaxify_rag.api.main import create_app
from vaxify_rag.config import get_settings
from vaxify_rag.models.answer import AnswerResult, Citation


INTERNAL_KEY = "test-rag-internal-key"


class FakeAskService:
    def __init__(self, result: AnswerResult | None = None, *, error: Exception | None = None) -> None:
        self.result = result or AnswerResult(
            query="What vaccines are given at birth?",
            status="answered",
            answer="At birth, BCG and Hepatitis B are given.",
            abstention_reason=None,
            citations=[
                Citation(
                    chunk_id="c1",
                    source="National Immunization Schedule",
                    source_id="S5",
                    source_path="india/schedule.pdf",
                    page_start=1,
                    page_end=1,
                    section="Birth",
                    topic="schedule",
                    score=0.91,
                    passage="At birth, BCG and Hepatitis B are given.",
                    title="National Immunization Schedule",
                    publisher="MoHFW",
                    document_date="2020-05-29",
                    source_url=(
                        "https://prod-cdn.preprod.co-vin.in/uwin-prod/pdf/"
                        "National+Immunization+Schedule+(NIS)+for+SRM.pdf"
                    ),
                )
            ],
            used_chunk_ids=["c1"],
            top_score=0.91,
            term_overlap=0.8,
            answerability_reason="strong_evidence",
            model="gemini-test",
        )
        self.error = error
        self.calls: list[str] = []

    def ask(self, query: str, *, top_k: int | None = None) -> AnswerResult:
        self.calls.append(query)
        if self.error is not None:
            raise self.error
        return self.result


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    get_settings.cache_clear()
    get_ask_service.cache_clear()
    monkeypatch.setenv("RAG_INTERNAL_KEY", INTERNAL_KEY)
    get_settings.cache_clear()

    fake = FakeAskService()
    app = create_app()
    app.dependency_overrides[get_ask_service] = lambda: fake
    with TestClient(app) as test_client:
        test_client.fake_ask = fake  # type: ignore[attr-defined]
        yield test_client
    app.dependency_overrides.clear()
    get_ask_service.cache_clear()
    get_settings.cache_clear()


def _headers(key: str = INTERNAL_KEY) -> dict[str, str]:
    return {"X-RAG-Internal-Key": key}


def test_ask_requires_internal_key(client: TestClient) -> None:
    response = client.post("/ask", json={"question": "What vaccines are given at birth?"})
    assert response.status_code == 401


def test_ask_rejects_invalid_internal_key(client: TestClient) -> None:
    response = client.post(
        "/ask",
        json={"question": "What vaccines are given at birth?"},
        headers=_headers("wrong-key"),
    )
    assert response.status_code == 401


def test_ask_returns_answer_payload(client: TestClient) -> None:
    response = client.post(
        "/ask",
        json={"question": "What vaccines are given at birth?"},
        headers=_headers(),
    )
    assert response.status_code == 200
    body: dict[str, Any] = response.json()
    assert body["status"] == "answered"
    assert "BCG" in body["answer"]
    assert body["citations"][0]["source_id"] == "S5"
    assert body["citations"][0]["source_url"].endswith("for+SRM.pdf")
    forbidden = {"chunk_id", "score", "source_path", "preview", "passage", "authority_rank"}
    assert forbidden.isdisjoint(body["citations"][0])
    assert client.fake_ask.calls == ["What vaccines are given at birth?"]  # type: ignore[attr-defined]


def test_ask_maps_upstream_failure_to_503(monkeypatch: pytest.MonkeyPatch) -> None:
    get_settings.cache_clear()
    get_ask_service.cache_clear()
    monkeypatch.setenv("RAG_INTERNAL_KEY", INTERNAL_KEY)
    get_settings.cache_clear()

    fake = FakeAskService(error=RuntimeError("pinecone down"))
    app = create_app()
    app.dependency_overrides[get_ask_service] = lambda: fake
    with TestClient(app) as test_client:
        response = test_client.post(
            "/ask",
            json={"question": "What is PCV?"},
            headers=_headers(),
        )
    app.dependency_overrides.clear()
    get_ask_service.cache_clear()
    get_settings.cache_clear()

    assert response.status_code == 503
    body = response.json()
    assert body["code"] == "service_unavailable"
    assert body["status"] == "error"
    assert "unavailable" in body["message"].lower()


def test_ask_rejects_blank_question(client: TestClient) -> None:
    response = client.post(
        "/ask",
        json={"question": "   "},
        headers=_headers(),
    )
    assert response.status_code == 400
    assert response.json()["code"] == "validation_error"


def test_ask_rejects_oversized_question(client: TestClient) -> None:
    response = client.post(
        "/ask",
        json={"question": "x" * 2001},
        headers=_headers(),
    )
    assert response.status_code == 400
    assert response.json()["code"] == "validation_error"


def test_health_remains_public(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "vaxify-rag"
