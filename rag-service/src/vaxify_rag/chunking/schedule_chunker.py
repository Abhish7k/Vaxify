"""National Immunization Schedule chunking."""

from __future__ import annotations

import re

from vaxify_rag.extraction.normalizer import normalize_whitespace
from vaxify_rag.models.chunk import PageBlock, RawChunk

SECTION_MARKERS = [
    ("For Pregnant Women", "schedule", "Pregnant Women"),
    ("For Infants", "schedule", "Infants"),
    ("For Children", "schedule", "Children"),
]


def chunk_schedule_pages(pages: list[PageBlock], source_id: str) -> list[RawChunk]:
    chunks: list[RawChunk] = []
    page_map = {p.page_num: p.text for p in pages}

    if 1 in page_map:
        text = normalize_whitespace(page_map[1])
        chunks.append(
            RawChunk(
                source_id=source_id,
                text=text,
                chapter="National Immunization Schedule",
                section="Age-wise schedule (birth to 16 years + pregnant mother)",
                page_start=1,
                page_end=1,
                topic="schedule",
            )
        )

    combined_23 = ""
    if 2 in page_map:
        combined_23 += page_map[2] + "\n"
    if 3 in page_map:
        combined_23 += page_map[3]

    if combined_23.strip():
        for marker, topic, section_name in SECTION_MARKERS:
            section_text = _extract_section(combined_23, marker)
            if section_text and len(section_text) > 50:
                chunks.append(
                    RawChunk(
                        source_id=source_id,
                        text=section_text,
                        chapter="NIS Vaccine-wise Table",
                        section=section_name,
                        page_start=2,
                        page_end=3,
                        topic=topic,
                    )
                )

        if len(chunks) == 1:
            chunks.append(
                RawChunk(
                    source_id=source_id,
                    text=normalize_whitespace(combined_23),
                    chapter="NIS Vaccine-wise Table",
                    section="Vaccine-wise dose, route, and site",
                    page_start=2,
                    page_end=3,
                    topic="schedule",
                )
            )

    return chunks


def chunk_schedule_table_page(page: PageBlock, source_id: str) -> list[RawChunk]:
    text = normalize_whitespace(page.text)
    return [
        RawChunk(
            source_id=source_id,
            text=text,
            chapter="Table 5 — National Immunization Schedule (2017)",
            section="2017 dose/age/route/site table",
            page_start=page.page_num,
            page_end=page.page_num,
            topic="schedule",
        )
    ]


def _extract_section(text: str, marker: str) -> str:
    idx = text.find(marker)
    if idx == -1:
        return ""
    rest = text[idx:]
    next_markers = [m for m, _, _ in SECTION_MARKERS if m != marker and m in rest[len(marker) :]]
    end = len(rest)
    for nm in next_markers:
        pos = rest.find(nm, len(marker))
        if pos != -1:
            end = min(end, pos)
    return normalize_whitespace(rest[:end])
