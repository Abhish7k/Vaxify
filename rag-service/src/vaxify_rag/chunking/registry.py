"""Route sources to appropriate chunkers."""

from __future__ import annotations

from typing import Any

from vaxify_rag.chunking.faq_chunker import chunk_faq_pages, chunk_health_worker_mixed
from vaxify_rag.chunking.schedule_chunker import chunk_schedule_pages
from vaxify_rag.chunking.section_chunker import chunk_by_sections
from vaxify_rag.extraction.html_extractor import extract_who_qa
from vaxify_rag.extraction.pdf_extractor import extract_pdf_pages
from vaxify_rag.models.chunk import PageBlock, RawChunk


def chunk_source(
    source_id: str,
    source_cfg: dict[str, Any],
    file_path,
) -> list[RawChunk]:
    chunker = source_cfg.get("chunker", "section")

    if chunker == "who_qa":
        return extract_who_qa(file_path, source_id)

    include_pages = source_cfg.get("include_pages", [])
    pages = extract_pdf_pages(file_path, source_id, include_pages)

    if chunker == "faq":
        return chunk_faq_pages(
            pages,
            source_id,
            exclude_questions=source_cfg.get("exclude_questions", []),
        )

    if chunker == "schedule":
        return chunk_schedule_pages(pages, source_id)

    if chunker == "mixed":
        return chunk_health_worker_mixed(
            pages,
            source_id,
            page_modes=source_cfg.get("page_modes"),
        )

    if chunker == "section":
        return chunk_by_sections(
            pages,
            source_id,
            default_chapter=source_cfg.get("chapter"),
        )

    return chunk_by_sections(pages, source_id)
