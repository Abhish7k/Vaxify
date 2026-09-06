"""Topic classification for chunks."""

from __future__ import annotations

import re

from vaxify_rag.models.chunk import RawChunk, Topic

TOPIC_KEYWORDS: dict[Topic, list[str]] = {
    "schedule": ["schedule", "dose", "route", "when to give", "age-wise", "immunization schedule"],
    "pregnancy": ["pregnant", "pregnancy", "td-1", "td-2", "td-booster", "maternal"],
    "newborn": ["birth dose", "newborn", "new-born", "bcg", "hepb", "opv-0", "zero dose"],
    "pcv": ["pcv", "pneumococcal", "pneumonia vaccine"],
    "td_tt": ["td vaccine", "tetanus", "diphtheria", "td-", "tt ", "tetanus toxoid"],
    "side_effects": ["side effect", "fever", "aefi", "pain", "swelling", "paracetamol", "adverse"],
    "safety": ["safe", "autism", "thiomersal", "aluminium", "clinical trial", "who helps"],
    "cost": ["private", "government", "free", "cost", "where to go", "anganwadi", "phc"],
    "immunity": ["immunity", "antibod", "herd", "how vaccine", "natural protection"],
    "campaign": ["campaign", "mr ", "rubella", "measles-rubella", "sia"],
}


def classify_topic(chunk: RawChunk, default_topic: Topic = "immunity") -> Topic:
    if chunk.topic:
        return chunk.topic

    text = f"{chunk.section or ''} {chunk.text}".lower()
    scores: dict[Topic, int] = {}
    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score:
            scores[topic] = score

    if not scores:
        return default_topic

    return max(scores, key=lambda t: scores[t])
