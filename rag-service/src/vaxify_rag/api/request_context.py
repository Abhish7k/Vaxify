"""Request correlation helpers for structured logs."""

from __future__ import annotations

import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-Id"


def new_request_id() -> str:
    return uuid.uuid4().hex[:12]


def bind_request_id(request_id: str) -> None:
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)


def current_request_id() -> str | None:
    context = structlog.contextvars.get_contextvars()
    value = context.get("request_id")
    return str(value) if value else None


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        incoming = (request.headers.get(REQUEST_ID_HEADER) or "").strip()
        request_id = incoming or new_request_id()
        bind_request_id(request_id)
        request.state.request_id = request_id
        try:
            response = await call_next(request)
        finally:
            structlog.contextvars.clear_contextvars()
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
