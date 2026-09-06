"""Pinecone vector store operations."""

from __future__ import annotations

from pinecone import Pinecone, ServerlessSpec

from vaxify_rag.config import get_settings
from vaxify_rag.models.chunk import ChunkRecord


class PineconeStore:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.pinecone_api_key:
            raise ValueError("PINECONE_API_KEY is required for Pinecone operations")
        self._pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index_name = settings.pinecone_index_name
        self.dimension = settings.embedding_dimension
        self._index = self._ensure_index()

    def _ensure_index(self):
        existing = {idx.name for idx in self._pc.list_indexes()}
        if self.index_name not in existing:
            self._pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
        return self._pc.Index(self.index_name)

    def upsert_chunks(
        self,
        chunks: list[ChunkRecord],
        vectors: list[list[float]],
    ) -> int:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors length mismatch")

        payload = []
        for chunk, vector in zip(chunks, vectors):
            payload.append(
                {
                    "id": chunk.id,
                    "values": vector,
                    "metadata": chunk.to_pinecone_metadata(),
                }
            )

        batch_size = 50
        for start in range(0, len(payload), batch_size):
            self._index.upsert(vectors=payload[start : start + batch_size])
        return len(payload)

    def delete_ids(self, ids: list[str]) -> None:
        if not ids:
            return
        batch_size = 100
        for start in range(0, len(ids), batch_size):
            self._index.delete(ids=ids[start : start + batch_size])
