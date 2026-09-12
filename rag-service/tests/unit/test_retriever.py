"""Unit tests for Phase 2A retrieval (mocked Pinecone + embedder)."""

from __future__ import annotations

from vaxify_rag.config import get_settings
from vaxify_rag.models.retrieval import RetrievedChunk
from vaxify_rag.retrieval.retriever import (
    DEFAULT_METADATA_FILTER,
    Retriever,
    _match_to_chunk,
    rerank_by_authority,
)


class FakeEmbedder:
    def embed_texts(self, texts, batch_size=None):
        assert len(texts) == 1
        dim = get_settings().embedding_dimension
        return [[0.01] * dim]


class FakeStore:
    def __init__(self, matches):
        self.matches = matches
        self.last_query = None

    def query(self, vector, *, top_k=5, filter=None, include_metadata=True):
        self.last_query = {
            "vector_len": len(vector),
            "top_k": top_k,
            "filter": filter,
            "include_metadata": include_metadata,
        }
        return list(self.matches)[:top_k]


def _meta(**overrides):
    base = {
        "text": "BCG, OPV-0 and Hepatitis B birth dose are given at birth.",
        "source": "National_Immunization_Schedule",
        "source_path": "india/National_ Immunization_Schedule.pdf",
        "source_id": "S5",
        "source_type": "PDF",
        "publisher": "MoHFW",
        "region": "india",
        "doc_date": "2020-05-29",
        "capture_date": "",
        "chapter": "NIS",
        "section": "Age-wise schedule",
        "page_start": 1,
        "page_end": 1,
        "topic": "schedule",
        "audience": "public",
        "superseded": False,
        "retrievable": True,
        "authority_rank": 1,
        "chunk_index": 1,
        "total_chunks": 4,
        "ingestion_version": "1.0.0",
        "embedding_model": "gemini-embedding-001",
    }
    base.update(overrides)
    return base


def test_default_filter_excludes_superseded_and_non_retrievable():
    assert DEFAULT_METADATA_FILTER["superseded"] == {"$eq": False}
    assert DEFAULT_METADATA_FILTER["retrievable"] == {"$eq": True}


def test_match_to_chunk_maps_provenance():
    chunk = _match_to_chunk(
        1,
        {"id": "abc", "score": 0.91, "metadata": _meta()},
    )
    assert isinstance(chunk, RetrievedChunk)
    assert chunk.id == "abc"
    assert chunk.score == 0.91
    assert chunk.source == "National_Immunization_Schedule"
    assert chunk.page_start == 1
    assert chunk.topic == "schedule"
    assert chunk.superseded is False
    assert chunk.authority_rank == 1


def test_rerank_prefers_higher_authority_on_near_tie():
    matches = [
        {"id": "s2", "score": 0.801, "metadata": _meta(source_id="S2", authority_rank=3)},
        {"id": "s5", "score": 0.800, "metadata": _meta(source_id="S5", authority_rank=1)},
    ]
    ranked = rerank_by_authority(matches, score_tie_epsilon=0.02)
    assert ranked[0]["id"] == "s5"


def test_retriever_applies_filter_and_drops_superseded(monkeypatch):
    get_settings.cache_clear()
    matches = [
        {"id": "good", "score": 0.88, "metadata": _meta()},
        {
            "id": "bad",
            "score": 0.99,
            "metadata": _meta(superseded=True, source="FAQ_Parents", source_id="S1"),
        },
    ]
    store = FakeStore(matches)
    retriever = Retriever(embedder=FakeEmbedder(), store=store)
    result = retriever.retrieve("What vaccines are given at birth?", top_k=5)

    assert store.last_query["filter"] == DEFAULT_METADATA_FILTER
    assert store.last_query["vector_len"] == get_settings().embedding_dimension
    assert len(result.matches) == 1
    assert result.matches[0].id == "good"
    assert result.matches[0].superseded is False
    assert result.evidence_sufficient is True
    get_settings.cache_clear()


def test_evidence_sufficient_threshold():
    from vaxify_rag.models.retrieval import RetrievalResult, RetrievedChunk

    weak = RetrievedChunk(
        rank=1,
        id="x",
        score=0.50,
        text="unrelated",
        source="s",
        source_path="",
        source_id="",
        source_type="PDF",
        publisher="",
        region="",
        doc_date="",
        capture_date="",
        chapter="",
        section="",
        page_start=1,
        page_end=1,
        topic="schedule",
        audience="public",
        superseded=False,
        retrievable=True,
        authority_rank=1,
        chunk_index=1,
        total_chunks=1,
        ingestion_version="",
        embedding_model="",
    )
    result = RetrievalResult(
        query="q",
        top_k=1,
        matches=[weak],
        filter_applied={},
    )
    assert result.evidence_sufficient is False


def test_empty_query_raises():
    retriever = Retriever(embedder=FakeEmbedder(), store=FakeStore([]))
    try:
        retriever.retrieve("   ")
        assert False, "expected ValueError"
    except ValueError:
        pass

