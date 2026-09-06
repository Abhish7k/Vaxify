"""Inspect dry-run chunk quality."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

CHUNKS = ROOT / "data" / "chunks" / "latest.jsonl"


def main() -> int:
    records = [json.loads(line) for line in CHUNKS.read_text(encoding="utf-8").splitlines() if line.strip()]
    by: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        by[r["source_id"]].append(r)

    issues: list[str] = []

    for sid in sorted(by):
        chunks = by[sid]
        print(f"\n{'='*60}\n{sid}: {len(chunks)} chunks\n{'='*60}")
        for label, idx in [("first", 0), ("mid", len(chunks) // 2), ("last", -1)]:
            if len(chunks) < 3 and label == "mid":
                continue
            c = chunks[idx]
            print(f"\n--- {label} #{c['chunk_index']} sup={c['superseded']} topic={c['topic']} "
                  f"pages={c['page_start']}-{c['page_end']} ---")
            print(f"section: {c.get('section', '')[:120]}")
            text = c["text"]
            print(f"len={len(text)}")
            print(text[:500])
            if len(text) < 60:
                issues.append(f"{sid} chunk {c['chunk_index']}: very short ({len(text)} chars)")
            if "\n\n" not in text and sid in ("S1", "S3", "S8"):
                issues.append(f"{sid} chunk {c['chunk_index']}: missing Q/A separator")

        # per-source checks
        nums = [c.get("question_number") for c in chunks if c.get("question_number")]
        if sid in ("S1", "S3"):
            dup_nums = [n for n in nums if nums.count(n) > 1]
            if dup_nums:
                issues.append(f"{sid}: duplicate question numbers: {set(dup_nums)}")

    print(f"\n\n{'='*60}\nISSUE SCAN\n{'='*60}")
    for r in records:
        t = r["text"]
        if len(t.strip()) < 40:
            issues.append(f"{r['source_id']} #{r['chunk_index']}: under 40 chars")
        if re.search(r"\?\d+\.", t[:80]):
            issues.append(f"{r['source_id']} #{r['chunk_index']}: embedded question number in text")
        if t.count("Ans:-") > 1:
            issues.append(f"{r['source_id']} #{r['chunk_index']}: multiple Ans:- blocks merged")
        if sid := r["source_id"]:
            pass

    # superseded check
    sup = [r for r in records if r["superseded"]]
    print(f"Superseded: {len(sup)}")
    for r in sup:
        print(f"  {r['source_id']} Q{r.get('question_number')} pages={r['page_start']}-{r['page_end']} "
              f"{(r.get('section') or '')[:60]}")

  # duplicate text
    seen: dict[str, str] = {}
    for r in records:
        key = re.sub(r"\s+", " ", r["text"][:200].lower())
        if key in seen and seen[key] != r["source_id"]:
            issues.append(f"Duplicate text across {seen[key]} and {r['source_id']}")
        seen[key] = r["source_id"]

    if issues:
        print("\nPROBLEMS:")
        for i in sorted(set(issues)):
            print(f"  - {i}")
    else:
        print("\nNo automated issues found.")

    oversized = [r for r in records if len(r["text"]) > 4500]
    if oversized:
        print("\nOVERSIZED CHUNKS (>4500 chars):")
        for r in oversized:
            print(f"  {r['source_id']} #{r['chunk_index']}: {len(r['text'])} chars")

    print(f"\nTotal: {len(records)}, indexable: {sum(1 for r in records if r['retrievable'] and not r['superseded'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
