"""Build full ChunkRecord metadata from raw chunks."""

from __future__ import annotations

from typing import Any

from vaxify_rag.config import get_precedence_config, get_settings
from vaxify_rag.chunking.faq_chunker import infer_question_number
from vaxify_rag.enrichment.superseded_tagger import apply_superseded_rules
from vaxify_rag.enrichment.topic_classifier import classify_topic
from vaxify_rag.indexing.id_generator import make_chunk_id
from vaxify_rag.models.chunk import Audience, ChunkRecord, RawChunk, SourceType, Topic


def authority_rank_for(source_id: str, topic: Topic) -> int:
    precedence = get_precedence_config()
    topic_ranks: dict[str, int] = precedence.get("topics", {}).get(topic, {})
    return topic_ranks.get(source_id, precedence.get("default_rank", 5))


def build_chunk_records(
    raw_chunks: list[RawChunk],
    source_id: str,
    source_cfg: dict[str, Any],
) -> list[ChunkRecord]:
    settings = get_settings()
    default_topic: Topic = source_cfg.get("default_topic", "immunity")
    audience: Audience = source_cfg.get("audience", "public")
    source_type: SourceType = source_cfg.get("source_type", "PDF")

    doc_date = source_cfg.get("doc_date")
    capture_date = source_cfg.get("capture_date")

    records: list[ChunkRecord] = []
    total = len(raw_chunks)

    for index, raw in enumerate(raw_chunks, start=1):
        if raw.question_number is None:
            raw.question_number = infer_question_number(raw.section, raw.question)
        topic = classify_topic(raw, default_topic=default_topic)
        superseded = apply_superseded_rules(raw, source_id)

        record = ChunkRecord(
            id=make_chunk_id(source_cfg["source_path"], index),
            text=raw.text,
            source=source_cfg["source"],
            source_path=source_cfg["source_path"],
            source_type=source_type,
            publisher=source_cfg["publisher"],
            region=source_cfg["region"],
            doc_date=doc_date,
            capture_date=capture_date,
            chapter=raw.chapter or source_cfg.get("chapter"),
            section=raw.section or raw.question,
            page_start=raw.page_start,
            page_end=raw.page_end,
            topic=topic,
            audience=audience,
            superseded=superseded,
            retrievable=raw.retrievable,
            authority_rank=authority_rank_for(source_id, topic),
            chunk_index=index,
            total_chunks=total,
            source_id=source_id,
            question_number=raw.question_number,
            ingestion_version=settings.ingestion_version,
            embedding_model=settings.embedding_model,
        )
        records.append(record)

    return records
