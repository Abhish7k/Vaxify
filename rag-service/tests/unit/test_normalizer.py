from vaxify_rag.extraction.normalizer import fix_ligatures


def test_fix_ligature_chars():
    assert fix_ligatures("in\ufb02uencers") == "influencers"
    assert fix_ligatures("speci\ufb01c") == "specific"


def test_fix_mojibake_patterns():
    assert "effective" in fix_ligatures("e?ective")
    assert "inflammatory" in fix_ligatures("in?ammatory")
    assert "fibre" in fix_ligatures("?bre")
