"""Citation provenance: trusted source URLs, no public chunk text."""

from __future__ import annotations

from pathlib import Path

import pytest

from vaxify_rag.api.schemas import AskResponse
from vaxify_rag.config import get_sources_config, lookup_source_provenance, trusted_https_url
from vaxify_rag.models.answer import PUBLIC_CITATION_FIELDS, Citation
from vaxify_rag.models.retrieval import RetrievedChunk

REPO_ROOT = Path(__file__).resolve().parents[3]
MAPPING_FILE = REPO_ROOT / "docs-to-links-mapping.txt"

FILENAME_TO_SOURCE_ID = {
    "FAQ_on_Immunization_for_Parents-English": "S1",
    "FAQ_on_Immunization_for_Health_Workers-English": "S2",
    "FAQ_on_Immunization_for_other_stakeholders-English": "S3",
    "MCP_Guide_Book": "S4",
    "National_Immunization_Schedule": "S5",
    "PCV_Operational_Guidelines": "S6",
    "Td_vaccine_operational_guidelines": "S7",
    "WHO_Vaccine_Safety_QA": "S8",
}

S5_URL = (
    "https://prod-cdn.preprod.co-vin.in/uwin-prod/pdf/"
    "National+Immunization+Schedule+(NIS)+for+SRM.pdf"
)
NHM_LANDING = "https://nhm.gov.in/"

FORBIDDEN_PUBLIC_FIELDS = {
    "chunk_id",
    "score",
    "source_path",
    "preview",
    "passage",
    "authority_rank",
    "embedding_model",
    "text",
    "capture_date",
}


def _mapping_urls() -> dict[str, str]:
    mapping: dict[str, str] = {}
    name: str | None = None
    for line in MAPPING_FILE.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("https://"):
            assert name, "URL without a source name"
            mapping[name] = stripped
            name = None
            continue
        name = stripped.rstrip(":")
    return mapping


def _chunk(
    *,
    chunk_id: str = "c1",
    text: str = "At birth, BCG and Hepatitis B vaccines are given.",
    source_id: str = "S5",
    source: str = "National_Immunization_Schedule",
    publisher: str = "MoHFW",
    doc_date: str = "2020-05-29",
    capture_date: str = "",
    page_start: int | None = 2,
    page_end: int | None = 3,
    section: str = "Birth",
    topic: str = "schedule",
) -> RetrievedChunk:
    return RetrievedChunk(
        rank=1,
        id=chunk_id,
        score=0.91,
        text=text,
        source=source,
        source_path="india/not-for-the-client.pdf",
        source_id=source_id,
        source_type="PDF",
        publisher=publisher,
        region="india",
        doc_date=doc_date,
        capture_date=capture_date,
        chapter="",
        section=section,
        page_start=page_start,
        page_end=page_end,
        topic=topic,
        audience="public",
        superseded=False,
        retrievable=True,
        authority_rank=1,
        chunk_index=0,
        total_chunks=1,
        ingestion_version="1.0.0",
        embedding_model="gemini-embedding-001",
    )


def test_registry_urls_match_docs_to_links_mapping():
    expected = _mapping_urls()
    assert set(expected) == set(FILENAME_TO_SOURCE_ID)
    sources = get_sources_config()["sources"]
    for filename, source_id in FILENAME_TO_SOURCE_ID.items():
        assert sources[source_id]["source_url"] == expected[filename]
        assert sources[source_id]["source_url"] != NHM_LANDING
        assert "/Guildelines_for_immunization/" in sources[source_id]["source_url"] or source_id in {
            "S5",
            "S8",
        }


def test_s1_through_s8_resolve_direct_source_urls():
    expected = _mapping_urls()
    for filename, source_id in FILENAME_TO_SOURCE_ID.items():
        provenance = lookup_source_provenance(source_id)
        assert provenance["source_url"] == expected[filename]
        citation = Citation.from_chunk(_chunk(source_id=source_id, chunk_id=source_id))
        assert citation.source_url == expected[filename]
        assert citation.source_url != NHM_LANDING


def test_public_citation_is_provenance_only():
    long_text = (
        "At birth, BCG and Hepatitis B vaccines are given.\n\n"
        "This retrieved text stays inside the pipeline and must not appear "
        "on the public citation."
    )
    citation = Citation.from_chunk(_chunk(text=long_text))
    assert citation.passage == long_text
    public = citation.to_public_dict()
    assert "passage" not in public
    assert "preview" not in public
    assert long_text not in public.values()
    assert public["source_url"] == S5_URL
    assert public["title"] == "National Immunization Schedule"
    assert public["publisher"] == "MoHFW"
    assert set(public) == set(PUBLIC_CITATION_FIELDS)
    assert FORBIDDEN_PUBLIC_FIELDS.isdisjoint(public)


