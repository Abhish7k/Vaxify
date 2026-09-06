"""Content hashing for corpus idempotency."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from vaxify_rag.config import get_settings, get_sources_config


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(65536), b""):
            digest.update(block)
    return digest.hexdigest()


def compute_source_hashes(kb_path: Path | None = None) -> dict[str, str]:
    kb_path = kb_path or get_settings().knowledge_base_path
    sources = get_sources_config().get("sources", {})
    hashes: dict[str, str] = {}
    for source_id, cfg in sorted(sources.items()):
        disk_path = kb_path / cfg["disk_path"]
        if disk_path.exists():
            hashes[source_id] = hash_file(disk_path)
    return hashes


def compute_corpus_hash(source_hashes: dict[str, str], ingestion_version: str) -> str:
    payload = json.dumps(
        {"ingestion_version": ingestion_version, "sources": source_hashes},
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
