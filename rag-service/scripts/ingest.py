"""Ingestion CLI entry point."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow running as `python scripts/ingest.py`
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from vaxify_rag.logging import setup_logging  # noqa: E402
from vaxify_rag.pipeline.ingest_pipeline import dry_run_summary, run_ingest  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Vaxify RAG ingestion pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Extract/chunk without embed/upsert")
    parser.add_argument("--force", action="store_true", help="Re-ingest even if corpus unchanged")
    parser.add_argument("--skip-embed", action="store_true", help="Chunk only; skip embed/upsert")
    parser.add_argument("--summary", action="store_true", help="Print JSON summary to stdout")
    args = parser.parse_args()

    setup_logging()

    if args.dry_run:
        manifest = run_ingest(dry_run=True, force=args.force, skip_embed=True)
        summary = dry_run_summary()
        if args.summary or True:
            print(json.dumps(summary, indent=2))
        print(f"\nManifest written: chunk_count={manifest.chunk_count}")
        return 0

    manifest = run_ingest(
        dry_run=False,
        force=args.force,
        skip_embed=args.skip_embed,
    )
    print(
        f"Ingest complete: chunks={manifest.chunk_count}, "
        f"indexed={len(manifest.indexed_chunk_ids)}, "
        f"corpus_hash={manifest.corpus_hash[:12]}..."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
