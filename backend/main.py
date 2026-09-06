import logging
import sys
from pathlib import Path

# Add repo root to python path so 'backend' package imports work cleanly
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import HOST, PORT, is_gemini_available, is_groq_available
from backend.routes.health_routes import router as health_router
from backend.routes.debate_routes import router as debate_router
from backend.routes.voice_routes import router as voice_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend.main")

# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Lexora AI Moot Court API",
    description="Backend API powering AI moot court simulations, opposing counsel reasoning, and speech integration.",
    version="1.0.0"
)

# ============================================================
# CORS MIDDLEWARE
# ============================================================

# NOTE: allow_origins=["*"] combined with allow_credentials=True is invalid per the
# CORS spec — browsers will silently reject credentialed requests against a wildcard
# origin. This app doesn't use cookies/auth headers for CORS requests (the frontend
# talks to the backend via a same-origin dev proxy or a configured API base URL), so
# credentials are disabled and the wildcard origin is kept for easy local/demo setup.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An unexpected error occurred in the AI Moot Court backend.",
            "detail": str(exc)
        }
    )

# ============================================================
# ROUTER MOUNTING (Prefix /api)
# ============================================================

app.include_router(health_router, prefix="/api")
app.include_router(debate_router, prefix="/api")
app.include_router(voice_router, prefix="/api")

# Also mount /api directly for root ping
@app.get("/")
def root():
    return {
        "message": "Lexora AI Moot Court Backend is running.",
        "health": "/api/health",
        "docs": "/docs"
    }

@app.on_event("startup")
def on_startup():
    logger.info("=" * 60)
    logger.info("⚖️  LEXORA AI MOOT COURT BACKEND INITIALIZED")
    logger.info(f"Gemini Available: {is_gemini_available()}")
    logger.info(f"Groq Available:   {is_groq_available()}")
    logger.info(f"Listening on:     http://{HOST}:{PORT}")
    logger.info("=" * 60)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
