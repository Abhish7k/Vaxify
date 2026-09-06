"""Text normalization utilities."""

from __future__ import annotations

import re

LIGATURE_MAP = {
    "\ufb01": "fi",
    "\ufb02": "fl",
    "\ufffd": "",
}

# Common mojibake patterns from PyMuPDF ligature rendering
MOJIBAKE_PATTERNS = [
    (re.compile(r"e\?ective", re.IGNORECASE), "effective"),
    (re.compile(r"in\?ammatory", re.IGNORECASE), "inflammatory"),
    (re.compile(r"in\?uencers", re.IGNORECASE), "influencers"),
    (re.compile(r"\?bre", re.IGNORECASE), "fibre"),
    (re.compile(r"di\?cult", re.IGNORECASE), "difficult"),
    (re.compile(r"speci\?c", re.IGNORECASE), "specific"),
    (re.compile(r"e\?ort", re.IGNORECASE), "effort"),
    (re.compile(r"o\?er", re.IGNORECASE), "offer"),
    (re.compile(r"in\?uence", re.IGNORECASE), "influence"),
    (re.compile(r"pro\?le", re.IGNORECASE), "profile"),
    (re.compile(r"de\?ned", re.IGNORECASE), "defined"),
    (re.compile(r"bene\?t", re.IGNORECASE), "benefit"),
    (re.compile(r"con\?rm", re.IGNORECASE), "confirm"),
    (re.compile(r"in\?ammation", re.IGNORECASE), "inflammation"),
    (re.compile(r"signi\?cant", re.IGNORECASE), "significant"),
    (re.compile(r"di\?erent", re.IGNORECASE), "different"),
    (re.compile(r"o\?icial", re.IGNORECASE), "official"),
    (re.compile(r"in\?uenza", re.IGNORECASE), "influenza"),
    (re.compile(r"e\?icacy", re.IGNORECASE), "efficacy"),
    (re.compile(r"in\?uential", re.IGNORECASE), "influential"),
    (re.compile(r"(\w)\?(\w)"), None),  # generic ? between letters -> fi heuristic below
]


def fix_ligatures(text: str) -> str:
    for char, replacement in LIGATURE_MAP.items():
        text = text.replace(char, replacement)

    for pattern, replacement in MOJIBAKE_PATTERNS[:-1]:
        text = pattern.sub(replacement, text)

    # Heuristic: single ? between lowercase letters often = fi/fl missing
    text = re.sub(r"([a-z])\?([a-z])", lambda m: m.group(1) + "fi" + m.group(2), text, flags=re.IGNORECASE)

    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_whitespace(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return text.strip()


PAGE_MARKER = re.compile(r"\[\[PAGE:\d+\]\]\s*")
CONTRIBUTORS_CUTOFF = re.compile(r"\n\s*LIST OF CONTRIBUTORS\b.*", re.DOTALL | re.IGNORECASE)


def strip_chunk_artifacts(text: str) -> str:
    """Remove internal page markers and trailing contributor pages from chunk text."""
    text = PAGE_MARKER.sub("", text)
    text = CONTRIBUTORS_CUTOFF.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def join_sentences(text: str) -> str:
    """Join broken line fragments into readable paragraphs."""
    text = strip_chunk_artifacts(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    joined: list[str] = []
    buffer = lines[0]
    for line in lines[1:]:
        if buffer.endswith("-") or (buffer and buffer[-1] in ",;:"):
            buffer = buffer.rstrip("-") + line
        elif line.startswith("Ans:-") or line.startswith("Question"):
            joined.append(buffer)
            buffer = line
        elif re.match(r"^\d+\.?$", line):
            continue
        else:
            if buffer.endswith((".", "?", "!")):
                joined.append(buffer)
                buffer = line
            else:
                buffer = f"{buffer} {line}"
    if buffer:
        joined.append(buffer)
    return "\n".join(joined)
