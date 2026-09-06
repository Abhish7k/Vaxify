"""Application configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

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

    min_page_chars: int = 30
    min_chunk_chars: int = 40


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
