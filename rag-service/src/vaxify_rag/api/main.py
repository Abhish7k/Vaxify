"""FastAPI application."""

from __future__ import annotations

from fastapi import FastAPI

from vaxify_rag.config import get_settings


def create_app() -> FastAPI:
    app = FastAPI(title="Vaxify RAG Service", version="1.0.0")

    @app.get("/health")
    def health():
        settings = get_settings()
        return {
            "status": "ok",
            "service": "vaxify-rag",
            "embedding_model": settings.embedding_model,
            "embedding_dimension": settings.embedding_dimension,
        }

    return app


app = create_app()
