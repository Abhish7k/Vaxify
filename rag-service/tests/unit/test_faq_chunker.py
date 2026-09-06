from vaxify_rag.chunking.faq_chunker import chunk_faq_pages
from vaxify_rag.models.chunk import PageBlock


def test_faq_chunker_pairs_questions():
    pages = [
        PageBlock(
            source_id="S1",
            page_num=6,
            text=(
                "Question\n1.\nWhat is immunization?\n"
                "Ans:- Immunization protects children.\n"
                "Question\n2.\nWhy vaccinate?\n"
                "Ans:- Vaccines prevent serious disease."
            ),
        )
    ]
    chunks = chunk_faq_pages(pages, "S1")
    assert len(chunks) >= 2
    assert any(c.question_number == 1 for c in chunks)
    assert all(len(c.text) > 40 for c in chunks)
