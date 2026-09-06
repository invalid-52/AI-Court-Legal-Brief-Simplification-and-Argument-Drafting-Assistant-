import os
from dotenv import load_dotenv
from groq import Groq


# ============================================================
# LOAD GROQ API KEY
# ============================================================

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("❌ GROQ_API_KEY not found!")
    print("Please create a .env file and add:")
    print("GROQ_API_KEY=your_api_key_here")
    exit()


# ============================================================
# CONNECT TO GROQ
# ============================================================

client = Groq(
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

CASE FACTS:
{case_facts}

LEGAL ISSUE:
{legal_issue}

LEGAL SUBJECT:
{subject}

JURISDICTION:
{jurisdiction}

STUDENT'S POSITION:
{user_position}

AI'S POSITION:
{ai_position}

STUDENT'S ARGUMENT:
{user_argument}


Your job is to argue AGAINST the student's position.

You are representing the {ai_position} side.

Analyze the student's argument carefully.

Respond using this structure:

1. OPPOSING POSITION

Clearly state the position you are defending.

2. MAIN ARGUMENT

Present your strongest argument against the student.

3. LEGAL REASONING

Explain the general legal principles and reasoning
supporting your position.

4. WEAKNESS IN STUDENT'S ARGUMENT

Identify weaknesses, assumptions, missing reasoning,
or gaps in the student's argument.

5. COUNTERPOINT

Directly challenge the student's argument.

6. QUESTION FOR THE STUDENT

Ask one difficult question that the student should
answer in the next round.

IMPORTANT:

Do not invent legal authorities.

Do not invent cases.

Do not invent statutes or citations.

Do not invent facts.

Use only the supplied facts and general legal reasoning.

This is educational moot court practice only.
"""


    # ========================================================
    # CALL GROQ
    # ========================================================

    try:

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            max_tokens=1500
        )


        return response.choices[0].message.content


    except Exception as error:

        return f"""
❌ GROQ API ERROR

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
    print("🤖 AI is preparing the opposition argument...")
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

    print("⚔️  AI OPPOSITION")
    
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