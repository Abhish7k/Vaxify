"""Summarize retrieval_eval.json for reporting."""

from __future__ import annotations

import json
import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "data" / "retrieval_eval.json"
data = json.loads(path.read_text(encoding="utf-8-sig"))
for item in data:
    print("=" * 60)
    print("QUERY:", item["query"])
    print("evidence_sufficient:", item["evidence_sufficient"], "| note:", item["relevance_note"])
    for m in item["matches"]:
        if m["page_start"] is None:
            page = "—"
        elif m["page_start"] == m["page_end"]:
            page = str(m["page_start"])
        else:
            page = f"{m['page_start']}-{m['page_end']}"
        print(
            f"  #{m['rank']} id={m['id'][:12]}... "
            f"src={m['source_id']}/{m['source']} page={page} "
            f"score={m['score']:.4f} topic={m['topic']} "
            f"auth={m['authority_rank']} sup={m['superseded']}"
        )
        preview = m.get("preview") or ""
        print(f"     preview: {preview[:160]}")
