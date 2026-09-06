"""Corpus validation script."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pymupdf as fitz  # noqa: E402

from vaxify_rag.config import get_settings, get_sources_config  # noqa: E402


def validate() -> int:
    settings = get_settings()
    kb = settings.knowledge_base_path
    sources = get_sources_config().get("sources", {})
    errors: list[str] = []

    if len(sources) != 8:
        errors.append(f"Expected 8 sources, found {len(sources)}")

    for source_id, cfg in sorted(sources.items()):
        disk_path = kb / cfg["disk_path"]
        if not disk_path.exists():
            errors.append(f"{source_id}: missing file {cfg['disk_path']}")
            continue

        if cfg.get("source_type") == "PDF":
            include_pages = cfg.get("include_pages", [])
            if include_pages:
                with fitz.open(disk_path) as doc:
                    max_page = len(doc)
                    for page in include_pages:
                        if page < 1 or page > max_page:
                            errors.append(
                                f"{source_id}: page {page} out of range (max {max_page})"
                            )
        elif source_id == "S8":
            if cfg["source_path"] != "who/WHO_Vaccine_Safety_QA.html":
                errors.append(f"S8: canonical source_path mismatch")

    if errors:
        print("CORPUS VALIDATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"CORPUS VALIDATION PASSED: {len(sources)} sources OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(validate())
