"""Defensive JSON parsing for grounded generation responses."""

from __future__ import annotations

import json
import re
from typing import Any

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


def parse_generation_json(raw: str) -> dict[str, Any]:
    text = (raw or "").strip()
    if not text:
        raise ValueError("empty model response")
    fence = _JSON_FENCE_RE.search(text)
    if fence:
        text = fence.group(1).strip()
    # Prefer first JSON object if prose sneaks in.
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("model response is not JSON")
    return json.loads(text[start : end + 1])
