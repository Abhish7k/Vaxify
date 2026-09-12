# Vaxify RAG Service

Python RAG pipeline for the Vaxify vaccine knowledge base (ingest → retrieve → grounded ask).

## Pipeline

```
PDF/HTML → extraction → normalization → selection → semantic chunking
→ metadata enrichment → Gemini embeddings → Pinecone upsert

user question → Retriever → evidence sufficiency → Gemini answer OR abstain → citations
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

# Phase 2A retrieval (requires GOOGLE_API_KEY + PINECONE_API_KEY)
python scripts/retrieve.py "What vaccines are given at birth?"
python scripts/retrieve.py --eval

# Phase 2B grounded ask (requires GOOGLE_API_KEY + PINECONE_API_KEY)
python scripts/ask.py "What vaccines are given at birth?"
python scripts/ask.py --eval --output data/ask_eval.json

# Run API locally
uvicorn vaxify_rag.api.main:app --reload --port 8001
```

## Retrieval (Phase 2A)

`Retriever` embeds the query with the same Gemini model/dimension as ingestion, then
queries Pinecone with metadata filters `superseded=false` and `retrievable=true`.
Near-equal cosine scores are broken by lower `authority_rank` (higher precedence).

## Grounded ask (Phase 2B)

`AskService` reuses `Retriever`, then runs a multi-signal evidence check (top score +
term overlap). If evidence is sufficient, Gemini (`GENERATION_MODEL`) answers **only**
from retrieved chunks and returns citations from that evidence. Otherwise it abstains.
No LangChain / agents.
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
