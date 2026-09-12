"""Optional live Gemini + Pinecone evaluation for Phase 2B.

Skipped unless GOOGLE_API_KEY and PINECONE_API_KEY are set.
Run: pytest tests/integration/test_ask_live.py -m live -q
"""

from __future__ import annotations

import os

import pytest

from vaxify_rag.generation.pipeline import AskService

pytestmark = pytest.mark.live

EVAL = [
    ("What vaccines are given at birth?", "answered"),
    ("When is Td given during pregnancy?", "answered"),
    ("What is PCV?", "answered"),
    ("Are vaccines safe?", "answered"),
    ("What should I do if a vaccine is unavailable?", "answered"),
    ("What is the COVID-19 booster interval in 2026?", "abstained"),
]


def _keys_present() -> bool:
    return bool(os.getenv("GOOGLE_API_KEY")) and bool(os.getenv("PINECONE_API_KEY"))


@pytest.mark.skipif(not _keys_present(), reason="API keys not configured")
@pytest.mark.parametrize("query,expected", EVAL)
def test_live_ask_eval(query: str, expected: str):
    result = AskService().ask(query)
    assert result.status == expected, (
        f"{query!r}: got {result.status} "
        f"(reason={result.abstention_reason or result.answerability_reason})"
    )
    if expected == "answered":
        assert result.answer.strip()
        assert result.citations, "answered queries must include citations"
        assert all(c.chunk_id for c in result.citations)
        assert all(c.source for c in result.citations)
    else:
        assert result.citations == []
