"""FAQ semantic Q&A chunking."""

from __future__ import annotations

import re

from vaxify_rag.extraction.normalizer import (
    fix_ligatures,
    join_sentences,
    normalize_whitespace,
    strip_chunk_artifacts,
)
from vaxify_rag.models.chunk import PageBlock, RawChunk, Topic

QUESTION_HEADER = re.compile(
    r"Question\s*\n\s*((?:\d+\.\s*\n?)+)?(.+?)(?=\n\s*Ans:-|\nQuestion|\Z)",
    re.DOTALL | re.IGNORECASE,
)
ANSWER_BLOCK = re.compile(r"Ans:-\s*(.+?)(?=\n\s*Ans:-|\nQuestion|\Z)", re.DOTALL | re.IGNORECASE)
INLINE_QUESTION = re.compile(
    r"(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*(?:Ans:-|Question|\d+\.))[^\n]+)*)",
    re.MULTILINE,
)
Q_NUMBER_ONLY = re.compile(r"^\s*(\d+)\.?\s*$")


def _extract_question_numbers(header: str) -> list[int]:
    return [int(n) for n in re.findall(r"(\d+)\.", header)]


def _guess_topic(question: str, answer: str) -> Topic | None:
    combined = f"{question} {answer}".lower()
    if any(w in combined for w in ["pregnant", "pregnancy", "td-", "tt ", "tetanus toxoid"]):
        if "td" in combined or "tetanus" in combined:
            return "pregnancy" if "pregnant" in combined or "pregnancy" in combined else "td_tt"
        return "pregnancy"
    if any(w in combined for w in ["birth dose", "newborn", "new-born", "bcg", "hepb", "opv-0"]):
        return "newborn"
    if any(w in combined for w in ["pcv", "pneumococcal", "pneumonia"]):
        return "pcv"
    if any(w in combined for w in ["side effect", "fever", "aefi", "pain", "swelling", "paracetamol"]):
        return "side_effects"
    if any(w in combined for w in ["schedule", "dose", "route", "immunization schedule", "when to give"]):
        return "schedule"
    if any(w in combined for w in ["private", "government", "cost", "free", "where to go", "anganwadi"]):
        return "cost"
    if any(w in combined for w in ["mr campaign", "rubella", "measles"]):
        return "campaign"
    if any(w in combined for w in ["immunity", "vaccine work", "herd", "antibod"]):
        return "immunity"
    return None


def chunk_faq_pages(
    pages: list[PageBlock],
    source_id: str,
    exclude_questions: list[int] | None = None,
) -> list[RawChunk]:
    exclude = set(exclude_questions or [])
    page_map = {p.page_num: p for p in pages}

    combined_parts: list[str] = []
    for page_num in sorted(page_map):
        if page_num == 26 and source_id == "S1":
            continue  # handled by dedicated key-messages parser
        combined_parts.append(f"\n[[PAGE:{page_num}]]\n{page_map[page_num].text}")
    combined = fix_ligatures("\n".join(combined_parts))

    chunks: list[RawChunk] = []
    seen_keys: set[str] = set()

    # Strategy 1: Question ... Ans:- pairs
    for match in QUESTION_HEADER.finditer(combined):
        numbers_blob = match.group(1) or ""
        question_body = normalize_whitespace(match.group(2) or "")
        numbers = _extract_question_numbers(numbers_blob + " " + question_body[:20])
        if not numbers and question_body:
            num_match = re.match(r"^(\d+)\.", question_body)
            if num_match:
                numbers = [int(num_match.group(1))]
                question_body = question_body[num_match.end() :].strip()

        search_start = match.end()
        answer_match = ANSWER_BLOCK.search(combined, search_start)
        if not answer_match:
            continue
        answer = join_sentences(normalize_whitespace(answer_match.group(1)))
        if len(answer) < 20:
            continue

        page_start, page_end = _pages_for_span(combined, match.start(), answer_match.end())

        if numbers:
            primary = numbers[0]
            if primary in exclude:
                continue
            question = question_body or f"Question {primary}"
            key = f"q{primary}"
            if key in seen_keys:
                continue
            seen_keys.add(key)
            chunks.append(
                _make_chunk(source_id, primary, question, answer, page_start, page_end)
            )
        elif question_body:
            key = f"section:{question_body[:40]}"
            if key in seen_keys:
                continue
            seen_keys.add(key)
            chunks.append(
                RawChunk(
                    source_id=source_id,
                    text=f"{question_body}\n\n{answer}",
                    question=question_body,
                    section=question_body,
                    page_start=page_start,
                    page_end=page_end,
                    topic=_guess_topic(question_body, answer),
                )
            )

    # Strategy 2: Inline numbered questions with Ans blocks (fallback)
    if len(chunks) < 3:
        chunks = _chunk_by_inline_questions(combined, source_id, exclude)

    # Strategy 3: S1 page 26 four-key-messages (multi-column layout)
    key_msg = _extract_key_messages(page_map, source_id)
    if key_msg:
        chunks.append(key_msg)

    return _dedupe_chunks(chunks)


