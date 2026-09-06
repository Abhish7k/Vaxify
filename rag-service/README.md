# Vaxify RAG Service — Phase 1

Python ingestion pipeline for the Vaxify vaccine knowledge base.

## Pipeline

```
PDF/HTML → extraction → normalization → selection → semantic chunking
→ metadata enrichment → Gemini embeddings → Pinecone upsert
```

Ingestion is **not** run on container startup. Run it locally or in CI.

## Setup

```bash
cd rag-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements-dev.txt
cp .env.example .env     # add GOOGLE_API_KEY / PINECONE_API_KEY for full ingest
```

## Commands

```bash
# Validate corpus files and page ranges
python scripts/validate_corpus.py

# Dry-run (no API keys required)
python scripts/ingest.py --dry-run

# Full ingest (requires GOOGLE_API_KEY + PINECONE_API_KEY)
python scripts/ingest.py --force

# Chunk only
python scripts/ingest.py --skip-embed --force

# Run API locally
uvicorn vaxify_rag.api.main:app --reload --port 8001
```

## Embedding model

Uses **`gemini-embedding-001`** with `output_dimensionality=768` and L2 normalization.
`EMBEDDING_MODEL`, `EMBEDDING_DIMENSION`, and Pinecone index dimension must stay aligned.

Free-tier Gemini limits (~100 embed units/minute) are handled by:
- batched `embed_content` calls (`EMBEDDING_BATCH_SIZE`, default 16)
- client-side pacing (`EMBEDDING_MAX_PER_MINUTE`, default 80)
- 429 handling that waits for the server retry delay (default 60s)

## Spec

Authoritative ingestion rules: `../RAG_KNOWLEDGE_BASE_SPEC.md`

Only chunks with `retrievable=true` and `superseded=false` are upserted to Pinecone.
