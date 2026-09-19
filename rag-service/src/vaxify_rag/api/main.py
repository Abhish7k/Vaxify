"""FastAPI application."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from vaxify_rag.api.ask import router as ask_router
from vaxify_rag.api.request_context import RequestIdMiddleware, current_request_id, new_request_id
from vaxify_rag.config import get_settings
from vaxify_rag.errors import (
    SAFE_MESSAGES,
    SERVICE_UNAVAILABLE,
    UNAUTHORIZED,
    UNKNOWN,
    VALIDATION_ERROR,
    RagError,
    classify_exception,
)
from vaxify_rag.logging import get_logger, setup_logging

logger = get_logger(__name__)


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", None) or current_request_id() or new_request_id()


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(title="Vaxify RAG Service", version="1.0.0")
    app.add_middleware(RequestIdMiddleware)
    app.include_router(ask_router)

    @app.exception_handler(RagError)
    async def handle_rag_error(request: Request, exc: RagError) -> JSONResponse:
        request_id = _request_id(request)
        logger.warning(
            "ask_failed",
            request_id=request_id,
            stage=exc.stage,
            provider=exc.provider,
            code=exc.code,
            http_status=exc.http_status,
            exception_type=exc.cause_type or type(exc).__name__,
            retry_after_seconds=exc.retry_after_seconds,
            detail=exc.detail,
        )
        headers = {}
        if exc.retry_after_seconds:
            headers["Retry-After"] = str(exc.retry_after_seconds)
        return JSONResponse(
            status_code=exc.http_status,
            content=exc.public_body(request_id),
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = _request_id(request)
        logger.info(
            "ask_validation_failed",
            request_id=request_id,
            stage="validation",
            code=VALIDATION_ERROR,
            http_status=400,
            exception_type=type(exc).__name__,
        )
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "code": VALIDATION_ERROR,
                "message": SAFE_MESSAGES[VALIDATION_ERROR],
                "request_id": request_id,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = _request_id(request)
        if exc.status_code == 401:
            code = UNAUTHORIZED
            message = SAFE_MESSAGES[UNAUTHORIZED]
        elif isinstance(exc.detail, dict) and "code" in exc.detail:
            code = str(exc.detail.get("code") or UNKNOWN)
            message = str(exc.detail.get("message") or SAFE_MESSAGES.get(code, SAFE_MESSAGES[UNKNOWN]))
        else:
            code = UNKNOWN if exc.status_code >= 500 else VALIDATION_ERROR
            message = str(exc.detail) if isinstance(exc.detail, str) else SAFE_MESSAGES[UNKNOWN]
            if exc.status_code == 503:
                code = SERVICE_UNAVAILABLE
                message = SAFE_MESSAGES[SERVICE_UNAVAILABLE]

        logger.warning(
            "ask_http_error",
            request_id=request_id,
            stage="http",
            code=code,
            http_status=exc.status_code,
            exception_type=type(exc).__name__,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "code": code,
                "message": message,
                "request_id": request_id,
            },
        )

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        request_id = _request_id(request)
        rag_error = classify_exception(exc, stage="ask")
        logger.error(
            "ask_unhandled_error",
            request_id=request_id,
            stage=rag_error.stage,
            provider=rag_error.provider,
            code=rag_error.code,
            http_status=rag_error.http_status,
            exception_type=type(exc).__name__,
            detail=str(exc)[:300],
        )
        return JSONResponse(
            status_code=rag_error.http_status,
            content=rag_error.public_body(request_id),
        )

    @app.get("/health")
    def health():
        settings = get_settings()
        return {
            "status": "ok",
            "service": "vaxify-rag",
            "embedding_model": settings.embedding_model,
            "embedding_dimension": settings.embedding_dimension,
            "generation_provider": "groq",
            "generation_model": settings.groq_model,
        }

    return app


app = create_app()
