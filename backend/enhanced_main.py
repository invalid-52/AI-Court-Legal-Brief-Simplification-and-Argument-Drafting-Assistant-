"""Hardened additive entry point for the final submission.

The original backend.main is intentionally untouched. This module imports the
same application, adds security middleware, and mounts source-aware learning
retrieval so the original API and frontend contract remain intact.
"""

from backend.main import app
from backend.routes.learning_routes import router as learning_router
from backend.security_hardening import install_hardening

app.include_router(learning_router, prefix="/api")
install_hardening(app)


if __name__ == "__main__":
    import uvicorn
    from backend.config import HOST, PORT

    uvicorn.run("backend.enhanced_main:app", host=HOST, port=PORT, reload=False)
