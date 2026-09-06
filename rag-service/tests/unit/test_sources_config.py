from vaxify_rag.config import get_sources_config


def test_all_eight_sources_configured():
    sources = get_sources_config()["sources"]
    assert set(sources) == {"S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"}


def test_s5_filename_preserved():
    cfg = get_sources_config()["sources"]["S5"]
    assert cfg["disk_path"] == "india/National_ Immunization_Schedule.pdf"
    assert cfg["source_path"] == "india/National_ Immunization_Schedule.pdf"


def test_s8_canonical_path():
    cfg = get_sources_config()["sources"]["S8"]
    assert cfg["disk_path"] == "who/WHO_Vaccine_Safety_QA.html.html"
    assert cfg["source_path"] == "who/WHO_Vaccine_Safety_QA.html"
    assert cfg["doc_date"] is None
    assert cfg["capture_date"] == "2025-09-23"
