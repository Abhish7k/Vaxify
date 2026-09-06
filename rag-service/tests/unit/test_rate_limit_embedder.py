"""Tests for Gemini embedder rate limiting and 429 handling."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from vaxify_rag.config import get_settings
from vaxify_rag.embedding.google_embedder import (
    GeminiEmbedder,
    SlidingWindowRateLimiter,
    is_rate_limit_error,
    parse_retry_delay_seconds,
)


class FakeAPIError(Exception):
    def __init__(self, code: int, message: str, details=None, status: str = "ERROR"):
        self.code = code
        self.message = message
        self.status = status
        self.details = details if details is not None else {"message": message}
        super().__init__(f"{code} {status}. {message}")


class FakeModels:
    def __init__(self, responses=None, errors_before_success=0, error=None):
        self.calls: list[list[str]] = []
        self.responses = responses or []
        self.errors_before_success = errors_before_success
        self.error = error or FakeAPIError(
            429,
            "Quota exceeded. Please retry in 42.5s.",
        )
        self._failures_remaining = errors_before_success

    def embed_content(self, *, model, contents, config=None):
        self.calls.append(list(contents))
        if self._failures_remaining > 0:
            self._failures_remaining -= 1
            raise self.error
        # Return one embedding per content
        dim = get_settings().embedding_dimension
        return SimpleNamespace(
            embeddings=[
                SimpleNamespace(values=[0.1] * dim) for _ in contents
            ]
        )


class FakeClient:
    def __init__(self, models: FakeModels):
        self.models = models


def test_parse_retry_delay_from_message():
    err = FakeAPIError(429, "Please retry in 42.5s")
    assert parse_retry_delay_seconds(err, default=60.0) == 42.5


def test_parse_retry_delay_from_details_dict():
    err = FakeAPIError(
        429,
        "RESOURCE_EXHAUSTED",
        details={"error": {"details": [{"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": "55s"}]}},
    )
    assert parse_retry_delay_seconds(err, default=60.0) == 55.0


def test_parse_retry_delay_falls_back_to_default():
    err = FakeAPIError(429, "no delay here")
    assert parse_retry_delay_seconds(err, default=60.0) == 60.0


def test_is_rate_limit_error():
    assert is_rate_limit_error(FakeAPIError(429, "quota", status="RESOURCE_EXHAUSTED"))
    assert not is_rate_limit_error(FakeAPIError(500, "boom", status="INTERNAL"))


def test_sliding_window_waits_when_over_budget():
    sleeps: list[float] = []
    limiter = SlidingWindowRateLimiter(max_per_minute=10, window_seconds=60.0)
    limiter.record(8)

    # Advance time artificially by monkeypatching monotonic via wait loop —
    # record enough that next request must wait, then simulate pruning by
    # injecting an old event timestamp.
    limiter._events.clear()
    limiter._events.append((0.0, 10))  # entire budget used at t=0

    # Force "now" by patching through wait: replace prune behavior using sleep callback
    # We'll call wait with a sleep that also advances fake time by mutating events.
    import time as time_mod

    original = time_mod.monotonic
    state = {"now": 10.0}

    def fake_monotonic():
        return state["now"]

    def fake_sleep(seconds):
        sleeps.append(seconds)
        state["now"] += seconds

    time_mod.monotonic = fake_monotonic  # type: ignore[assignment]
    try:
        limiter.wait_for_capacity(1, sleep_fn=fake_sleep)
    finally:
        time_mod.monotonic = original  # type: ignore[assignment]

    assert sleeps
    assert sleeps[0] == pytest.approx(50.0, rel=0.01)


def test_embed_batch_retries_429_with_server_delay(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("EMBEDDING_MAX_PER_MINUTE", "100")
    monkeypatch.setenv("EMBEDDING_BATCH_SIZE", "4")
    monkeypatch.setenv("EMBEDDING_MAX_RETRIES", "5")
    monkeypatch.setenv("EMBEDDING_RETRY_DEFAULT_SECONDS", "60")
    get_settings.cache_clear()

    sleeps: list[float] = []
    models = FakeModels(errors_before_success=1)
    embedder = GeminiEmbedder(client=FakeClient(models), sleep_fn=sleeps.append)

    vectors = embedder.embed_batch(["a", "b"])
    assert len(vectors) == 2
    assert len(models.calls) == 2  # fail once, then succeed
    assert sleeps
    assert sleeps[0] == pytest.approx(42.5, rel=0.01)
    get_settings.cache_clear()


def test_embed_texts_batches_without_one_request_per_chunk(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("EMBEDDING_MAX_PER_MINUTE", "100")
    monkeypatch.setenv("EMBEDDING_BATCH_SIZE", "4")
    get_settings.cache_clear()

    models = FakeModels()
    embedder = GeminiEmbedder(client=FakeClient(models), sleep_fn=lambda _s: None)
    texts = [f"t{i}" for i in range(10)]
    vectors = embedder.embed_texts(texts)
    assert len(vectors) == 10
    assert len(models.calls) == 3  # 4 + 4 + 2
    assert models.calls[0] == ["t0", "t1", "t2", "t3"]
    get_settings.cache_clear()


def test_embedding_config_rate_limit_defaults():
    get_settings.cache_clear()
    settings = get_settings()
    assert settings.embedding_model == "gemini-embedding-001"
    assert settings.embedding_dimension == 768
    assert settings.embedding_batch_size == 16
    assert settings.embedding_max_per_minute == 80
    assert settings.embedding_max_retries >= 5
    assert settings.embedding_retry_default_seconds >= 30
