import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.services.debate_service import (
    get_opposite_position,
    generate_opposition,
    generate_debate_summary,
    generate_irac_data,
    generate_counter_argument_data,
    generate_plain_language_data,
    generate_strength_score
)

logger = logging.getLogger("backend.debate_routes")

router = APIRouter(prefix="/debate", tags=["Debate"])

# ============================================================
# SCHEMAS
# ============================================================

class StartDebateRequest(BaseModel):
    case_facts: str = Field(..., description="Material case facts")
    legal_issue: Optional[str] = Field(default="", description="Central legal issue")
    subject: Optional[str] = Field(default="Contract Law", description="Legal subject area")
    jurisdiction: Optional[str] = Field(default="India (Common Law)", description="Legal jurisdiction")
    user_position: str = Field(..., description="Student position: FOR or AGAINST")

class DebateArgumentRequest(BaseModel):
    case_facts: str = Field(..., description="Material case facts")
    legal_issue: Optional[str] = Field(default="", description="Central legal issue")
    subject: Optional[str] = Field(default="Contract Law", description="Legal subject area")
    jurisdiction: Optional[str] = Field(default="India (Common Law)", description="Legal jurisdiction")
    user_position: str = Field(..., description="Student position: FOR or AGAINST")
    user_argument: str = Field(..., description="Student legal argument or rebuttal")
    debate_history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous debate rounds")
    provider: Optional[str] = Field(default="auto", description="Preferred AI provider ('gemini', 'groq', 'auto')")

class EndDebateRequest(BaseModel):
    case_facts: str
    legal_issue: Optional[str] = ""
    user_position: str
    debate_history: List[Dict[str, Any]]
    provider: Optional[str] = "auto"

class IracRequest(BaseModel):
    facts: str
    issue: Optional[str] = ""
    subject: Optional[str] = "Contract Law"
    jurisdiction: Optional[str] = "India (Common Law)"
    student_position: Optional[str] = "FOR"

class CounterArgumentRequest(BaseModel):
    facts: str
    issue: Optional[str] = ""
    subject: Optional[str] = "Contract Law"
    jurisdiction: Optional[str] = "India (Common Law)"
    student_position: Optional[str] = "FOR"
    irac_summary: Optional[str] = ""

class ExplainerRequest(BaseModel):
    facts: str
    issue: Optional[str] = ""
    subject: Optional[str] = "Contract Law"
    irac_summary: Optional[str] = ""

class StrengthScoreRequest(BaseModel):
    facts: str
    issue: Optional[str] = ""
    subject: Optional[str] = "Contract Law"
    student_position: Optional[str] = "FOR"
    irac_summary: Optional[str] = ""

# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/start")
def start_debate(req: StartDebateRequest):
    """
    Validates case information and establishes moot court sides.
    Ensures AI strictly takes the opposite position of the student.
    """
    if not req.case_facts.strip():
        raise HTTPException(status_code=400, detail="Case facts are required.")

    ai_position = get_opposite_position(req.user_position)
    if not ai_position:
        raise HTTPException(
            status_code=400,
            detail="Invalid position. Please select FOR or AGAINST."
        )

    return {
        "success": True,
        "user_position": req.user_position.strip().upper(),
        "ai_position": ai_position,
        "message": f"Debate started. You represent {req.user_position.strip().upper()}; AI opposing counsel represents {ai_position}."
    }

