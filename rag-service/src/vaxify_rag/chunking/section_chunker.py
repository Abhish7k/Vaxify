"""Section-based chunking for MCP, PCV, Td, and S2 chapters."""

from __future__ import annotations

import re

from vaxify_rag.extraction.normalizer import join_sentences, normalize_whitespace, strip_chunk_artifacts
from vaxify_rag.models.chunk import PageBlock, RawChunk, Topic

CHAPTER_PATTERN = re.compile(
    r"(?:^|\n)((?:\d+\.[\d.]+\s+)?(?:Chapter\s+\d+|CHAPTER\s+\d+|[A-Z][A-Z\s]{3,}))",
    re.MULTILINE,
)
SECTION_PATTERN = re.compile(
    r"(?:^|\n)(\d+\.\d+\s+[^\n]+)",
    re.MULTILINE,
)


def chunk_by_sections(
    pages: list[PageBlock],
    source_id: str,
    default_chapter: str | None = None,
) -> list[RawChunk]:
    combined_parts: list[str] = []
    for page in sorted(pages, key=lambda p: p.page_num):
        combined_parts.append(f"\n[[PAGE:{page.page_num}]]\n{page.text}")
    combined = "\n".join(combined_parts)

    chunks: list[RawChunk] = []

    if source_id == "S7":
        return _chunk_td_page(pages, source_id)

    if source_id == "S4":
        return _chunk_mcp(pages, source_id)

    if source_id == "S6":
        return _chunk_pcv(pages, source_id)

    # Generic section chunking for S2 chapters etc.
    sections = list(SECTION_PATTERN.finditer(combined))
    if len(sections) >= 2:
        for i, match in enumerate(sections):
            heading = normalize_whitespace(match.group(1))
            start = match.start()
            end = sections[i + 1].start() if i + 1 < len(sections) else len(combined)
            body = _clean_body(combined[start:end])
            if len(body) < 60:
                continue
            page_start, page_end = _page_span(combined, start, end)
            chunks.append(
                RawChunk(
                    source_id=source_id,
                    text=body,
                    chapter=default_chapter,
                    section=heading,
                    page_start=page_start,
                    page_end=page_end,
                    topic=_topic_from_text(heading + body),
                )
            )
    else:
        text = _clean_body(combined)
        if len(text) >= 60:
            page_start = pages[0].page_num if pages else None
            page_end = pages[-1].page_num if pages else None
            chunks.append(
                RawChunk(
                    source_id=source_id,
                    text=text,
                    chapter=default_chapter,
                    section=default_chapter,
                    page_start=page_start,
                    page_end=page_end,
                    topic=_topic_from_text(text),
                )
            )

    return chunks


def _chunk_mcp(pages: list[PageBlock], source_id: str) -> list[RawChunk]:
    """Chunk MCP Ch.14 per page to avoid multi-column interleaving artifacts."""
    chunks: list[RawChunk] = []
    topic_by_page = {
        69: ("schedule", "Immunization overview and UIP updates"),
        70: ("pcv", "Recent vaccine developments: PCV, RVV, IPV"),
        71: ("schedule", "MCP immunization schedule table"),
        72: ("immunity", "Immunization essentials for parents"),
        73: ("immunity", "Role of ASHA/AWW and four key messages"),
    }

    for page in sorted(pages, key=lambda p: p.page_num):
        body = strip_chunk_artifacts(normalize_whitespace(page.text))
        if len(body) < 60:
            continue
        topic, section_label = topic_by_page.get(
            page.page_num, ("schedule", f"Page {page.page_num}")
        )
        chunks.append(
            RawChunk(
                source_id=source_id,
                text=body,
                chapter="Ch.14 Immunization",
                section=section_label,
                page_start=page.page_num,
                page_end=page.page_num,
                topic=topic,  # type: ignore[arg-type]
            )
        )

    return chunks


def _chunk_pcv(pages: list[PageBlock], source_id: str) -> list[RawChunk]:
    """Chunk PCV guidelines per page within Ch.1–3 to preserve content and avoid merge artifacts."""
    chunks: list[RawChunk] = []

    for page in sorted(pages, key=lambda p: p.page_num):
        if page.page_num <= 24:
            chapter = "Ch.1 Background"
        elif page.page_num <= 30:
            chapter = "Ch.2 Pneumococcal Disease"
        else:
            chapter = "Ch.3 Vaccines to Prevent Pneumonia"

        body = strip_chunk_artifacts(normalize_whitespace(page.text))
        if len(body) < 60:
            continue

        chunks.append(
            RawChunk(
                source_id=source_id,
                text=body,
                chapter=chapter,
                section=f"{chapter} — page {page.page_num}",
                page_start=page.page_num,
                page_end=page.page_num,
                topic=_topic_from_text(body),
            )
        )

    return chunks


def _chunk_td_page(pages: list[PageBlock], source_id: str) -> list[RawChunk]:
    page = pages[0]
    text = normalize_whitespace(page.text)
    parts = re.split(r"(?=\bKey [Mm]essages\b)", text)
    chunks: list[RawChunk] = []
    for i, part in enumerate(parts):
        part = part.strip()
        if len(part) < 60:
            continue
        section = "Td rationale and schedule" if i == 0 else "Key messages"
        chunks.append(
            RawChunk(
                source_id=source_id,
                text=part,
                chapter="Td Vaccine Operational Guidelines",
                section=section,
                page_start=page.page_num,
                page_end=page.page_num,
                topic="td_tt",
            )
        )
    if not chunks and len(text) >= 60:
        chunks.append(
            RawChunk(
                source_id=source_id,
                text=text,
                chapter="Td Vaccine Operational Guidelines",
                section="Page 1 guidance",
                page_start=page.page_num,
                page_end=page.page_num,
                topic="td_tt",
            )
        )
    return chunks


def _chapter_for_pcv(heading: str) -> str:
    if heading.startswith("1."):
        return "Ch.1 Background"
    if heading.startswith("2."):
        return "Ch.2 Pneumococcal Disease"
    if heading.startswith("3."):
        return "Ch.3 Vaccines to Prevent Pneumonia"
    return "PCV Operational Guidelines"


def _topic_from_text(text: str) -> Topic:
    lower = text.lower()
    if any(w in lower for w in ["contraindication", "side effect", "aefi", "adverse"]):
        return "side_effects"
    if any(w in lower for w in ["schedule", "6 weeks", "14 weeks", "9 months", "dose", "route"]):
        return "schedule" if "pcv" not in lower else "pcv"
    if "pneumococcal" in lower or "pcv" in lower:
        return "pcv"
    if "pregnant" in lower or "td-" in lower:
        return "pregnancy"
    if "newborn" in lower or "birth dose" in lower:
        return "newborn"
    if "immunity" in lower or "vaccine mechanism" in lower:
        return "immunity"
    return "pcv" if "pneumonia" in lower else "schedule"


def _clean_body(text: str) -> str:
    text = strip_chunk_artifacts(text)
    return join_sentences(normalize_whitespace(text))


def _page_span(text: str, start: int, end: int) -> tuple[int | None, int | None]:
    pages = [int(m.group(1)) for m in re.finditer(r"\[\[PAGE:(\d+)\]\]", text[:end])]
    if not pages:
        return None, None
    return pages[0], pages[-1]


def _dedupe_section_chunks(chunks: list[RawChunk]) -> list[RawChunk]:
    seen: set[str] = set()
    result: list[RawChunk] = []
    for chunk in chunks:
        key = re.sub(r"\s+", " ", chunk.text[:100].lower())
        if key in seen:
            continue
        seen.add(key)
        result.append(chunk)
    return result
