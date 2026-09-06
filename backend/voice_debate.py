import os
import speech_recognition as sr
import pyttsx3

from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD GEMINI API KEY
# ============================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("\n❌ GEMINI_API_KEY not found!")
    print("Please check your .env file.")
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

You simulate a hypothetical legal moot court debate and help
students practice legal reasoning, argumentation,
counter-arguments and rebuttals.

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

4. NEVER invent facts that were not provided by the student.

5. Respect the jurisdiction provided by the student.

6. ALWAYS argue from the OPPOSITE SIDE of the student's position.

7. Do not simply agree with the student.

8. Challenge weak assumptions and reasoning.

9. Identify weaknesses in the student's argument.

10. Anticipate possible rebuttals.

11. Ask meaningful and difficult questions.

12. Respond like a respectful but challenging moot-court
    opposing counsel.

13. Keep the response understandable for a law student.

14. Clearly distinguish between the supplied facts and
    legal reasoning.

15. This is a hypothetical educational simulation and
    not professional legal advice.
"""


# ============================================================
# DETERMINE OPPOSITE POSITION
# ============================================================

def get_opposite_position(user_position):

    user_position = user_position.strip().upper()

    if user_position == "FOR":
        return "AGAINST"

    elif user_position == "AGAINST":
        return "FOR"

    return None


# ============================================================
# AI TEXT TO SPEECH
# ============================================================

def speak_ai_response(text):

    print("\n🔊 AI is speaking...\n")

    try:

        engine = pyttsx3.init()

        # AI speaking speed
        engine.setProperty("rate", 165)

        # AI volume
        engine.setProperty("volume", 1.0)

        # Speak Gemini response
        engine.say(text)

        engine.runAndWait()

        engine.stop()

        print("\n✅ AI finished speaking.")

    except Exception as error:

        print("\n❌ Text-to-speech error:")
        print(error)


# ============================================================
# RECORD USER SPEECH
# ============================================================

def record_speech():

    recognizer = sr.Recognizer()

    microphone = sr.Microphone()

    audio_data = []


    # --------------------------------------------------------
    # CALLBACK
    # --------------------------------------------------------

    def callback(recognizer_instance, audio):

        audio_data.append(audio)

        print("🎙️", end="", flush=True)


    # --------------------------------------------------------
    # MICROPHONE CALIBRATION
    # --------------------------------------------------------

    print("\n🔧 Preparing microphone...")

    with microphone as source:

        recognizer.adjust_for_ambient_noise(
            source,
            duration=1
        )


    # --------------------------------------------------------
    # START USER TURN
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print("🎤 YOUR TURN")
    print("=" * 70)

    print("\nSpeak your complete legal argument.")

    print("There is NO time limit.")

    print("\nSpeak naturally.")

    print("⏹️ Press ENTER when you have finished speaking.\n")


    # --------------------------------------------------------
    # START BACKGROUND RECORDING
    # --------------------------------------------------------

    stop_listening = recognizer.listen_in_background(
        microphone,
        callback
    )


    # --------------------------------------------------------
    # WAIT FOR USER TO FINISH
    # --------------------------------------------------------

    input()


    # --------------------------------------------------------
    # STOP RECORDING
    # --------------------------------------------------------

    stop_listening(wait_for_stop=False)


    # Give the listener a moment to finish processing
    import time
    time.sleep(0.3)


    print("\n")
    print("=" * 70)
    print("⏹️ RECORDING STOPPED")
    print("=" * 70)


    # --------------------------------------------------------
    # CHECK RECORDING
    # --------------------------------------------------------

    if not audio_data:

        print("\n❌ No speech was recorded.")

        return None


    print(
        f"\n🎙️ Recorded {len(audio_data)} speech segment(s)."
    )


    # --------------------------------------------------------
    # SPEECH TO TEXT
    # --------------------------------------------------------

    print("\n🔄 Converting your speech to text...")

    print("Please wait...\n")


    recognized_text = []


    for audio in audio_data:

        try:

            text = recognizer.recognize_google(audio)

            recognized_text.append(text)


        except sr.UnknownValueError:

            # Ignore audio that could not be understood
            pass


        except sr.RequestError as error:

            print("\n❌ Speech recognition error:")
            print(error)

            return None


    # --------------------------------------------------------
    # COMBINE ALL SEGMENTS
    # --------------------------------------------------------

    final_text = " ".join(recognized_text)


    # --------------------------------------------------------
    # CHECK TEXT
    # --------------------------------------------------------

    if not final_text:

        print("\n❌ I could not understand your speech.")

        return None


    # --------------------------------------------------------
    # DISPLAY TRANSCRIPT
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print("📝 YOUR SPOKEN ARGUMENT")
    print("=" * 70)

    print("\n")

    print(final_text)

    return final_text


# ============================================================
# GENERATE AI OPPOSITION
# ============================================================

def generate_opposition(
    case_facts,
    legal_issue,
    subject,
    jurisdiction,
    user_position,
    user_argument,
    debate_history
):

    ai_position = get_opposite_position(
        user_position
    )


    if ai_position is None:

        return "❌ Invalid position."


    # --------------------------------------------------------
    # CREATE DEBATE HISTORY
    # --------------------------------------------------------

    history_text = ""


    if debate_history:

        history_text = "\n\nPREVIOUS DEBATE:\n"

        for round_data in debate_history:

            history_text += f"""
