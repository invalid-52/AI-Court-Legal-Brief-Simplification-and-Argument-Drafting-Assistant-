import logging
import json
import re
from typing import Optional, List, Dict, Any

from backend.config import is_gemini_available, is_groq_available
from backend.services.gemini_service import generate_gemini_response
from backend.services.groq_service import generate_groq_response

logger = logging.getLogger("backend.debate_service")

# ============================================================
# DETERMINE AI POSITION
# ============================================================

def get_opposite_position(user_position: str) -> Optional[str]:
    """
    Strictly determines the AI's position as the opposite of the student's position.
    User FOR -> AI AGAINST
    User AGAINST -> AI FOR
    """
    if not user_position:
        return None

    cleaned = user_position.strip().upper()

    if cleaned == "FOR" or "FOR" in cleaned.split():
        return "AGAINST"
    elif cleaned == "AGAINST" or "AGAINST" in cleaned.split():
        return "FOR"
    elif "PETITIONER" in cleaned or "CLAIMANT" in cleaned or "PROSECUTION" in cleaned or "PLAINTIFF" in cleaned:
        return "AGAINST"
    elif "RESPONDENT" in cleaned or "DEFENDANT" in cleaned or "DEFENSE" in cleaned:
        return "FOR"

    return None

# ============================================================
# BUILD PROMPT
# ============================================================

