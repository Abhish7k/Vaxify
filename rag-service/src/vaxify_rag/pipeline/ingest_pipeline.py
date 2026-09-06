"""Ingestion pipeline orchestrator."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from vaxify_rag.chunking.registry import chunk_source
from vaxify_rag.config import get_settings, get_sources_config
from vaxify_rag.embedding.google_embedder import GeminiEmbedder
from vaxify_rag.enrichment.metadata_builder import build_chunk_records
from vaxify_rag.indexing.corpus_hash import compute_corpus_hash, compute_source_hashes
from vaxify_rag.indexing.pinecone_store import PineconeStore
from vaxify_rag.logging import get_logger
from vaxify_rag.models.chunk import ChunkRecord, IngestManifest

logger = get_logger(__name__)


def _chunk_record_to_dict(record: ChunkRecord) -> dict[str, Any]:
    data = asdict(record)
    return data


def _load_manifest(path: Path) -> IngestManifest | None:
    if not path.exists():
        return None
    with path.open(encoding="utf-8") as handle:
        return IngestManifest.from_dict(json.load(handle))


def _save_manifest(path: Path, manifest: IngestManifest) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(manifest.to_dict(), handle, indent=2)


def _save_chunks_jsonl(path: Path, records: list[ChunkRecord]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(_chunk_record_to_dict(record), ensure_ascii=False) + "\n")


def extract_and_chunk_all() -> list[ChunkRecord]:
    settings = get_settings()
    sources = get_sources_config().get("sources", {})
    all_records: list[ChunkRecord] = []

    for source_id, source_cfg in sorted(sources.items()):
        file_path = settings.knowledge_base_path / source_cfg["disk_path"]
        if not file_path.exists():
            raise FileNotFoundError(f"Missing corpus file for {source_id}: {file_path}")

        raw_chunks = chunk_source(source_id, source_cfg, file_path)
        if not raw_chunks:
            logger.warning("no_chunks_produced", source_id=source_id)
            continue

        records = build_chunk_records(raw_chunks, source_id, source_cfg)
        all_records.extend(records)
        logger.info(
            "source_chunked",
            source_id=source_id,
            raw_count=len(raw_chunks),
            record_count=len(records),
        )

    return all_records


def run_ingest(
    *,
    dry_run: bool = False,
    force: bool = False,
    skip_embed: bool = False,
) -> IngestManifest:
    settings = get_settings()
    data_path = settings.data_path
    manifest_path = data_path / "manifest.json"
    chunks_path = data_path / "chunks" / "latest.jsonl"

    source_hashes = compute_source_hashes()
    corpus_hash = compute_corpus_hash(source_hashes, settings.ingestion_version)
    previous = _load_manifest(manifest_path)

    if (
        not force
        and not dry_run
        and previous
        and previous.corpus_hash == corpus_hash
        and previous.ingestion_version == settings.ingestion_version
        and previous.embedding_model == settings.embedding_model
        and previous.embedding_dimension == settings.embedding_dimension
    ):
        logger.info("ingest_skipped_unchanged", corpus_hash=corpus_hash)
        return previous

    records = extract_and_chunk_all()
    _save_chunks_jsonl(chunks_path, records)

    retrievable = [r for r in records if r.retrievable and not r.superseded]
    superseded = [r for r in records if r.superseded]

    manifest = IngestManifest(
        ingestion_version=settings.ingestion_version,
        corpus_hash=corpus_hash,
        source_hashes=source_hashes,
        embedding_model=settings.embedding_model,
        embedding_dimension=settings.embedding_dimension,
        chunk_ids=[r.id for r in records],
        chunk_count=len(records),
        retrievable_count=len(retrievable),
        superseded_count=len(superseded),
    )

    logger.info(
        "ingest_summary",
        total_chunks=manifest.chunk_count,
        retrievable=manifest.retrievable_count,
        superseded=manifest.superseded_count,
        dry_run=dry_run,
    )

    if dry_run or skip_embed:
        _save_manifest(manifest_path, manifest)
        return manifest

    embedder = GeminiEmbedder()
    store = PineconeStore()

    texts = [r.embedding_text() for r in retrievable]
    vectors = embedder.embed_texts(texts)

    indexed_ids = [r.id for r in retrievable]
    previous_indexed = set(previous.indexed_chunk_ids if previous else [])
    current_indexed = set(indexed_ids)
    stale_ids = list(previous_indexed - current_indexed)

    store.upsert_chunks(retrievable, vectors)
    if stale_ids:
        store.delete_ids(stale_ids)

    manifest.indexed_chunk_ids = indexed_ids
    manifest.embedded_at = datetime.now(timezone.utc).isoformat()
    _save_manifest(manifest_path, manifest)

    return manifest


def dry_run_summary(records: list[ChunkRecord] | None = None) -> dict[str, Any]:
    records = records or extract_and_chunk_all()
    by_source: dict[str, int] = {}
    superseded_by_source: dict[str, int] = {}
    for record in records:
        by_source[record.source_id] = by_source.get(record.source_id, 0) + 1
        if record.superseded:
            superseded_by_source[record.source_id] = (
                superseded_by_source.get(record.source_id, 0) + 1
            )

    return {
        "total_chunks": len(records),
        "retrievable_indexable": sum(1 for r in records if r.retrievable and not r.superseded),
        "superseded": sum(1 for r in records if r.superseded),
        "by_source": by_source,
        "superseded_by_source": superseded_by_source,
        "sample": [
            {
                "id": r.id,
                "source_id": r.source_id,
                "topic": r.topic,
                "superseded": r.superseded,
                "section": (r.section or "")[:80],
                "text_preview": r.text[:120],
            }
            for r in records[:5]
        ],
    }