def _chunk_by_inline_questions(
    combined: str,
    source_id: str,
    exclude: set[int],
) -> list[RawChunk]:
    chunks: list[RawChunk] = []
    answers = list(ANSWER_BLOCK.finditer(combined))
    if not answers:
        return chunks

    for answer_match in answers:
        answer = join_sentences(normalize_whitespace(answer_match.group(1)))
        if len(answer) < 20:
            continue
        preceding = combined[max(0, answer_match.start() - 800) : answer_match.start()]
        q_match = None
        for m in reversed(list(INLINE_QUESTION.finditer(preceding))):
            q_match = m
            break
        if not q_match:
            continue
        qnum = int(q_match.group(1))
        if qnum in exclude:
            continue
        question = normalize_whitespace(q_match.group(2))
        page_start, page_end = _pages_for_span(combined, q_match.start(), answer_match.end())
        chunks.append(_make_chunk(source_id, qnum, question, answer, page_start, page_end))

    return _dedupe_chunks(chunks)


def _extract_key_messages(page_map: dict[int, str], source_id: str) -> RawChunk | None:
    """Parse S1 page 26 four-key-messages layout (multi-column PDF artifact)."""
    page_block = page_map.get(26)
    if not page_block:
        return None
    text = fix_ligatures(page_block.text)
    if "What all should I be made aware" not in text and "vaccinator at the session site" not in text:
        return None

    question = "What all should I be made aware of, if my child is being vaccinated?"
    messages = [
        "What vaccine was given to your child, and what disease it will protect your child from",
        "What minor side-effects could occur, and how you should deal with them",
        "Importance of keeping and bringing the MCP Card in all subsequent visits",
        "When and where should you come for the next due vaccine",
    ]
    answer = (
        "You have a right to be made aware of the following by the vaccinator at the session site.\n\n"
        "Four key messages:\n"
        + "\n".join(f"{i}. {msg}" for i, msg in enumerate(messages, 1))
    )

    return RawChunk(
        source_id=source_id,
        text=f"{question}\n\n{answer}",
        question=question,
        question_number=45,
        section="Q45: Four key messages when your child is vaccinated",
        page_start=26,
        page_end=26,
        topic="side_effects",
    )


def infer_question_number(section: str | None, question: str | None = None) -> int | None:
    for candidate in (section, question):
        if not candidate:
            continue
        trailing = re.search(r"(\d+)\.\s*$", candidate.strip())
        if trailing:
            return int(trailing.group(1))
        embedded = re.search(r"(\d+)\.\s*(?=[a-zA-Z])", candidate)
        if embedded:
            return int(embedded.group(1))
        glued = re.search(r"(\d+)\.(?=[a-zA-Z])", candidate)
        if glued:
            return int(glued.group(1))
        q_prefix = re.match(r"^Q(\d+):", candidate, re.IGNORECASE)
        if q_prefix:
            return int(q_prefix.group(1))
    return None


