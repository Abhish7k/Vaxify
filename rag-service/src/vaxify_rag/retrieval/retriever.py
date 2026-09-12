"""Phase 2A retrieval: embed query → Pinecone top-k (no LLM generation)."""

from __future__ import annotations

from typing import Any

from vaxify_rag.config import get_settings
from vaxify_rag.embedding.google_embedder import GeminiEmbedder
from vaxify_rag.indexing.pinecone_store import PineconeStore
from vaxify_rag.logging import get_logger
from vaxify_rag.models.retrieval import RetrievedChunk, RetrievalResult

logger = get_logger(__name__)

# Hard filter: only production-safe chunks (ingestion already excludes these,
# but filter again at query time as a safety net).
DEFAULT_METADATA_FILTER: dict[str, Any] = {
    "superseded": {"$eq": False},
    "retrievable": {"$eq": True},
}


def _optional_page(value: Any) -> int | None:
    if value is None:
        return None
    try:
        page = int(value)
    except (TypeError, ValueError):
        return None
    return None if page < 0 else page


def _match_to_chunk(rank: int, match: dict[str, Any]) -> RetrievedChunk:
    meta = match.get("metadata") or {}
    return RetrievedChunk(
        rank=rank,
        id=str(match.get("id") or ""),
        score=float(match.get("score") or 0.0),
        text=str(meta.get("text") or ""),
        source=str(meta.get("source") or ""),
        source_path=str(meta.get("source_path") or ""),
        source_id=str(meta.get("source_id") or ""),
        source_type=str(meta.get("source_type") or ""),
        publisher=str(meta.get("publisher") or ""),
        region=str(meta.get("region") or ""),
        doc_date=str(meta.get("doc_date") or ""),
        capture_date=str(meta.get("capture_date") or ""),
        chapter=str(meta.get("chapter") or ""),
        section=str(meta.get("section") or ""),
        page_start=_optional_page(meta.get("page_start")),
        page_end=_optional_page(meta.get("page_end")),
        topic=str(meta.get("topic") or ""),
        audience=str(meta.get("audience") or ""),
        superseded=bool(meta.get("superseded", False)),
        retrievable=bool(meta.get("retrievable", True)),
        authority_rank=int(meta.get("authority_rank") or 99),
        chunk_index=int(meta.get("chunk_index") or 0),
        total_chunks=int(meta.get("total_chunks") or 0),
        ingestion_version=str(meta.get("ingestion_version") or ""),
        embedding_model=str(meta.get("embedding_model") or ""),
    )


def rerank_by_authority(
    matches: list[dict[str, Any]],
    *,
    score_tie_epsilon: float,
) -> list[dict[str, Any]]:
    """Stable sort: primary = score desc; near-ties broken by lower authority_rank."""

    def sort_key(match: dict[str, Any]) -> tuple:
        score = float(match.get("score") or 0.0)
        meta = match.get("metadata") or {}
        authority = int(meta.get("authority_rank") or 99)
        # Bucket scores so near-equals are broken by authority.
        bucket = round(score / max(score_tie_epsilon, 1e-6))
        return (-bucket, authority, -score)

    return sorted(matches, key=sort_key)


class Retriever:
    """Embed a query with the Phase 1 Gemini config and search Pinecone."""

    def __init__(
        self,
        *,
        embedder: GeminiEmbedder | None = None,
        store: PineconeStore | None = None,
    ) -> None:
        self.settings = get_settings()
        self.embedder = embedder or GeminiEmbedder()
        self.store = store or PineconeStore()

    def retrieve(
        self,
        query: str,
        *,
        top_k: int | None = None,
        metadata_filter: dict[str, Any] | None = None,
        apply_authority_rerank: bool = True,
    ) -> RetrievalResult:
        query = (query or "").strip()
        if not query:
            raise ValueError("query must be non-empty")

        k = top_k or self.settings.retrieval_top_k
        if k < 1:
            raise ValueError("top_k must be >= 1")

        filt = metadata_filter if metadata_filter is not None else dict(DEFAULT_METADATA_FILTER)

        logger.info("retrieve_start", query=query[:120], top_k=k)
        vectors = self.embedder.embed_texts([query], batch_size=1)
        query_vector = vectors[0]

        # Fetch a slightly larger pool when re-ranking so authority can surface.
        fetch_k = k if not apply_authority_rerank else min(max(k * 2, k), 20)
        raw_matches = self.store.query(
            query_vector,
            top_k=fetch_k,
            filter=filt,
            include_metadata=True,
        )

        if apply_authority_rerank:
            raw_matches = rerank_by_authority(
                raw_matches,
                score_tie_epsilon=self.settings.retrieval_score_tie_epsilon,
            )

        raw_matches = raw_matches[:k]
        chunks = [_match_to_chunk(rank=i, match=m) for i, m in enumerate(raw_matches, start=1)]

        # Belt-and-suspenders: drop anything that slipped past the filter.
        chunks = [c for c in chunks if c.retrievable and not c.superseded]
        for i, chunk in enumerate(chunks, start=1):
            chunk.rank = i

        logger.info(
            "retrieve_done",
            query=query[:120],
            match_count=len(chunks),
            top_score=chunks[0].score if chunks else None,
            top_source=chunks[0].source if chunks else None,
        )

        return RetrievalResult(
            query=query,
            top_k=k,
            matches=chunks,
            filter_applied=filt,
        )
