"""Additive security and validation layer for the Lexora submission build.

This module intentionally lives outside the original application files. The
existing backend remains unchanged; `backend.enhanced_main` opts into these
controls for a hardened submission/demo run.
"""

from __future__ import annotations

import os
import re
import time
from collections import defaultdict, deque
from typing import Deque, Dict, Optional

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

MAX_BODY_BYTES = int(os.getenv("LEXORA_MAX_BODY_BYTES", "1048576"))  # 1 MiB
MAX_FACTS_CHARS = int(os.getenv("LEXORA_MAX_FACTS_CHARS", "20000"))
MAX_FIELD_CHARS = int(os.getenv("LEXORA_MAX_FIELD_CHARS", "4000"))
RATE_LIMIT_REQUESTS = int(os.getenv("LEXORA_RATE_LIMIT_REQUESTS", "60"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("LEXORA_RATE_LIMIT_WINDOW_SECONDS", "60"))

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")


def clean_text(value: Optional[str], *, max_chars: int = MAX_FIELD_CHARS) -> str:
    """Normalize untrusted text without changing ordinary legal punctuation."""
    if value is None:
        return ""
    cleaned = _CONTROL_CHARS.sub("", str(value)).strip()
    if len(cleaned) > max_chars:
        raise HTTPException(status_code=422, detail=f"Input exceeds the {max_chars:,}-character limit.")
    return cleaned


def validate_case_input(*, facts: str, issue: str = "", subject: str = "", jurisdiction: str = "") -> dict:
    """Validate case inputs before an AI call; returns normalized values."""
    facts_clean = clean_text(facts, max_chars=MAX_FACTS_CHARS)
    issue_clean = clean_text(issue)
    subject_clean = clean_text(subject, max_chars=200)
    jurisdiction_clean = clean_text(jurisdiction, max_chars=200)

    if len(facts_clean) < 30:
        raise HTTPException(
            status_code=422,
            detail="Please provide at least 30 characters of material case facts; very short or nonsensical input is not sufficient for practice generation.",
        )
    if issue_clean and len(issue_clean) < 5:
        raise HTTPException(status_code=422, detail="If supplied, the legal issue should contain at least 5 meaningful characters.")

    return {
        "facts": facts_clean,
        "issue": issue_clean,
        "subject": subject_clean,
        "jurisdiction": jurisdiction_clean,
    }


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject oversized requests before expensive AI processing."""

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_BODY_BYTES:
                    return JSONResponse(status_code=413, content={"success": False, "error": "Request body is too large."})
            except ValueError:
                return JSONResponse(status_code=400, content={"success": False, "error": "Invalid Content-Length header."})
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply browser-facing security headers without requiring frontend edits."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "microphone=(self), camera=(), geolocation=()")
        response.headers.setdefault("Cache-Control", "no-store" if request.url.path.startswith("/api/") else "no-cache")
        return response


class SlidingWindowRateLimiter(BaseHTTPMiddleware):
    """Small dependency-free in-memory limiter suitable for an MVP/demo server."""

    def __init__(self, app, requests: int = RATE_LIMIT_REQUESTS, window_seconds: int = RATE_LIMIT_WINDOW_SECONDS):
        super().__init__(app)
        self.requests = max(1, requests)
        self.window_seconds = max(1, window_seconds)
        self._events: Dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next) -> Response:
        if not request.url.path.startswith("/api/") or request.method.upper() in {"GET", "HEAD", "OPTIONS"}:
            return await call_next(request)

        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        bucket = self._events[client]
        cutoff = now - self.window_seconds
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

        if len(bucket) >= self.requests:
            retry_after = max(1, int(bucket[0] + self.window_seconds - now))
            return JSONResponse(
                status_code=429,
                content={"success": False, "error": "Rate limit exceeded. Please retry shortly."},
                headers={"Retry-After": str(retry_after)},
            )

        bucket.append(now)
        return await call_next(request)


class CaseValidationMiddleware(BaseHTTPMiddleware):
    """Validate common debate payloads before they reach AI provider code."""

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method.upper() != "POST" or not request.url.path.startswith("/api/debate/"):
            return await call_next(request)
        content_type = request.headers.get("content-type", "")
        if "application/json" not in content_type:
            return await call_next(request)
        try:
            raw = await request.body()
            import json
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            return JSONResponse(status_code=400, content={"success": False, "error": "Request body must be valid JSON."})
        if isinstance(payload, dict):
            facts = payload.get("facts", payload.get("case_facts", ""))
            issue = payload.get("issue", payload.get("legal_issue", ""))
            if facts is not None:
                try:
                    validate_case_input(facts=str(facts), issue=str(issue or ""), subject=str(payload.get("subject") or ""), jurisdiction=str(payload.get("jurisdiction") or ""))
                except HTTPException as exc:
                    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": exc.detail})
        return await call_next(request)


def install_hardening(app):
    """Install additive middleware on an existing FastAPI application."""
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware)
    app.add_middleware(SlidingWindowRateLimiter)
    app.add_middleware(CaseValidationMiddleware)
    return app
