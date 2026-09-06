"""Deterministic chunk ID generation."""

from __future__ import annotations

import hashlib


def make_chunk_id(source_path: str, chunk_index: int) -> str:
    payload = f"{source_path}:{chunk_index}"
    return hashlib.sha1(payload.encode("utf-8")).hexdigest()
