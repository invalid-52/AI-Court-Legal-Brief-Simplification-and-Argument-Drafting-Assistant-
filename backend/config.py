import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

# Load .env from backend folder first, fallback to root
backend_env = BASE_DIR / ".env"
root_env = ROOT_DIR / ".env"
legacy_env = BASE_DIR / "env"

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
elif legacy_env.exists():
    load_dotenv(legacy_env)
else:
    load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Models
# NOTE: "gemini-3.8-flash" / "gemini-3.6-flash" are not real Gemini model IDs — using a
# non-existent default silently forced every request onto the fallback list in
# gemini_service.py. Default to a real, current model instead.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

# Server
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

def is_gemini_available() -> bool:
    return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 5)

def is_groq_available() -> bool:
    return bool(GROQ_API_KEY and len(GROQ_API_KEY) > 5)
