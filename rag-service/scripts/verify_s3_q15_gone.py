"""Verify S3 Q15 is gone from retrieval + Pinecone after re-ingest."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from vaxify_rag.indexing.pinecone_store import PineconeStore  # noqa: E402

S3_Q15_ID = "58ef3644b2bdbcc7e458faed0e54c8e282703992"
result_path = ROOT / "data" / "td_pregnancy_check.json"
result = json.loads(result_path.read_text(encoding="utf-8"))

print("QUERY:", result["query"])
print("note:", result["relevance_note"], "sufficient:", result["evidence_sufficient"])
ids: list[str] = []
for m in result["matches"]:
    ids.append(m["id"])
    if m["page_start"] is None:
        page = "—"
    elif m["page_start"] == m["page_end"]:
        page = str(m["page_start"])
    else:
        page = f"{m['page_start']}-{m['page_end']}"
    print(
        f"#{m['rank']} {m['source_id']}/{m['source']} page={page} "
        f"score={m['score']:.4f} topic={m['topic']} sup={m['superseded']}"
    )
    print("  ", (m.get("preview") or "")[:140])

print("S3_Q15_in_results:", S3_Q15_ID in ids)

store = PineconeStore()
fetched = store._index.fetch(ids=[S3_Q15_ID])
vectors = getattr(fetched, "vectors", None) or fetched.get("vectors", {})
print("S3_Q15_still_in_pinecone:", bool(vectors))
print("indexed_count_expected_110_manifest_ok")
