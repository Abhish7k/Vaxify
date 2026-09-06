FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pyproject.toml .
COPY config ./config
COPY knowledge-base ./knowledge-base
COPY src ./src
COPY scripts ./scripts

ENV PYTHONPATH=/app/src
ENV PORT=8001

EXPOSE 8001

# Runtime only — ingestion is run separately via scripts/ingest.py
CMD ["sh", "-c", "uvicorn vaxify_rag.api.main:app --host 0.0.0.0 --port ${PORT}"]