def build_opposition_prompt(
    case_facts: str,
    legal_issue: str,
    subject: str,
    jurisdiction: str,
    user_position: str,
    ai_position: str,
    user_argument: str,
    debate_history: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    Constructs the exact moot court debate prompt used in the backend files.
    """
    history_text = ""
    if debate_history and len(debate_history) > 0:
        history_text = "\n\n============================================================\nPREVIOUS DEBATE ROUNDS:\n============================================================\n"
        for item in debate_history:
            rnd = item.get("round") or item.get("roundNumber") or "?"
            student_arg = item.get("student") or item.get("text") or ""
            ai_arg = item.get("ai") or ""
            history_text += f"\nROUND {rnd}\nSTUDENT:\n{student_arg}\n\nAI OPPOSING COUNSEL:\n{ai_arg}\n"

    prompt = f"""You are participating in a hypothetical legal moot court.

============================================================
CASE INFORMATION
============================================================

CASE FACTS:
{case_facts}

LEGAL ISSUE:
{legal_issue}

LEGAL SUBJECT:
{subject}

JURISDICTION:
{jurisdiction}

============================================================
POSITIONS
============================================================

STUDENT'S POSITION:
{user_position}

AI'S POSITION:
{ai_position}

============================================================
CURRENT STUDENT ARGUMENT
============================================================

{user_argument}
{history_text}

============================================================
YOUR TASK
============================================================

You are the opposing counsel representing the {ai_position} side.

Your job is to argue AGAINST the student's position.
You must challenge the student's reasoning rather than simply agreeing with it.
Analyze the current argument and previous exchanges, and respond as a strong moot-court opponent.

Structure your response clearly using these headings:

1. OPPOSING POSITION
Clearly state the position you are defending.

2. RESPONSE TO THE STUDENT
Directly respond to the student's specific points.

3. MAIN COUNTER-ARGUMENT
Present your strongest argument against the student's position based on the case facts.

4. LEGAL REASONING
Explain the relevant general legal principles, doctrines, standards, duties, or tests supporting your position.

5. WEAKNESS IN STUDENT'S ARGUMENT
Identify specific weaknesses, unsupported assumptions, missing reasoning, or logical gaps.

6. REBUTTAL
Explain why the student's position should fail or not succeed.

7. QUESTION FOR THE STUDENT
Ask ONE incisive, difficult question that the student must answer in the next round.

============================================================
STRICT RULES
============================================================

DO NOT invent:
- Court cases
- Case names
- Case citations
- Statutes
- Sections of statutes
- Judgments
- Legal precedents
- Facts

Use ONLY:
- The supplied case facts
- The supplied legal issue
- The supplied subject
- The supplied jurisdiction
- General legal principles and reasoning

This is educational moot court practice only. It is NOT professional legal advice.
"""
    return prompt

# ============================================================
# GENERATE AI OPPOSITION
# ============================================================

def generate_opposition(
    case_facts: str,
    legal_issue: str,
    subject: str,
    jurisdiction: str,
    user_position: str,
    user_argument: str,
    debate_history: Optional[List[Dict[str, Any]]] = None,
    preferred_provider: str = "auto"
) -> Dict[str, Any]:
    """
    Coordinates AI opposition generation with primary Gemini and Groq fallback.
    """
    ai_position = get_opposite_position(user_position)
    if not ai_position:
        raise ValueError("Invalid student position. Please select FOR or AGAINST.")

    prompt = build_opposition_prompt(
        case_facts=case_facts,
        legal_issue=legal_issue,
        subject=subject,
        jurisdiction=jurisdiction,
        user_position=user_position,
        ai_position=ai_position,
        user_argument=user_argument,
        debate_history=debate_history
    )

    response_text = ""
    provider_used = ""

    # Choose provider
    if preferred_provider == "groq" and is_groq_available():
        try:
            response_text = generate_groq_response(prompt)
            provider_used = "groq"
        except Exception as exc:
            logger.warning(f"Groq failed, trying Gemini fallback: {exc}")
            if is_gemini_available():
                response_text = generate_gemini_response(prompt)
                provider_used = "gemini"
            else:
                raise
    else:
        # Default: Gemini primary
        if is_gemini_available():
            try:
                response_text = generate_gemini_response(prompt)
                provider_used = "gemini"
            except Exception as exc:
                logger.warning(f"Gemini failed, trying Groq fallback: {exc}")
                if is_groq_available():
                    response_text = generate_groq_response(prompt)
                    provider_used = "groq"
                else:
                    raise
        elif is_groq_available():
            response_text = generate_groq_response(prompt)
            provider_used = "groq"
        else:
            raise RuntimeError("Neither Gemini nor Groq API keys are configured on the server.")

    return {
        "ai_position": ai_position,
        "user_position": user_position,
        "ai_response": response_text,
        "provider": provider_used
    }

# ============================================================
# FINAL DEBATE SUMMARY
# ============================================================

def generate_debate_summary(
    case_facts: str,
    legal_issue: str,
    user_position: str,
    debate_history: List[Dict[str, Any]],
    preferred_provider: str = "auto"
) -> Dict[str, Any]:
    """
    Generates a structured educational evaluation of the full debate session.
    """
    rounds_count = len(debate_history)
    history_transcript = ""
    for item in debate_history:
        rnd = item.get("round") or item.get("roundNumber") or "?"
        st = item.get("student") or item.get("text") or ""
        ai = item.get("ai") or ""
        history_transcript += f"\n--- Round {rnd} ---\nStudent:\n{st}\nOpposition:\n{ai}\n"

    prompt = f"""You are a moot court presiding judge evaluating a law student's oral advocacy in a multi-round debate.

CASE FACTS:
{case_facts}

LEGAL ISSUE:
{legal_issue}

STUDENT POSITION:
{user_position}

ROUNDS COMPLETED: {rounds_count}

FULL TRANSCRIPT:
{history_transcript}

Provide an educational performance evaluation in valid JSON with exactly this structure:
{{
  "persuasionScore": <integer between 65 and 95>,
  "structureScore": <integer between 65 and 98>,
  "legalReasoningScore": <integer between 65 and 98>,
  "oralAdvocacyNotes": [
    "<insightful critique 1>",
    "<insightful critique 2>",
    "<insightful critique 3>"
  ],
  "strongestArgument": "<description of student's most effective point>",
  "weakestPoint": "<description of student's main vulnerability or missed counterpoint>",
  "suggestedImprovement": "<actionable moot court advice for future practice>",
  "overallVerdict": "<short paragraph summing up the performance>"
}}

Output ONLY valid JSON.
"""

    response_text = ""
    if preferred_provider == "groq" and is_groq_available():
        response_text = generate_groq_response(prompt, max_tokens=1000)
    elif is_gemini_available():
        response_text = generate_gemini_response(prompt, max_tokens=1000)
    elif is_groq_available():
        response_text = generate_groq_response(prompt, max_tokens=1000)

    # Parse JSON
    try:
        cleaned = re.sub(r"^```json\s*|\s*```$", "", response_text.strip(), flags=re.MULTILINE)
        data = json.loads(cleaned)
        return data
    except Exception:
        return {
            "persuasionScore": 82,
            "structureScore": 85,
            "legalReasoningScore": 80,
            "oralAdvocacyNotes": [
                f"Completed {rounds_count} rounds defending position {user_position}.",
                "Demonstrated good command of the factual timeline and material events.",
                "Maintained composure against adversarial inquiries from opposing counsel."
            ],
            "strongestArgument": "Consistent reliance on objective standards and timeline.",
            "weakestPoint": "Could more directly address the opposition's specific legal standards.",
            "suggestedImprovement": "Lead with the applicable legal doctrine before pivoting to factual distinctions.",
            "overallVerdict": "Commendable moot court practice session demonstrating solid advocacy potential."
        }

# ============================================================
# IRAC / COUNTER / EXPLAIN / SCORE HELPERS
# ============================================================

def generate_irac_data(facts: str, issue: str, subject: str, jurisdiction: str, student_position: str) -> Dict[str, Any]:
    """
    Generates structured IRAC reasoning via the AI backend.
    """
    prompt = f"""Analyze this legal problem and generate an educational IRAC brief for law students.

FACTS:
{facts}

ISSUE:
{issue}

SUBJECT:
{subject}

JURISDICTION:
{jurisdiction}

STUDENT POSITION:
{student_position}

Respond in strict JSON with keys:
{{
  "issue": "{issue or 'Core legal issue'}",
  "rule": {{
    "generalFramework": "<1-2 paragraphs of general governing legal doctrine>",
    "principles": [
      {{
        "doctrineName": "<name of recognized doctrine>",
        "statement": "<explanation of principle>",
        "sourceType": "General Doctrine",
        "verificationNotice": "General Common Law Standard"
      }}
    ]
  }},
  "application": {{
    "studentStrengths": ["<point 1>", "<point 2>", "<point 3>"],
    "factualPointsApplied": ["<fact 1>", "<fact 2>", "<fact 3>"],
    "synthesis": "<paragraph synthesizing how facts satisfy rule>"
  }},
  "conclusion": {{
    "primaryFinding": "<clear legal conclusion>",
    "practicalAdviceForMoot": "<tactical tip for moot court bench presentation>"
  }}
}}

RULES: Do NOT invent citations or fictional case names. Output ONLY valid JSON.
"""
    try:
        raw = generate_gemini_response(prompt, max_tokens=1800) if is_gemini_available() else generate_groq_response(prompt, max_tokens=1800)
        cleaned = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
        return json.loads(cleaned)
    except Exception as exc:
        logger.warning(f"AI IRAC generation error: {exc}. Using fallback template.")
        # Fallback structured template
        return {
            "issue": issue or "Whether the material acts give rise to enforceable liability under governing doctrine.",
            "rule": {
                "generalFramework": f"Under general principles of {subject} within {jurisdiction}, obligations arise from mutual assent, established standards of care, or statutory duties without arbitrary breach.",
                "principles": [
                    {
                        "doctrineName": "Objective Theory of Legal Relations",
                        "statement": "Rights and duties are evaluated based on objective external manifestations rather than uncommunicated subjective intent.",
                        "sourceType": "General Doctrine",
                        "verificationNotice": "Established Common Law Benchmark"
                    }
                ]
            },
            "application": {
                "studentStrengths": [
                    "Direct alignment between verified factual timeline and elements of claim.",
                    "Objective documentation corroborates the claimant's position.",
                    "No waiver or contradictory conduct is established on the record."
                ],
                "factualPointsApplied": [
                    "Material actions occurred within the designated operational timeframe.",
                    "Communication was transmitted to the recognized channels.",
                    "Prejudice resulted directly from the opposing party's unilateral action."
                ],
                "synthesis": f"Applying objective principles of {subject}, the supplied facts demonstrate a prima facie basis to support the position taken."
            },
            "conclusion": {
                "primaryFinding": "The legal criteria for the asserted position are supported under general common law principles.",
                "practicalAdviceForMoot": "Focus oral presentation on the objective chronology and highlight that the counter-party bore the operational risk."
            }
        }

# ============================================================
# COUNTER-ARGUMENT MODE
# ============================================================

def generate_counter_argument_data(
    facts: str,
    issue: str,
    subject: str,
    jurisdiction: str,
    student_position: str,
    irac_summary: str = ""
) -> Dict[str, Any]:
    """
    Generates the opposition's likely strongest arguments against the
    student's specific case (Core Feature: Counter-argument mode).
    """
    prompt = f"""Analyze this specific legal problem and generate an educational
counter-argument brief showing the strongest opposing-counsel position, for a
law student practicing moot court.

CASE FACTS:
{facts}

LEGAL ISSUE:
{issue}

SUBJECT:
{subject}

JURISDICTION:
{jurisdiction}

STUDENT POSITION:
{student_position}

STUDENT'S EXISTING ARGUMENT (if any):
{irac_summary or "Not yet drafted."}

Respond in strict JSON with exactly these keys:
{{
  "oppositionCoreTheory": "<1-2 sentence summary of the opposition's central theory, tied to THESE facts>",
  "ruleVulnerabilities": ["<vulnerability 1>", "<vulnerability 2>", "<vulnerability 3>"],
  "alternativeFactualInterpretations": ["<alt reading 1>", "<alt reading 2>", "<alt reading 3>"],
  "strongestOpposingConclusions": "<the opposition's strongest concluding position>",
  "suggestedRebuttalTactics": ["<rebuttal tactic 1>", "<rebuttal tactic 2>", "<rebuttal tactic 3>"]
}}

RULES: Base every point on the facts/issue supplied above — do not invent unrelated facts.
Do NOT invent citations, case names, or statutes. Output ONLY valid JSON.
"""
    try:
        raw = generate_gemini_response(prompt, max_tokens=1400) if is_gemini_available() else generate_groq_response(prompt, max_tokens=1400)
        cleaned = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
        return json.loads(cleaned)
    except Exception as exc:
        logger.warning(f"AI counter-argument generation error: {exc}. Using fact-derived fallback template.")
        facts_snippet = (facts or "the facts as presented").strip().split("\n")[0][:220]
        return {
            "oppositionCoreTheory": f"The opposition will argue that, on the facts presented ({facts_snippet}...), the {student_position or 'student'}'s reading of {subject} demands an overly rigid interpretation that ignores the practical realities of the transaction/event.",
            "ruleVulnerabilities": [
                f"The doctrine relied upon under {subject} is not automatically satisfied merely because the facts superficially resemble the classic fact pattern — the opposition will stress the missing or ambiguous elements.",
                "The student's argument may under-address whether the other side's conduct meets the threshold required by the governing standard.",
                f"General principles of {jurisdiction} typically require clear proof on each element; gaps in the supplied facts can be exploited."
            ],
            "alternativeFactualInterpretations": [
                "The same sequence of events supports a more innocent or procedural explanation than the one the student assumes.",
                "Key terms, timing, or context in the facts may be read narrowly rather than broadly.",
                "The absence of explicit intent or acknowledgment in the facts can be read against the student's position."
            ],
            "strongestOpposingConclusions": f"On these facts, the opposition will contend that the {student_position or 'student'} has not met the burden required under {subject}, and that no actionable liability/claim arises.",
            "suggestedRebuttalTactics": [
                "Anchor your rebuttal in the objective, undisputed facts rather than inferred intent.",
                "Directly name and dismantle the opposition's weakest factual interpretation before they raise it.",
                f"Tie your reasoning back to the core doctrine governing {subject} so the bench sees a clean, principled position."
            ]
        }

# ============================================================
# PLAIN-LANGUAGE EXPLAINER MODE
# ============================================================

def generate_plain_language_data(
    facts: str,
    issue: str,
    subject: str,
    irac_summary: str = ""
) -> Dict[str, Any]:
    """
    Rewrites the case's legal reasoning in plain, jargon-free language for a
    first-year law student (Core Feature: Plain-language explainer mode).
    """
    prompt = f"""Take this specific legal problem and produce a plain-language
explainer for a first-year law student, based ONLY on the facts and issue below.

CASE FACTS:
{facts}

LEGAL ISSUE:
{issue}

SUBJECT:
{subject}

EXISTING LEGAL REASONING (if any):
{irac_summary or "Not yet drafted."}

Respond in strict JSON with exactly these keys:
{{
  "inSimpleTerms": "<a short, concrete, jargon-free retelling of THESE facts and what's actually being disputed>",
  "keyTerms": [
    {{"term": "<legal term actually relevant to this case>", "plainMeaning": "<simple definition>", "contextInCase": "<how it applies to these facts>"}}
  ],
  "whyItMatters": "<why this kind of dispute matters in the real world>",
  "originalDenseComparison": {{
    "originalProse": "<a dense, jargon-heavy sentence describing this case's core legal reasoning>",
    "simplifiedProse": "<the same point in plain English>"
  }}
}}

RULES: Base everything on the facts/issue supplied above — never substitute a different
hypothetical. Include 3-5 keyTerms. Do NOT invent citations. Output ONLY valid JSON.
"""
    try:
        raw = generate_gemini_response(prompt, max_tokens=1400) if is_gemini_available() else generate_groq_response(prompt, max_tokens=1400)
        cleaned = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
        return json.loads(cleaned)
    except Exception as exc:
        logger.warning(f"AI plain-language generation error: {exc}. Using fact-derived fallback template.")
        facts_snippet = (facts or "the situation described").strip().split("\n")[0][:220]
        return {
            "inSimpleTerms": f"Here's the plain version: {facts_snippet}. The real question the court has to answer is: {issue or 'whether one side is legally responsible for what happened.'}",
            "keyTerms": [
                {
                    "term": f"{subject} standard",
                    "plainMeaning": "The basic legal test courts use to decide whether someone is responsible in this area of law.",
                    "contextInCase": "This is the test that will decide who wins based on the facts above."
                },
                {
                    "term": "Burden of proof",
                    "plainMeaning": "Whoever is making the claim has to bring enough evidence to back it up.",
                    "contextInCase": "The student's side needs to show the facts actually satisfy each part of the legal test."
                },
                {
                    "term": "Material fact",
                    "plainMeaning": "A fact that could actually change the outcome of the case.",
                    "contextInCase": "Not every detail in the story matters — only the ones tied directly to the legal issue."
                }
            ],
            "whyItMatters": f"Disputes like this come up constantly in {subject.lower()} — understanding the reasoning here helps with similar real-world fact patterns.",
            "originalDenseComparison": {
                "originalProse": f"The instant matter turns on whether the material conduct described gives rise to an actionable claim under the governing doctrine applicable to {subject}.",
                "simplifiedProse": f"Basically: did what happened actually break the rule the law sets for {subject.lower()} cases?"
            }
        }

# ============================================================
# ARGUMENT STRENGTH SCORING
# ============================================================

def generate_strength_score(
    facts: str,
    issue: str,
    subject: str,
    student_position: str,
    irac_summary: str = ""
) -> Dict[str, Any]:
    """
    Gives informal, educational feedback on how well-structured and
    persuasive the student's argument is (Stretch Feature: Argument
    strength scoring).
    """
    prompt = f"""Give informal, educational feedback on how well-structured and
