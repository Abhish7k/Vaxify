from vaxify_rag.chunking.schedule_chunker import chunk_schedule_pages
from vaxify_rag.models.chunk import PageBlock


def test_schedule_chunker_preserves_dose_units():
    pages = [
        PageBlock(
            source_id="S5",
            page_num=2,
            text=(
                "For Infants\n"
                "Rotavirus Vaccine (RVV)\n"
                "6 weeks\n"
                "5 drops (liquid) / 2.5 ml (lyophilized)\n"
                "Oral\n"
            ),
        )
    ]
    chunks = chunk_schedule_pages(pages, "S5")
    assert chunks
    combined = " ".join(c.text for c in chunks)
    assert "5 drops (liquid) / 2.5 ml (lyophilized)" in combined
