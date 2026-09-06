from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.security_hardening import clean_text
from backend.services.legal_rag_service import build_source_aware_context

router = APIRouter(prefix="/learning", tags=["Source-aware Legal Learning"])


class RetrievalRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=4000)
    jurisdiction: Optional[str] = Field(default="", max_length=200)
    subject: Optional[str] = Field(default="", max_length=200)
    top_k: int = Field(default=4, ge=1, le=8)


@router.post("/retrieve")
def retrieve(req: RetrievalRequest):
    query = clean_text(req.query, max_chars=4000)
    if len(query) < 3:
        raise HTTPException(status_code=422, detail="Learning query is too short.")
    return {"success": True, **build_source_aware_context(query, jurisdiction=clean_text(req.jurisdiction, max_chars=200), subject=clean_text(req.subject, max_chars=200))}


@router.get("/sources")
def sources():
    return {
        "success": True,
        "description": "Local curated educational notes used by the additive RAG layer. They are study aids, not legal authority.",
        "verificationRequired": True,
    }

class GroundedIracRequest(BaseModel):
    facts: str = Field(..., min_length=30, max_length=20000)
    issue: Optional[str] = Field(default="", max_length=4000)
    jurisdiction: Optional[str] = Field(default="India (Common Law)", max_length=200)
    subject: Optional[str] = Field(default="Contract Law", max_length=200)
    student_position: Optional[str] = Field(default="FOR", max_length=100)


@router.post("/grounded-irac")
def grounded_irac(req: GroundedIracRequest):
    """Generate an educational IRAC draft using retrieved local source context."""
    from backend.config import is_gemini_available, is_groq_available
    from backend.services.gemini_service import generate_gemini_response
    from backend.services.groq_service import generate_groq_response

    normalized = clean_text(req.facts, max_chars=20000)
    if len(normalized) < 30:
        raise HTTPException(status_code=422, detail="Please provide at least 30 characters of material case facts.")

    grounded = build_source_aware_context(
        f"{req.issue} {req.subject} {req.jurisdiction} {normalized}",
        jurisdiction=clean_text(req.jurisdiction, max_chars=200),
        subject=clean_text(req.subject, max_chars=200),
    )
    if not grounded["matches"]:
        raise HTTPException(status_code=422, detail="No educational source context matched this query. Use the existing general IRAC mode or add verified course material separately.")

    prompt = f"""Create an EDUCATIONAL moot-court IRAC practice outline.\n\nCASE FACTS (student supplied):\n{normalized}\n\nISSUE:\n{clean_text(req.issue, max_chars=4000)}\n\nSUBJECT: {clean_text(req.subject, max_chars=200)}\nJURISDICTION: {clean_text(req.jurisdiction, max_chars=200)}\nSTUDENT POSITION: {clean_text(req.student_position, max_chars=100)}\n\nRETRIEVED EDUCATIONAL CONTEXT:\n{grounded['context']}\n\nRules: distinguish supplied facts from retrieved context; do not invent cases, citations, statutes, sections, quotations, or facts; do not present retrieved notes as authoritative; explicitly flag verification needs. Return concise headings: Issue, Source-grounded Rule, Application, Conclusion, Sources Used, Verification Notes.\n"""

    try:
        if is_gemini_available():
            output = generate_gemini_response(prompt, max_tokens=1800)
            provider = "gemini"
        elif is_groq_available():
            output = generate_groq_response(prompt, max_tokens=1500)
            provider = "groq"
        else:
            raise HTTPException(status_code=503, detail="No AI provider is configured. The source retrieval endpoint remains available without an AI key.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI generation failed after source retrieval. Please retry or use the retrieval results directly.") from exc

    return {"success": True, "provider": provider, "irac": output, "sources": grounded["matches"], "educationalOnly": True}
