import datetime
from fastapi import APIRouter
from backend.config import is_gemini_available, is_groq_available, GEMINI_MODEL, GROQ_MODEL

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    """
    Returns backend health status, AI provider availability, and capabilities.
    Does not expose sensitive API keys.
    """
    gemini_ok = is_gemini_available()
    groq_ok = is_groq_available()

    # Check speech recognition import
    transcription_ok = False
    try:
        import speech_recognition as sr
        transcription_ok = True
    except ImportError:
        pass

    # Check pyttsx3 import
    tts_ok = False
    try:
        import pyttsx3
        tts_ok = True
    except ImportError:
        pass

    return {
        "status": "healthy",
        "backend": "connected",
        "providers": {
            "gemini": {
                "configured": gemini_ok,
                "model": GEMINI_MODEL,
                "role": "primary"
            },
            "groq": {
                "configured": groq_ok,
                "model": GROQ_MODEL,
                "role": "alternative"
            }
        },
        "voice": {
            "transcription_available": transcription_ok,
            "tts_available": tts_ok
        },
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
