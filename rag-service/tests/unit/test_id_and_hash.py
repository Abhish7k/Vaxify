from vaxify_rag.indexing.corpus_hash import compute_corpus_hash
from vaxify_rag.indexing.id_generator import make_chunk_id


def test_chunk_id_deterministic():
    a = make_chunk_id("india/National_ Immunization_Schedule.pdf", 1)
    b = make_chunk_id("india/National_ Immunization_Schedule.pdf", 1)
    c = make_chunk_id("india/National_ Immunization_Schedule.pdf", 2)
    assert a == b
    assert a != c
    assert len(a) == 40


def test_corpus_hash_changes_with_content():
    h1 = compute_corpus_hash({"S1": "abc"}, "1.0.0")
    h2 = compute_corpus_hash({"S1": "def"}, "1.0.0")
    h3 = compute_corpus_hash({"S1": "abc"}, "1.1.0")
    assert h1 != h2
    assert h1 != h3