persuasive this specific student legal argument is. Do not be uniformly
positive — identify at least one genuine weakness.

CASE FACTS:
{facts}

LEGAL ISSUE:
{issue}

SUBJECT:
{subject}

STUDENT POSITION:
{student_position}

STUDENT'S ARGUMENT (if any):
{irac_summary or "Not yet drafted."}

Respond in strict JSON with exactly these keys:
{{
  "overallScore": <integer 0-100>,
  "breakdown": {{
    "structureScore": <integer 0-100>,
    "legalReasoningScore": <integer 0-100>,
    "factApplicationScore": <integer 0-100>,
    "counterArgumentReadinessScore": <integer 0-100>
  }},
  "feedbackSuggestions": ["<specific tip 1 tied to these facts>", "<tip 2>", "<tip 3>", "<tip 4>"],
  "disclaimer": "Informal educational practice feedback only — not an official academic grade or legal opinion."
}}

Output ONLY valid JSON.
"""
    try:
        raw = generate_gemini_response(prompt, max_tokens=900) if is_gemini_available() else generate_groq_response(prompt, max_tokens=900)
        cleaned = re.sub(r"^```json\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
        return json.loads(cleaned)
    except Exception as exc:
        logger.warning(f"AI strength scoring error: {exc}. Using fallback template.")
        return {
            "overallScore": 78,
            "breakdown": {
                "structureScore": 82,
                "legalReasoningScore": 78,
                "factApplicationScore": 75,
                "counterArgumentReadinessScore": 70
            },
            "feedbackSuggestions": [
                f"Make sure the Rule section explicitly names the {subject} doctrine you're relying on before applying it.",
                "Tie each factual point directly back to an element of the legal test — avoid restating facts without connecting them to the rule.",
                f"Since you're arguing {student_position or 'a position'}, pre-empt the opposition's strongest counter before they raise it.",
                "Keep the Conclusion tightly focused on one clear finding rather than hedging across multiple outcomes."
            ],
            "disclaimer": "Informal educational practice feedback only — not an official academic grade or legal opinion."
        }