ROUND {round_data["round"]}

STUDENT:
{round_data["student"]}

AI:
{round_data["ai"]}

"""


    # --------------------------------------------------------
    # GEMINI PROMPT
    # --------------------------------------------------------

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


YOUR POSITION:

{ai_position}


CURRENT STUDENT ARGUMENT:

{user_argument}


{history_text}


You are the opposing counsel.

Your job is to argue AGAINST the student's position.

You must challenge the student's reasoning rather than
simply agreeing with it.

Analyze the current argument and respond as a strong
moot-court opponent.

Structure your response as follows:

1. OPPOSING POSITION

Clearly state the position you are defending.

2. RESPONSE TO THE STUDENT

Directly respond to the student's argument.

3. MAIN COUNTER-ARGUMENT

Present your strongest argument.

4. LEGAL REASONING

Explain the relevant general legal principles and reasoning.

5. WEAKNESS IN STUDENT'S ARGUMENT

Identify assumptions, missing reasoning, contradictions,
or weaknesses.

6. REBUTTAL

Explain why the student's argument should not succeed.

7. QUESTION FOR THE STUDENT

Ask ONE difficult question that the student must answer
in the next round.

IMPORTANT:

Do NOT invent cases.

Do NOT invent statutes.

Do NOT invent sections.

Do NOT invent citations.

Do NOT invent legal authorities.

Do NOT invent facts.

Use only the supplied facts and general legal reasoning.

This is educational moot court practice only.
"""


    # --------------------------------------------------------
    # CALL GEMINI
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt,

            config={
                "system_instruction": SYSTEM_PROMPT,
                "max_output_tokens": 1800
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

    print("\n\n")

    print("=" * 70)
    print("⚖️  LEGALAI - AI VOICE MOOT COURT")
    print("=" * 70)

    print(
        "\n🎓 Educational moot-court simulation"
    )

    print(
        "⚠️ This system does NOT provide professional legal advice."
    )


    # ========================================================
    # CASE INFORMATION
    # ========================================================

    print("\n")
    print("=" * 70)
    print("📄 CASE INFORMATION")
    print("=" * 70)


    case_facts = input(
        "\n📄 Enter Case Facts:\n> "
    )


    legal_issue = input(
        "\n⚖️ Enter Legal Issue:\n> "
    )


    subject = input(
        "\n📚 Enter Legal Subject:\n> "
    )


    jurisdiction = input(
        "\n🌍 Enter Jurisdiction:\n> "
    )


    # ========================================================
    # USER POSITION
    # ========================================================

    print("\n")
    print("🎯 Choose your position:")

    print("FOR     → You support the claim")

    print("AGAINST → You oppose the claim")


    user_position = input(
        "\nYour position (FOR / AGAINST):\n> "
    ).strip().upper()


    # ========================================================
    # VALIDATE POSITION
    # ========================================================

    ai_position = get_opposite_position(
        user_position
    )


    if ai_position is None:

        print("\n❌ Invalid position.")

        print("Please enter FOR or AGAINST.")

        return


    # ========================================================
    # DISPLAY SIDES
    # ========================================================

    print("\n")

    print("=" * 70)

    print("⚔️  MOOT COURT SIDES")

    print("=" * 70)

    print(f"\n👤 YOU : {user_position}")

    print(f"🤖 AI  : {ai_position}")

    print("\n")


    # ========================================================
    # DEBATE HISTORY
    # ========================================================

    debate_history = []

    round_number = 1


    # ========================================================
    # DEBATE LOOP
    # ========================================================

    while True:

        print("\n\n")

        print("=" * 70)

        print(f"⚔️  DEBATE ROUND {round_number}")

        print("=" * 70)


        # ----------------------------------------------------
        # USER SPEAKS
        # ----------------------------------------------------

        user_argument = record_speech()


        if not user_argument:

            print("\n❌ No argument received.")

            break


        # ----------------------------------------------------
        # GEMINI THINKING
        # ----------------------------------------------------

        print("\n")

        print("=" * 70)

        print("🤖 GEMINI IS PREPARING THE OPPOSITION")

        print("=" * 70)

        print("\nPlease wait...")


        # ----------------------------------------------------
        # GENERATE OPPOSITION
        # ----------------------------------------------------

        ai_response = generate_opposition(

            case_facts=case_facts,

            legal_issue=legal_issue,

            subject=subject,

            jurisdiction=jurisdiction,

            user_position=user_position,

            user_argument=user_argument,

            debate_history=debate_history
        )


        # ----------------------------------------------------
        # DISPLAY AI RESPONSE
        # ----------------------------------------------------

        print("\n\n")

        print("=" * 70)

        print("⚔️  AI OPPOSITION")

        print("=" * 70)

        print("\n")

        print(ai_response)


        # ----------------------------------------------------
        # SAVE ROUND
        # ----------------------------------------------------

        debate_history.append({

            "round": round_number,

            "student": user_argument,

            "ai": ai_response

        })


        # ----------------------------------------------------
        # AI SPEAKS
        # ----------------------------------------------------

        speak_ai_response(
            ai_response
        )


        # ----------------------------------------------------
        # NEXT ROUND
        # ----------------------------------------------------

        print("\n\n")

        print("=" * 70)

        print("🎤 WHAT NEXT?")

        print("=" * 70)

        print("\nPress ENTER to continue the debate.")

        print("Type STOP and press ENTER to finish.")

        choice = input("\n> ").strip().upper()


        if choice == "STOP":

            break


        round_number += 1


    # ========================================================
    # DEBATE FINISHED
    # ========================================================

    print("\n\n")

    print("=" * 70)

    print("🏁 MOOT COURT DEBATE FINISHED")

    print("=" * 70)


    print(
        f"\n📊 Total rounds completed: {len(debate_history)}"
    )


    print("\n👤 Student side:", user_position)

    print("🤖 AI side:", ai_position)


    # ========================================================
    # DISCLAIMER
    # ========================================================

    print("\n")

    print("=" * 70)

    print("⚠️ EDUCATIONAL DISCLAIMER")

    print("=" * 70)

    print(
        "\nThis is a hypothetical moot court simulation "
        "for educational purposes only."
    )

    print(
        "It does not constitute professional legal advice."
    )

    print(
        "Legal authorities and facts should be independently "
        "verified before being relied upon."
    )

    print("\n")


# ============================================================
# RUN PROGRAM
# ============================================================

if __name__ == "__main__":

    main()