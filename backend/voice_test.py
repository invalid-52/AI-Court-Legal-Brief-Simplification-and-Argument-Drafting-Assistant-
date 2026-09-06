import speech_recognition as sr


# ============================================================
# SPEECH RECOGNIZER
# ============================================================

recognizer = sr.Recognizer()


# ============================================================
# START PROGRAM
# ============================================================

print("\n")
print("=" * 60)
print("⚖️  LEGALAI - MOOT COURT VOICE INPUT")
print("=" * 60)

print("\n🎤 Press ENTER to start speaking.")
input()


# ============================================================
# MICROPHONE
# ============================================================

microphone = sr.Microphone()


# ============================================================
# AUDIO STORAGE
# ============================================================

audio_data = []


# ============================================================
# CALLBACK
# ============================================================

def callback(recognizer_instance, audio):

    audio_data.append(audio)

    print("🎙️ Recording...", flush=True)


# ============================================================
# START BACKGROUND LISTENER
# ============================================================

print("\n🔧 Preparing microphone...")

with microphone as source:

    recognizer.adjust_for_ambient_noise(
        source,
        duration=1
    )


print("\n")
print("=" * 60)
print("🎤 YOUR TURN")
print("=" * 60)

print("\nSpeak your complete argument.")
print("You can speak for as long as you want.")
print("\n⏹️ Press ENTER when you finish speaking.\n")


# ============================================================
# START LISTENING
# ============================================================

stop_listening = recognizer.listen_in_background(
    microphone,
    callback
)


# ============================================================
# WAIT FOR USER
# ============================================================

input()


# ============================================================
# STOP LISTENING
# ============================================================

stop_listening(wait_for_stop=False)


print("\n")
print("=" * 60)
print("⏹️ YOUR TURN HAS ENDED")
print("=" * 60)


# ============================================================
# CHECK RECORDING
# ============================================================

if not audio_data:

    print("\n❌ No speech was recorded.")

    exit()


print(f"\n🎙️ Recorded {len(audio_data)} speech segment(s).")


# ============================================================
# SPEECH TO TEXT
# ============================================================

print("\n🔄 Converting your complete argument to text...")
print("Please wait...\n")


recognized_text = []


for audio in audio_data:

    try:

        text = recognizer.recognize_google(audio)

        recognized_text.append(text)

    except sr.UnknownValueError:

        # Ignore sections that could not be understood
        pass

    except sr.RequestError as error:

        print("\n❌ Speech recognition error:")
        print(error)

        break


# ============================================================
# COMBINE ALL SPEECH
# ============================================================

final_text = " ".join(recognized_text)


# ============================================================
# DISPLAY RESULT
# ============================================================

print("=" * 60)
print("📝 YOUR COMPLETE ARGUMENT")
print("=" * 60)

print()


if final_text:

    print(final_text)

else:

    print("❌ Could not understand the speech.")


print("\n")
print("=" * 60)
print("✅ VOICE INPUT COMPLETE")
print("=" * 60)