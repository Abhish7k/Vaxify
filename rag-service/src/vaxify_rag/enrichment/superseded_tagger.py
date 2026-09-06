"""Superseded content tagging."""

from __future__ import annotations

from typing import Any

from vaxify_rag.config import get_superseded_config
from vaxify_rag.models.chunk import RawChunk


def apply_superseded_rules(chunk: RawChunk, source_id: str) -> bool:
    rules = get_superseded_config().get("rules", [])
    text_lower = chunk.text.lower()

    for rule in rules:
        if rule.get("source_id") != source_id:
            continue

        qnums = rule.get("question_numbers")
        if qnums and chunk.question_number in qnums:
            return True

        pages = rule.get("pages")
        if pages and chunk.page_start is not None:
            if chunk.page_start in pages or chunk.page_end in pages:
                if rule.get("entire_page"):
                    return True
                contains = rule.get("text_contains", [])
                if contains and any(term.lower() in text_lower for term in contains):
                    return True
                if not contains:
                    return True

        contains_only = rule.get("text_contains")
        if contains_only and not pages and not qnums:
            if all(term.lower() in text_lower for term in contains_only):
                return True

    # TT-era schedule in pregnancy answers
    if source_id in ("S1", "S3") and chunk.question_number in (20, 21, 16):
        if "tt" in text_lower or "tetanus toxoid" in text_lower:
            return True

    return False
