"""Integration test for full corpus dry-run counts."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from vaxify_rag.pipeline.ingest_pipeline import extract_and_chunk_all  # noqa: E402


def test_full_corpus_produces_expected_chunk_volume():
    records = extract_and_chunk_all()
    by_source: dict[str, int] = {}
    for record in records:
        by_source[record.source_id] = by_source.get(record.source_id, 0) + 1

    assert len(by_source) == 8
    assert by_source["S8"] == 11
    assert by_source["S5"] >= 3
    assert 90 <= len(records) <= 130
    assert any(r.superseded for r in records)
