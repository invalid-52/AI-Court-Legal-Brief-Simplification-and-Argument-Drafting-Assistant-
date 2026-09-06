import logging
from backend.config import GROQ_API_KEY, GROQ_MODEL, is_groq_available
from backend.services.gemini_service import SYSTEM_PROMPT

logger = logging.getLogger("backend.groq_service")

_client = None

def get_client():
    global _client
    if _client is not None:
        return _client
    if not is_groq_available():
        raise RuntimeError("GROQ_API_KEY is not configured.")
    try:
        from groq import Groq
        _client = Groq(api_key=GROQ_API_KEY)
        return _client
    except Exception as exc:
        logger.error(f"Failed to initialize Groq client: {exc}")
        raise

def generate_groq_response(prompt: str, system_prompt: str = SYSTEM_PROMPT, max_tokens: int = 1500) -> str:
    """
    Calls the Groq API using the configured Groq client and model.
    """
    client = get_client()
    try:
        logger.info(f"Generating Groq response with model: {GROQ_MODEL}")
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=max_tokens
        )
        if response and response.choices and len(response.choices) > 0:
            return response.choices[0].message.content or ""
        raise RuntimeError("Groq returned an empty response.")
    except Exception as exc:
        logger.error(f"Groq API error: {exc}")
        raise
