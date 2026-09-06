from vaxify_rag.enrichment.metadata_builder import authority_rank_for
from vaxify_rag.enrichment.superseded_tagger import apply_superseded_rules
from vaxify_rag.models.chunk import RawChunk


def test_authority_rank_schedule_prefers_s5():
    assert authority_rank_for("S5", "schedule") < authority_rank_for("S2", "schedule")


def test_authority_rank_safety_prefers_s8():
    assert authority_rank_for("S8", "safety") < authority_rank_for("S1", "safety")


def test_superseded_s2_table_page():
    chunk = RawChunk(
        source_id="S2",
        text="National Immunization Schedule table with TT doses",
        page_start=68,
        page_end=68,
    )
    assert apply_superseded_rules(chunk, "S2") is True


def test_superseded_s1_q20():
    chunk = RawChunk(
        source_id="S1",
        text="TT vaccine for pregnant women",
        question_number=20,
        section="Q20: What vaccines are given to a pregnant woman?",
    )
    assert apply_superseded_rules(chunk, "S1") is True


def test_not_superseded_s5_td():
    chunk = RawChunk(
        source_id="S5",
        text="Td-1 Td-2 for pregnant women",
        page_start=1,
        page_end=1,
    )
    assert apply_superseded_rules(chunk, "S5") is False
