import os
import tempfile
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("backend.voice_service")

# ============================================================
# SPEECH TO TEXT TRANSCRIPTION
# ============================================================

def transcribe_audio_bytes(audio_bytes: bytes, filename_hint: str = "audio.wav") -> Dict[str, Any]:
    """
    Transcribes audio bytes using SpeechRecognition and Google Speech API.
    Handles WAV, AIFF, and converts WebM/OGG when possible.
    """
    if not audio_bytes or len(audio_bytes) < 100:
        return {"success": False, "text": "", "error": "Audio data is empty or too short."}

    import speech_recognition as sr

    recognizer = sr.Recognizer()

    # If it's a WAV file or has a RIFF header, sr.AudioFile can read directly
    is_wav = audio_bytes.startswith(b"RIFF") or filename_hint.lower().endswith(".wav")

    temp_wav_path = None
    try:
        if is_wav:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
                tf.write(audio_bytes)
                temp_wav_path = tf.name

            with sr.AudioFile(temp_wav_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                return {"success": True, "text": text, "error": None}
        else:
            # Try saving and processing directly or via audiofile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
                tf.write(audio_bytes)
                temp_wav_path = tf.name

            try:
                with sr.AudioFile(temp_wav_path) as source:
                    audio_data = recognizer.record(source)
                    text = recognizer.recognize_google(audio_data)
                    return {"success": True, "text": text, "error": None}
            except Exception:
                # If format was webm without header or raw PCM, return informative error
                return {
                    "success": False,
                    "text": "",
                    "error": "Audio format could not be read as WAV. Use standard WAV format or browser SpeechRecognition."
                }

    except sr.UnknownValueError:
        return {"success": False, "text": "", "error": "Speech was unintelligible. Please speak clearly."}
    except sr.RequestError as exc:
        return {"success": False, "text": "", "error": f"Speech recognition service error: {exc}"}
    except Exception as exc:
        logger.error(f"Voice transcription error: {exc}")
        return {"success": False, "text": "", "error": str(exc)}
    finally:
        if temp_wav_path and os.path.exists(temp_wav_path):
            try:
                os.remove(temp_wav_path)
            except Exception:
                pass

# ============================================================
# TEXT TO SPEECH (PYTTSX3 SERVER SYNTHESIS)
# ============================================================

def synthesize_speech_file(text: str) -> Optional[str]:
    """
    Synthesizes speech to a temporary WAV file using pyttsx3.
    Returns the path to the temporary WAV file, or None if unavailable.
    """
    if not text or not text.strip():
        return None

    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty("rate", 165)
        engine.setProperty("volume", 1.0)

        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        # Clean text from Markdown headings/symbols for natural speech
        import re
        speech_text = re.sub(r"[#*=_`~]", " ", text)
        speech_text = re.sub(r"\s+", " ", speech_text).strip()

        engine.save_to_file(speech_text, temp_path)
        engine.runAndWait()
        engine.stop()

        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            return temp_path
        return None
    except Exception as exc:
        logger.warning(f"Server pyttsx3 speech synthesis unavailable: {exc}")
        return None
