from vaxify_rag.config import get_settings


def test_embedding_config_consistency():
    get_settings.cache_clear()
    settings = get_settings()
    assert settings.embedding_model == "gemini-embedding-001"
    assert settings.embedding_dimension == 768
    assert settings.ingestion_version
    assert settings.embedding_batch_size >= 1
    assert settings.embedding_max_per_minute <= 100