@router.post("/argument")
def submit_argument(req: DebateArgumentRequest):
    """
    Submits a student's legal argument or oral rebuttal.
    Generates an adversarial response from opposing counsel using the primary AI engine.
    """
    if not req.case_facts.strip():
        raise HTTPException(status_code=400, detail="Case facts are required.")

    if not req.user_argument.strip():
        raise HTTPException(status_code=400, detail="Student argument cannot be empty.")

    ai_pos = get_opposite_position(req.user_position)
    if not ai_pos:
        raise HTTPException(
            status_code=400,
            detail="Invalid student position. Must be FOR or AGAINST."
        )

    try:
        result = generate_opposition(
            case_facts=req.case_facts,
            legal_issue=req.legal_issue or "Core legal issue",
            subject=req.subject or "General Law",
            jurisdiction=req.jurisdiction or "General Common Law Principles",
            user_position=req.user_position,
            user_argument=req.user_argument,
            debate_history=req.debate_history or [],
            preferred_provider=req.provider or "auto"
        )

        current_round = len(req.debate_history or []) + 1

        return {
            "success": True,
            "round": current_round,
            "user_position": result["user_position"],
            "ai_position": result["ai_position"],
            "ai_response": result["ai_response"],
            "provider": result["provider"]
        }

    except Exception as exc:
        logger.error(f"Error in submit_argument: {exc}")
        raise HTTPException(status_code=500, detail=f"AI opposing counsel error: {str(exc)}")

@router.post("/end")
def end_debate(req: EndDebateRequest):
    """
    Concludes the moot court debate and produces a comprehensive performance evaluation.
    """
    try:
        summary = generate_debate_summary(
            case_facts=req.case_facts,
            legal_issue=req.legal_issue or "Core legal issue",
            user_position=req.user_position,
            debate_history=req.debate_history,
            preferred_provider=req.provider or "auto"
        )
        return {
            "success": True,
            "rounds_completed": len(req.debate_history),
            "summary": summary
        }
    except Exception as exc:
        logger.error(f"Error generating debate summary: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to generate debate summary: {str(exc)}")

@router.post("/irac")
def get_irac(req: IracRequest):
    """
    Generates an educational IRAC brief using the backend AI engine.
    """
    try:
        data = generate_irac_data(
            facts=req.facts,
            issue=req.issue or "",
            subject=req.subject or "Contract Law",
            jurisdiction=req.jurisdiction or "India (Common Law)",
            student_position=req.student_position or "FOR"
        )
        return {"success": True, "irac": data}
    except Exception as exc:
        logger.error(f"IRAC generation error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/counter")
def get_counter_argument(req: CounterArgumentRequest):
    """
    Generates the opposition's likely strongest arguments against the
    student's specific case (Counter-argument mode).
    """
    if not req.facts.strip():
        raise HTTPException(status_code=400, detail="Case facts are required.")
    try:
        data = generate_counter_argument_data(
            facts=req.facts,
            issue=req.issue or "",
            subject=req.subject or "Contract Law",
            jurisdiction=req.jurisdiction or "India (Common Law)",
            student_position=req.student_position or "FOR",
            irac_summary=req.irac_summary or ""
        )
        return {"success": True, "counter": data}
    except Exception as exc:
        logger.error(f"Counter-argument generation error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/explain")
def get_plain_language_explainer(req: ExplainerRequest):
    """
    Rewrites this specific case's legal reasoning in plain, jargon-free
    language (Plain-language explainer mode).
    """
    if not req.facts.strip():
        raise HTTPException(status_code=400, detail="Case facts are required.")
    try:
        data = generate_plain_language_data(
            facts=req.facts,
            issue=req.issue or "",
            subject=req.subject or "Contract Law",
            irac_summary=req.irac_summary or ""
        )
        return {"success": True, "explainer": data}
    except Exception as exc:
        logger.error(f"Plain-language explainer error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/score")
def get_strength_score(req: StrengthScoreRequest):
    """
    Gives informal, educational feedback on how well-structured and
    persuasive the student's specific argument is (Argument strength scoring).
    """
    if not req.facts.strip():
        raise HTTPException(status_code=400, detail="Case facts are required.")
    try:
        data = generate_strength_score(
            facts=req.facts,
            issue=req.issue or "",
            subject=req.subject or "Contract Law",
            student_position=req.student_position or "FOR",
            irac_summary=req.irac_summary or ""
        )
        return {"success": True, "score": data}
    except Exception as exc:
        logger.error(f"Strength scoring error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