def clean_question_text(text: str) -> str:
    text = re.sub(r"(\d+)\.\s*(?=[a-zA-Z])", " ", text)
    text = re.sub(r"(\d+)\.(?=[a-zA-Z])", " ", text)
    text = re.sub(r"\s*\d+\.\s*$", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _make_chunk(
    source_id: str,
    qnum: int,
    question: str,
    answer: str,
    page_start: int | None,
    page_end: int | None,
) -> RawChunk:
    question = clean_question_text(normalize_whitespace(question))
    answer = join_sentences(answer)
    text = f"{question}\n\n{answer}"
    return RawChunk(
        source_id=source_id,
        text=text,
        question=question,
        question_number=qnum,
        section=f"Q{qnum}: {question[:80]}",
        page_start=page_start,
        page_end=page_end,
        topic=_guess_topic(question, answer),
    )


def _pages_for_span(text: str, start: int, end: int) -> tuple[int | None, int | None]:
    pages = [int(m.group(1)) for m in re.finditer(r"\[\[PAGE:(\d+)\]\]", text[:end])]
    if not pages:
        return None, None
    return pages[0], pages[-1]


def _finalize_chunk(chunk: RawChunk) -> RawChunk:
    if chunk.question_number is None:
        chunk.question_number = infer_question_number(chunk.section, chunk.question)
    if chunk.question:
        chunk.question = clean_question_text(chunk.question)
    if chunk.section and chunk.question_number is not None:
        if not chunk.section.startswith("Q"):
            chunk.section = f"Q{chunk.question_number}: {clean_question_text(chunk.section)}"
    elif chunk.section:
        chunk.section = clean_question_text(chunk.section)
    if chunk.question and chunk.text:
        parts = chunk.text.split("\n\n", 1)
        if len(parts) == 2:
            chunk.text = f"{chunk.question}\n\n{parts[1]}"
        else:
            chunk.text = chunk.question
    chunk.text = strip_chunk_artifacts(chunk.text)
    if chunk.section:
        chunk.section = strip_chunk_artifacts(chunk.section)
    return chunk


def _dedupe_chunks(chunks: list[RawChunk]) -> list[RawChunk]:
    seen: set[str] = set()
    result: list[RawChunk] = []
    for chunk in chunks:
        chunk = _finalize_chunk(chunk)
        key = chunk.section or chunk.text[:80]
        if chunk.question_number is not None:
            key = f"q{chunk.question_number}"
        norm = re.sub(r"\s+", " ", key.lower())
        if norm in seen:
            continue
        if len(chunk.text.strip()) < 40:
            continue
        seen.add(norm)
        result.append(chunk)
    return result


def chunk_health_worker_mixed(
    pages: list[PageBlock],
    source_id: str,
    page_modes: dict[int, str] | None = None,
) -> list[RawChunk]:
    from vaxify_rag.chunking.schedule_chunker import chunk_schedule_table_page
    from vaxify_rag.chunking.section_chunker import chunk_by_sections

    page_modes = page_modes or {}
    table_pages: list[PageBlock] = []
    chapter_groups: list[tuple[str, list[PageBlock]]] = []

    group_map: dict[str, list[PageBlock]] = {
        "Ch.1 Immunity & Vaccines": [],
        "Ch.3 Vaccination of Pregnant Women": [],
        "Ch.4 New-born Vaccination": [],
        "Ch.5 Side Effects, AEFI, Contraindications": [],
    }

    for page in pages:
        mode = page_modes.get(page.page_num)
        if mode == "schedule_table":
            table_pages.append(page)
        elif page.page_num in (8, 9, 10, 11):
            group_map["Ch.1 Immunity & Vaccines"].append(page)
        elif page.page_num in (20, 21):
            group_map["Ch.3 Vaccination of Pregnant Women"].append(page)
        elif page.page_num == 22:
            group_map["Ch.4 New-born Vaccination"].append(page)
        elif page.page_num in (24, 25):
            group_map["Ch.5 Side Effects, AEFI, Contraindications"].append(page)

    chunks: list[RawChunk] = []
    for chapter, group_pages in group_map.items():
        if not group_pages:
            continue
        group_chunks = chunk_by_sections(group_pages, source_id, default_chapter=chapter)
        for chunk in group_chunks:
            chunk.chapter = chapter
        chunks.extend(group_chunks)

    for page in table_pages:
        chunks.extend(chunk_schedule_table_page(page, source_id))

    return chunks
