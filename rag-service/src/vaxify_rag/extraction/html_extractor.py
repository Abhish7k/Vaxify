"""WHO HTML Q&A extraction."""

from __future__ import annotations

from pathlib import Path

from bs4 import BeautifulSoup

from vaxify_rag.extraction.normalizer import fix_ligatures, normalize_whitespace
from vaxify_rag.models.chunk import PageBlock, RawChunk


def extract_who_qa(file_path: Path, source_id: str) -> list[RawChunk]:
    html = file_path.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    accordion = soup.select_one("#sf-accordion")
    if not accordion:
        raise ValueError(f"No #sf-accordion found in {file_path}")

    panels = accordion.select(".sf-accordion__panel")
    if len(panels) != 11:
        raise ValueError(f"Expected 11 WHO Q&A panels, found {len(panels)} in {file_path}")

    chunks: list[RawChunk] = []
    for index, panel in enumerate(panels, start=1):
        link = panel.select_one(".sf-accordion__link")
        content = panel.select_one(".sf-accordion__content")
        if not link or not content:
            continue
        question = normalize_whitespace(fix_ligatures(link.get_text(" ", strip=True)))
        answer = normalize_whitespace(fix_ligatures(content.get_text(" ", strip=True)))
        if len(question) < 5 or len(answer) < 20:
            continue
        text = f"{question}\n\n{answer}"
        chunks.append(
            RawChunk(
                source_id=source_id,
                text=text,
                question=question,
                question_number=index,
                section=question,
                topic="safety",
                page_start=None,
                page_end=None,
            )
        )

    return chunks


def extract_html_as_pages(file_path: Path, source_id: str) -> list[PageBlock]:
    """Compatibility wrapper — WHO uses direct Q&A extraction."""
    chunks = extract_who_qa(file_path, source_id)
    return [
        PageBlock(source_id=source_id, page_num=0, text=chunk.text) for chunk in chunks
    ]
