"""PDF text extraction via PyMuPDF."""

from __future__ import annotations

from pathlib import Path

import pymupdf as fitz

from vaxify_rag.config import get_settings
from vaxify_rag.extraction.normalizer import fix_ligatures
from vaxify_rag.models.chunk import PageBlock


def extract_pdf_pages(
    file_path: Path,
    source_id: str,
    include_pages: list[int],
) -> list[PageBlock]:
    settings = get_settings()
    blocks: list[PageBlock] = []

    with fitz.open(file_path) as doc:
        for page_num in include_pages:
            if page_num < 1 or page_num > len(doc):
                continue
            page = doc[page_num - 1]
            raw = page.get_text("text", sort=True)
            text = fix_ligatures(raw)
            if len(text.strip()) < settings.min_page_chars:
                continue
            blocks.append(PageBlock(source_id=source_id, page_num=page_num, text=text))

    return blocks
