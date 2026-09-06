# Lexora Security & Robustness Layer

The original application files are preserved. The submission adds an opt-in hardened entry point: `backend.enhanced_main`.

## Controls

- Request body size limit (default 1 MiB)
- Per-client sliding-window API rate limiting (60 requests/minute by default)
- Server-side text normalization and length validation
- Short/nonsensical case-fact rejection before AI work
- Browser security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`
- No API keys in frontend code
- Existing server-side environment-variable key handling retained
- Educational disclaimer and source-verification policy retained

## Run hardened mode

```bash
python -m backend.enhanced_main
```

The normal `backend.main` entry point remains available and unchanged for compatibility.
