"""Application configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_KB_PATH = PACKAGE_ROOT / "knowledge-base"
DEFAULT_CONFIG_PATH = PACKAGE_ROOT / "config"
DEFAULT_DATA_PATH = PACKAGE_ROOT / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index_name: str = "vaxify-kb-v1"

    embedding_model: str = "gemini-embedding-001"
    embedding_dimension: int = 768
    # Free tier is 100 embed_content units/minute; keep headroom and pace batches.
    embedding_batch_size: int = 16
    embedding_max_per_minute: int = 80
    embedding_max_retries: int = 10
    embedding_retry_default_seconds: float = 60.0
    embedding_retry_max_seconds: float = 120.0

    ingestion_version: str = "1.0.0"
    knowledge_base_path: Path = Field(default=DEFAULT_KB_PATH)
    data_path: Path = Field(default=DEFAULT_DATA_PATH)
    config_path: Path = Field(default=DEFAULT_CONFIG_PATH)

    log_level: str = "INFO"
    port: int = 8001
    # Shared secret for Spring Boot → RAG service calls (header: X-RAG-Internal-Key)
    rag_internal_key: str = ""

    min_page_chars: int = 30
    min_chunk_chars: int = 40

    # Phase 2A retrieval
    retrieval_top_k: int = 5
    retrieval_score_tie_epsilon: float = 0.02

    # Phase 2B generation (Groq / Qwen)
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.6-27b"
    generation_temperature: float = 0.1
    generation_max_output_tokens: int = 1024
    generation_timeout_seconds: float = 60.0
    generation_max_retries: int = 5
    # Answerability: multi-signal (not a single arbitrary threshold)
    answerability_min_top_score: float = 0.55
    answerability_strong_top_score: float = 0.70
    answerability_min_term_overlap: float = 0.4
    generation_max_context_chunks: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


@lru_cache
def get_sources_config() -> dict[str, Any]:
    return load_yaml(get_settings().config_path / "sources.yaml")


@lru_cache
def get_precedence_config() -> dict[str, Any]:
    return load_yaml(get_settings().config_path / "precedence.yaml")


@lru_cache
def get_superseded_config() -> dict[str, Any]:
    return load_yaml(get_settings().config_path / "superseded_rules.yaml")


def _optional_text(value: object) -> str | None:
    if value is None:
        return None
    text = value if isinstance(value, str) else str(value)
    cleaned = text.strip()
    return cleaned or None


def trusted_https_url(value: object) -> str | None:
    """Absolute HTTPS URL from trusted config, or None. Never raises."""
    if not isinstance(value, str):
        return None
    url = value.strip()
    if not url or any(char.isspace() for char in url):
        return None
    try:
        parsed = urlparse(url)
    except ValueError:
        return None
    if parsed.scheme != "https" or not parsed.netloc or not parsed.hostname:
        return None
    return url


def lookup_source_provenance(source_id: str) -> dict[str, str | None]:
    """Title, publisher, document date, and source URL from sources.yaml.

    Keyed by stable source_id (S1–S8). Missing or malformed URLs are omitted.
    Never substitutes a landing page, and never reads model output.
    """
    empty: dict[str, str | None] = {
        "title": None,
        "source_url": None,
        "publisher": None,
        "document_date": None,
    }
    try:
        sources = get_sources_config().get("sources") or {}
        entry = sources.get(source_id)
        if not isinstance(entry, dict):
            return empty
        return {
            "title": _optional_text(entry.get("title")),
            "source_url": trusted_https_url(entry.get("source_url")),
            "publisher": _optional_text(entry.get("publisher")),
            "document_date": _optional_text(entry.get("doc_date")),
        }
    except Exception:  # noqa: BLE001 — provenance lookup must not fail the answer
        return empty
