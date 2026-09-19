"""Phase 2B grounded ask harness.

Examples:
  python scripts/ask.py "What vaccines are given at birth?"
  python scripts/ask.py --eval
  python scripts/ask.py --eval --output data/ask_eval.json
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

from vaxify_rag.generation.pipeline import AskService  # noqa: E402
from vaxify_rag.logging import setup_logging  # noqa: E402
from vaxify_rag.models.answer import AnswerResult  # noqa: E402

EVAL_QUERIES = [
    "What vaccines are given at birth?",
    "When is Td given during pregnancy?",
    "What is PCV?",
    "Are vaccines safe?",
    "What should I do if a vaccine is unavailable?",
    "What is the COVID-19 booster interval in 2026?",
]

# First five should answer; COVID should abstain.
EXPECTED_STATUS = {
    EVAL_QUERIES[0]: "answered",
    EVAL_QUERIES[1]: "answered",
    EVAL_QUERIES[2]: "answered",
    EVAL_QUERIES[3]: "answered",
    EVAL_QUERIES[4]: "answered",
    EVAL_QUERIES[5]: "abstained",
}


def _out(text: str = "") -> None:
    try:
        print(text)
    except UnicodeEncodeError:
        sys.stdout.buffer.write((text + "\n").encode("utf-8", errors="replace"))


def print_answer(result: AnswerResult) -> None:
    _out("\n" + "=" * 72)
    _out(f"query: {result.query}")
    _out(f"status: {result.status}")
    _out(f"answerability: {result.answerability_reason}")
    if result.top_score is not None:
        _out(
            f"top_score: {result.top_score:.4f} | "
            f"term_overlap: {result.term_overlap}"
        )
    if result.abstention_reason:
        _out(f"abstention_reason: {result.abstention_reason}")
    _out("-" * 72)
    _out(result.answer)
    if result.citations:
        _out("-" * 72)
        _out("citations:")
        for cite in result.citations:
            page = "n/a"
            if cite.page_start is not None:
                if cite.page_end is None or cite.page_end == cite.page_start:
                    page = str(cite.page_start)
                else:
                    page = f"{cite.page_start}-{cite.page_end}"
            _out(
                f"  - [{cite.source_id}] {cite.source} p.{page} "
                f"(score={cite.score:.4f}) id={cite.chunk_id}"
            )
            _out(f"    {cite.preview}")
            if cite.source_url:
                _out(f"    {cite.source_url}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Phase 2B grounded ask")
    parser.add_argument("query", nargs="?", help="Single question to answer")
    parser.add_argument("--eval", action="store_true", help="Run six evaluation queries")
    parser.add_argument("--top-k", type=int, default=None)
    parser.add_argument("--json", action="store_true", help="Print JSON to stdout")
    parser.add_argument("--output", type=Path, help="Write JSON results to file")
    args = parser.parse_args()

    if not args.eval and not args.query:
        parser.error("provide a query or --eval")

    setup_logging()
    service = AskService()
    results: list[AnswerResult] = []

    queries = EVAL_QUERIES if args.eval else [args.query]
    for query in queries:
        results.append(service.ask(query, top_k=args.top_k))

    payload = [r.to_dict() for r in results]
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        _out(f"wrote {args.output}")

    if args.json:
        _out(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        for result in results:
            print_answer(result)

    if args.eval:
        _out("\n" + "=" * 72)
        _out("eval summary")
        failures = 0
        for result in results:
            expected = EXPECTED_STATUS.get(result.query)
            ok = expected is None or result.status == expected
            mark = "PASS" if ok else "FAIL"
            if not ok:
                failures += 1
            cite_n = len(result.citations)
            _out(
                f"  [{mark}] {result.status} cites={cite_n} | {result.query[:60]}"
            )
        return 1 if failures else 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
