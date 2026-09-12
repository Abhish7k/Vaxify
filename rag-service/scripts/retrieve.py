"""Local retrieval harness for Phase 2A (no LLM generation).

Examples:
  python scripts/retrieve.py "What vaccines are given at birth?"
  python scripts/retrieve.py --eval
  python scripts/retrieve.py --eval --top-k 5 --json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from vaxify_rag.config import get_settings  # noqa: E402
from vaxify_rag.logging import setup_logging  # noqa: E402
from vaxify_rag.models.retrieval import RetrievalResult  # noqa: E402
from vaxify_rag.retrieval.retriever import Retriever  # noqa: E402

EVAL_QUERIES = [
    "What vaccines are given at birth?",
    "When is Td given during pregnancy?",
    "What is PCV?",
    "Are vaccines safe?",
    "What should I do if a vaccine is unavailable?",
    # Expected low / insufficient evidence in this corpus
    "What is the COVID-19 booster interval for immunocompromised adults in 2026?",
]


def _format_page(chunk) -> str:
    if chunk.page_start is None and chunk.page_end is None:
        return "—"
    if chunk.page_start == chunk.page_end or chunk.page_end is None:
        return str(chunk.page_start)
    return f"{chunk.page_start}-{chunk.page_end}"


def print_result(result: RetrievalResult) -> None:
    def _out(text: str = "") -> None:
        try:
            print(text)
        except UnicodeEncodeError:
            sys.stdout.buffer.write((text + "\n").encode("utf-8", errors="replace"))

    _out("\n" + "=" * 72)
    _out(f"query: {result.query}")
    _out(
        f"matches: {len(result.matches)} | "
        f"evidence_sufficient: {result.evidence_sufficient} | "
        f"filter: {result.filter_applied}"
    )
    if not result.matches:
        _out("  (no matches)")
        return

    for chunk in result.matches:
        _out("-" * 72)
        _out(f"rank: {chunk.rank}")
        _out(f"chunk id: {chunk.id}")
        _out(f"source: {chunk.source} ({chunk.source_id})")
        _out(f"page: {_format_page(chunk)}")
        _out(f"score: {chunk.score:.4f}")
        _out(f"topic: {chunk.topic}")
        _out(f"authority_rank: {chunk.authority_rank}")
        _out(f"superseded: {chunk.superseded}")
        _out(f"retrievable: {chunk.retrievable}")
        section = (chunk.section or "")[:100]
        _out(f"section: {section}")
        _out(f"preview: {chunk.preview(200)}")


def relevance_note(result: RetrievalResult) -> str:
    if not result.matches:
        return "NO_EVIDENCE"
    top = result.matches[0]
    if top.superseded:
        return "PROBLEM_SUPERSEDED_RETURNED"
    if top.score < 0.55:
        return "LIKELY_INSUFFICIENT"
    if top.score < 0.65:
        return "WEAK_OR_AMBIGUOUS"
    return "RELEVANT_CANDIDATE"


def main() -> int:
    parser = argparse.ArgumentParser(description="Vaxify RAG retrieval harness (Phase 2A)")
    parser.add_argument("query", nargs="?", help="Natural-language question")
    parser.add_argument("--eval", action="store_true", help="Run built-in evaluation queries")
    parser.add_argument("--top-k", type=int, default=None, help="Number of results (default from settings)")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    parser.add_argument("--output", type=Path, help="Write JSON results to this file")
    parser.add_argument("--no-rerank", action="store_true", help="Disable authority_rank tie-break")
    args = parser.parse_args()

    if args.json or args.output:
        import os

        os.environ["LOG_LEVEL"] = "WARNING"
        get_settings.cache_clear()

    setup_logging()
    settings = get_settings()
    if not settings.google_api_key:
        print("GOOGLE_API_KEY is required", file=sys.stderr)
        return 1
    if not settings.pinecone_api_key:
        print("PINECONE_API_KEY is required", file=sys.stderr)
        return 1

    retriever = Retriever()
    queries = EVAL_QUERIES if args.eval else ([args.query] if args.query else [])
    if not queries:
        parser.error("Provide a query or use --eval")

    payload = []
    for query in queries:
        result = retriever.retrieve(
            query,
            top_k=args.top_k,
            apply_authority_rerank=not args.no_rerank,
        )
        note = relevance_note(result)
        if args.json or args.output:
            data = result.to_dict()
            data["relevance_note"] = note
            payload.append(data)
        else:
            print_result(result)
            print(f"relevance_note: {note}")

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        body = payload if args.eval else payload[0]
        args.output.write_text(json.dumps(body, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote {args.output}", file=sys.stderr)
    elif args.json:
        print(json.dumps(payload if args.eval else payload[0], indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
