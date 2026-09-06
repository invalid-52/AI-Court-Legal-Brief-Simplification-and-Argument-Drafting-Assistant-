import os
from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD GEMINI API KEY
# ============================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ GEMINI_API_KEY not found!")
    print("Please create a .env file and add:")
    print("GEMINI_API_KEY=your_api_key_here")
    exit()


# ============================================================
# CONNECT TO GEMINI
# ============================================================

client = genai.Client(
    api_key=api_key
)


# ============================================================
# AI SYSTEM PROMPT
# ============================================================

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


# ============================================================
# DETERMINE AI POSITION
# ============================================================

def get_opposite_position(user_position):

    user_position = user_position.strip().upper()

    if user_position == "FOR":
        return "AGAINST"

    elif user_position == "AGAINST":
        return "FOR"

    else:
        return None


# ============================================================
# GENERATE AI OPPOSITION
# ============================================================

def generate_opposition(
    case_facts,
    legal_issue,
    subject,
    jurisdiction,
    user_position,
    user_argument
):

    ai_position = get_opposite_position(user_position)

    if ai_position is None:
        return "❌ Invalid position. Please use FOR or AGAINST."


    prompt = f"""
You are participating in a hypothetical legal moot court.

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
STUDENT'S ARGUMENT
============================================================

{user_argument}

============================================================
YOUR TASK
============================================================

Your job is to argue AGAINST the student's position.

You are representing the {ai_position} side.

Analyze the student's argument carefully.

Do not simply disagree.

Construct the strongest reasonable opposing argument
based ONLY on the facts supplied by the student and
general legal reasoning.

============================================================
RESPONSE FORMAT
============================================================

1. OPPOSING POSITION

Clearly state the position you are defending.

2. MAIN ARGUMENT

Present your strongest argument against the student's
position.

3. LEGAL REASONING

Explain the relevant general legal principles,
concepts, doctrines, duties, standards, or reasoning
that could support your position.

4. WEAKNESS IN STUDENT'S ARGUMENT

Identify weaknesses, assumptions, missing reasoning,
unsupported claims, or logical gaps.

5. COUNTERPOINT

Directly challenge the student's argument.

6. QUESTION FOR THE STUDENT

Ask ONE difficult but relevant question that the student
should answer in the next round.

============================================================
STRICT RULES
============================================================

DO NOT invent:

- Court cases
- Case names
- Case citations
- Statutes
- Sections
- Judgments
- Legal precedents
- Legal quotations
- Facts

Use ONLY:

- The supplied case facts
- The supplied legal issue
- The supplied subject
- The supplied jurisdiction
- General legal reasoning

If specific legal authority is required but has not been
provided, say that the argument is based on general
legal principles rather than inventing an authority.

Remember:

This is educational moot court practice only.
It is NOT professional legal advice.
"""


    # ========================================================
    # CALL GEMINI
    # ========================================================

    try:

        response = client.models.generate_content(

            # UPDATED GEMINI MODEL
            model="gemini-3.8-flash",

            contents=prompt,

            config={
                "system_instruction": SYSTEM_PROMPT,

                # Keep output reasonably detailed
                "max_output_tokens": 1500
            }
        )

        return response.text


    except Exception as error:

        return f"""
❌ GEMINI API ERROR

{error}
"""


# ============================================================
# MAIN PROGRAM
# ============================================================

def main():

    print("\n")
    print("=" * 70)
    print("⚖️  LEGALAI - AI MOOT COURT")
    print("=" * 70)

    print("\nEducational use only.")
    print("This system does NOT provide professional legal advice.\n")


    # --------------------------------------------------------
    # CASE FACTS
    # --------------------------------------------------------

    case_facts = input(
        "📄 Enter Case Facts:\n> "
    )


    # --------------------------------------------------------
    # LEGAL ISSUE
    # --------------------------------------------------------

    legal_issue = input(
        "\n⚖️ Enter Legal Issue:\n> "
    )


    # --------------------------------------------------------
    # SUBJECT
    # --------------------------------------------------------

    subject = input(
        "\n📚 Enter Legal Subject:\n> "
    )


    # --------------------------------------------------------
    # JURISDICTION
    # --------------------------------------------------------

    jurisdiction = input(
        "\n🌍 Enter Jurisdiction:\n> "
    )


    # --------------------------------------------------------
    # USER POSITION
    # --------------------------------------------------------

    user_position = input(
        "\n🎯 Choose your position (FOR / AGAINST):\n> "
    ).upper()


    # --------------------------------------------------------
    # CHECK POSITION
    # --------------------------------------------------------

    ai_position = get_opposite_position(user_position)

    if ai_position is None:

        print("\n❌ Invalid position!")

        print("Please enter:")
        print("FOR")
        print("or")
        print("AGAINST")

        return


    # --------------------------------------------------------
    # DISPLAY SIDES
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)

    print(f"👤 YOUR SIDE : {user_position}")
    print(f"🤖 AI SIDE   : {ai_position}")

    print("=" * 70)


    # --------------------------------------------------------
    # USER ARGUMENT
    # --------------------------------------------------------

    user_argument = input(
        "\n🗣️ Enter your opening legal argument:\n> "
    )


    # --------------------------------------------------------
    # GENERATE RESPONSE
    # --------------------------------------------------------

    print("\n")
    print("🤖 Gemini is preparing the opposition argument...")
    print("Please wait...\n")


    result = generate_opposition(

        case_facts=case_facts,

        legal_issue=legal_issue,

        subject=subject,

        jurisdiction=jurisdiction,

        user_position=user_position,

        user_argument=user_argument
    )


    # --------------------------------------------------------
    # DISPLAY RESULT
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)

    print("⚔️  GEMINI AI OPPOSITION")

    print("=" * 70)

    print(result)


    # --------------------------------------------------------
    # DISCLAIMER
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)

    print("⚠️ EDUCATIONAL DISCLAIMER")

    print("=" * 70)

    print(
        "This is a hypothetical moot court simulation "
        "for educational purposes only."
    )

    print(
        "It does not constitute professional legal advice."
    )

    print("=" * 70)


# ============================================================
# RUN PROGRAM
# ============================================================

if __name__ == "__main__":
    main()