from pathlib import Path

from vaxify_rag.extraction.html_extractor import extract_who_qa


def test_who_extracts_eleven_qa(knowledge_base_path: Path | None = None):
    from vaxify_rag.config import get_settings

    kb = knowledge_base_path or get_settings().knowledge_base_path
    path = kb / "who" / "WHO_Vaccine_Safety_QA.html.html"
    if not path.exists():
        return
    chunks = extract_who_qa(path, "S8")
    assert len(chunks) == 11
    assert chunks[0].question
    assert "script" not in chunks[0].text.lower()
