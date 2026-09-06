import logging
from backend.config import GEMINI_API_KEY, GEMINI_MODEL, is_gemini_available

logger = logging.getLogger("backend.gemini_service")

SYSTEM_PROMPT = """
You are an AI Legal Moot Court Assistant designed for law students.

Your purpose is EDUCATIONAL ONLY.

You simulate a legal moot court debate and help students
practice legal reasoning and argumentation.

IMPORTANT RULES:

1. Do NOT provide professional legal advice.

2. NEVER invent:
   - Court cases
   - Case names
   - Case citations
   - Statutes
   - Sections of statutes
   - Judgments
   - Legal precedents
   - Legal quotations

3. Use general legal principles and legal reasoning.

4. NEVER invent facts that are not provided by the student.

5. Respect the jurisdiction provided by the student.

6. The AI must ALWAYS argue from the OPPOSITE SIDE
   of the student's position.

7. Do not simply agree with the student.

8. Challenge weak assumptions and reasoning.

9. Identify weaknesses in the student's argument.

10. Anticipate possible rebuttals.

11. Ask meaningful questions that a moot court opponent
    could ask the student.

12. Keep the response structured and understandable
    for a law student.

13. Clearly distinguish between:
    - Facts provided by the student
    - General legal reasoning
    - Arguments made by the AI

14. If the supplied facts are insufficient to support
    a conclusion, say so instead of inventing facts.

15. Do not claim that a legal rule definitely applies
    unless the supplied information supports that reasoning.

This is a hypothetical educational simulation,
not a real legal proceeding.
"""

_client = None

def get_client():
    global _client
    if _client is not None:
        return _client
    if not is_gemini_available():
        raise RuntimeError("GEMINI_API_KEY is not configured or is invalid.")
    
    try:
        from google import genai
        _client = genai.Client(api_key=GEMINI_API_KEY)
        return _client
    except Exception as exc:
        logger.error(f"Failed to initialize google.genai client: {exc}")
        raise

def generate_gemini_response(prompt: str, system_prompt: str = SYSTEM_PROMPT, max_tokens: int = 1800) -> str:
    """
    Calls the Gemini API using google-genai Client.
    Tries primary model with resilient fallbacks if needed.
    """
    client = get_client()

    candidate_models = [
        GEMINI_MODEL,
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.0-flash"
    ]
    # Remove duplicates preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    last_error = None
    for model_name in models_to_try:
        try:
            logger.info(f"Generating Gemini response with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={
                    "system_instruction": system_prompt,
                    "max_output_tokens": max_tokens,
                    "temperature": 0.3
                }
            )
            if response and hasattr(response, "text") and response.text:
                return response.text
        except Exception as exc:
            logger.warning(f"Error calling Gemini model '{model_name}': {exc}")
            last_error = exc
            # If it's a quota or permission issue, subsequent models may fail too, but let's try fallback
            continue

    raise RuntimeError(f"Gemini API generation failed across models: {last_error}")