def test_missing_or_malformed_source_url_is_omitted():
    assert lookup_source_provenance("S99")["source_url"] is None
    citation = Citation.from_chunk(_chunk(source_id="S99", source="Unknown"))
    assert citation.source_url is None
    assert citation.passage
    assert trusted_https_url(None) is None
    assert trusted_https_url("http://nhm.gov.in/file.pdf") is None
    assert trusted_https_url("javascript:alert(1)") is None
    assert trusted_https_url("not a url") is None
    assert trusted_https_url("https://example.com/a b") is None
    assert lookup_source_provenance("S99")["source_url"] != NHM_LANDING


def test_missing_url_is_not_replaced_with_nhm_landing_page(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "vaxify_rag.config.get_sources_config",
        lambda: {
            "sources": {
                "S1": {
                    "title": "FAQ on Immunization for Parents",
                    "publisher": "MoHFW",
                    "doc_date": "2017-01-01",
                    "source_url": "notaurl",
                }
            }
        },
    )
    provenance = lookup_source_provenance("S1")
    assert provenance["source_url"] is None
    assert provenance["source_url"] != NHM_LANDING
    citation = Citation.from_chunk(_chunk(source_id="S1"))
    assert citation.source_url is None
    assert citation.title == "FAQ on Immunization for Parents"


def test_capture_date_is_not_presented_as_document_date():
    citation = Citation.from_chunk(
        _chunk(
            source_id="S8",
            source="WHO_Vaccine_Safety_QA",
            publisher="WHO",
            doc_date="",
            capture_date="2025-09-23",
            page_start=None,
            page_end=None,
            section="Are there side effects?",
            topic="safety",
        )
    )
    assert citation.document_date is None
    assert citation.publisher == "WHO"
    assert "2025-09-23" not in citation.to_public_dict().values()


def test_multiple_citations_keep_their_own_source_url():
    expected = _mapping_urls()
    first = Citation.from_chunk(
        _chunk(
            chunk_id="a",
            source_id="S1",
            text="Parents FAQ evidence used only inside the pipeline.",
        )
    )
    second = Citation.from_chunk(
        _chunk(
            chunk_id="b",
            source_id="S8",
            source="WHO_Vaccine_Safety_QA",
            publisher="WHO",
            doc_date="",
            text="WHO evidence used only inside the pipeline.",
            page_start=None,
            section="Are there side effects?",
        )
    )
    assert first.source_url == expected["FAQ_on_Immunization_for_Parents-English"]
    assert second.source_url == expected["WHO_Vaccine_Safety_QA"]
    assert first.source_url != second.source_url
    assert "passage" not in first.to_public_dict()
    assert "passage" not in second.to_public_dict()
    assert first.to_public_dict()["title"] != second.to_public_dict()["title"]


def test_ask_response_drops_malformed_source_url_without_failing():
    payload = {
        "query": "q",
        "status": "answered",
        "answer": "BCG is given at birth.",
        "abstention_reason": None,
        "citations": [
            {
                "source": "FAQ_Parents",
                "source_id": "S1",
                "title": "FAQ on Immunization for Parents",
                "publisher": "MoHFW",
                "document_date": "2017-01-01",
                "source_url": "javascript:alert(1)",
                "page_start": 6,
                "page_end": 6,
                "section": "Q1",
                "topic": "immunity",
                "passage": "Full passage must not be public",
                "chunk_id": "hidden",
                "score": 0.9,
                "source_path": "india/secret.pdf",
                "preview": "should not survive",
            }
        ],
        "used_chunk_ids": ["hidden"],
        "top_score": 0.9,
        "term_overlap": 0.5,
        "answerability_reason": "strong_evidence",
        "model": "test",
    }
    response = AskResponse.from_result_dict(payload)
    dumped = response.model_dump()
    citation = dumped["citations"][0]
    assert citation["source_url"] is None
    assert "passage" not in citation
    assert "preview" not in citation
    assert FORBIDDEN_PUBLIC_FIELDS.isdisjoint(citation)
    assert response.answer == "BCG is given at birth."
