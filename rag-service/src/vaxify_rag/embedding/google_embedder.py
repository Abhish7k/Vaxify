"""Google Gemini embedding client with free-tier rate limiting."""

from __future__ import annotations

import math
import re
import time
from collections import deque
from typing import Any, Sequence

from google import genai
from google.genai import types

from vaxify_rag.config import get_settings
from vaxify_rag.logging import get_logger

logger = get_logger(__name__)

# Matches "Please retry in 42.5s", "retry in 20 seconds", retryDelay "42s"
_RETRY_DELAY_RE = re.compile(
    r"(?:retry(?:\s+delay)?(?:\s+in)?|retryDelay)[\"'\s:=]*([0-9]+(?:\.[0-9]+)?)\s*s",
    re.IGNORECASE,
)


def l2_normalize(vector: Sequence[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in vector))
    if norm == 0:
        return list(vector)
    return [v / norm for v in vector]


def parse_retry_delay_seconds(error: BaseException, default: float) -> float:
    """Extract server-provided retry delay from a Gemini API error when present."""
    candidates: list[str] = [str(error)]
    details = getattr(error, "details", None)
    if details is not None:
        candidates.append(str(details))
    message = getattr(error, "message", None)
    if message:
        candidates.append(str(message))

    for text in candidates:
        match = _RETRY_DELAY_RE.search(text)
        if match:
            return max(float(match.group(1)), 1.0)

        # Google RetryInfo style: {'retryDelay': '42s'} nested in details
        if isinstance(details, dict):
            delay = _retry_delay_from_mapping(details)
            if delay is not None:
                return max(delay, 1.0)

    return max(default, 1.0)


def _retry_delay_from_mapping(obj: Any) -> float | None:
    if not isinstance(obj, dict):
        return None
    for key, value in obj.items():
        if str(key).lower() in {"retrydelay", "retry_delay"} and value is not None:
            text = str(value)
            match = re.search(r"([0-9]+(?:\.[0-9]+)?)", text)
            if match:
                return float(match.group(1))
        nested = _retry_delay_from_mapping(value) if isinstance(value, dict) else None
        if nested is not None:
            return nested
        if isinstance(value, list):
            for item in value:
                nested = _retry_delay_from_mapping(item)
                if nested is not None:
                    return nested
    return None


def is_rate_limit_error(error: BaseException) -> bool:
    code = getattr(error, "code", None)
    if code == 429:
        return True
    text = str(error).upper()
    return "429" in text or "RESOURCE_EXHAUSTED" in text or "RATE LIMIT" in text


class SlidingWindowRateLimiter:
    """Limit how many units (embedded contents) may be sent per rolling minute."""

    def __init__(self, max_per_minute: int, window_seconds: float = 60.0) -> None:
        if max_per_minute < 1:
            raise ValueError("max_per_minute must be >= 1")
        self.max_per_minute = max_per_minute
        self.window_seconds = window_seconds
        self._events: deque[tuple[float, int]] = deque()

    def _prune(self, now: float) -> None:
        cutoff = now - self.window_seconds
        while self._events and self._events[0][0] < cutoff:
            self._events.popleft()

    def current_usage(self, now: float | None = None) -> int:
        now = time.monotonic() if now is None else now
        self._prune(now)
        return sum(count for _, count in self._events)

    def wait_for_capacity(self, units: int, sleep_fn=time.sleep) -> None:
        if units > self.max_per_minute:
            raise ValueError(
                f"Batch of {units} exceeds EMBEDDING_MAX_PER_MINUTE={self.max_per_minute}"
            )
        while True:
            now = time.monotonic()
            self._prune(now)
            usage = sum(count for _, count in self._events)
            if usage + units <= self.max_per_minute:
                return
            oldest_ts, _ = self._events[0]
            sleep_for = max(oldest_ts + self.window_seconds - now, 0.05)
            logger.info(
                "embedding_rate_limit_wait",
                sleep_seconds=round(sleep_for, 2),
                usage=usage,
                requested=units,
                max_per_minute=self.max_per_minute,
            )
            sleep_fn(sleep_for)

    def record(self, units: int) -> None:
        self._events.append((time.monotonic(), units))


class GeminiEmbedder:
    def __init__(
        self,
        *,
        client: Any | None = None,
        sleep_fn=time.sleep,
    ) -> None:
        settings = get_settings()
        if client is None and not settings.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required for embedding")
        self._client = client or genai.Client(api_key=settings.google_api_key)
        self.model = settings.embedding_model
        self.dimension = settings.embedding_dimension
        self.batch_size = settings.embedding_batch_size
        self.max_retries = settings.embedding_max_retries
        self.default_retry_seconds = settings.embedding_retry_default_seconds
        self.retry_max_seconds = settings.embedding_retry_max_seconds
        self._sleep = sleep_fn
        self._limiter = SlidingWindowRateLimiter(settings.embedding_max_per_minute)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        if len(texts) > self.batch_size:
            raise ValueError(
                f"embed_batch received {len(texts)} texts; max batch_size is {self.batch_size}"
            )

        last_error: BaseException | None = None
        for attempt in range(1, self.max_retries + 1):
            self._limiter.wait_for_capacity(len(texts), sleep_fn=self._sleep)
            try:
                response = self._client.models.embed_content(
                    model=self.model,
                    contents=texts,
                    config=types.EmbedContentConfig(output_dimensionality=self.dimension),
                )
                self._limiter.record(len(texts))
                return self._vectors_from_response(response)
            except Exception as exc:  # noqa: BLE001 - narrow below
                last_error = exc
                if not is_rate_limit_error(exc) or attempt >= self.max_retries:
                    raise

                delay = parse_retry_delay_seconds(exc, self.default_retry_seconds)
                delay = min(max(delay, 1.0), self.retry_max_seconds)
                logger.warning(
                    "embedding_rate_limited",
                    attempt=attempt,
                    max_retries=self.max_retries,
                    sleep_seconds=delay,
                    error=str(exc)[:300],
                )
                self._sleep(delay)

        assert last_error is not None
        raise last_error

    def _vectors_from_response(self, response: Any) -> list[list[float]]:
        embeddings = response.embeddings or []
        vectors: list[list[float]] = []
        for item in embeddings:
            values = list(item.values or [])
            if len(values) != self.dimension:
                raise ValueError(
                    f"Expected embedding dimension {self.dimension}, got {len(values)}"
                )
            vectors.append(l2_normalize(values))
        return vectors

    def embed_texts(self, texts: list[str], batch_size: int | None = None) -> list[list[float]]:
        size = batch_size or self.batch_size
        if size < 1:
            raise ValueError("batch_size must be >= 1")
        # Free-tier safety: never send a batch larger than the per-minute budget.
        size = min(size, self._limiter.max_per_minute)

        all_vectors: list[list[float]] = []
        total_batches = (len(texts) + size - 1) // size if texts else 0
        for index, start in enumerate(range(0, len(texts), size), start=1):
            batch = texts[start : start + size]
            logger.info(
                "embedding_batch",
                batch=index,
                total_batches=total_batches,
                batch_size=len(batch),
            )
            vectors = self.embed_batch(batch)
            if len(vectors) != len(batch):
                raise ValueError(
                    f"Expected {len(batch)} embeddings, got {len(vectors)}"
                )
            all_vectors.extend(vectors)
        return all_vectors
