import base64
import os
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.services.voice_service import transcribe_audio_bytes, synthesize_speech_file

logger = logging.getLogger("backend.voice_routes")

router = APIRouter(prefix="/voice", tags=["Voice"])

class SpeakRequest(BaseModel):
    text: str

class TranscribeBase64Request(BaseModel):
    audio_base64: str
    filename: Optional[str] = "recording.wav"

@router.post("/transcribe")
async def transcribe_audio(file: Optional[UploadFile] = File(None)):
    """
    Transcribes an uploaded audio file (WAV/AIFF/audio segment) using SpeechRecognition.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file was uploaded.")

    try:
        content = await file.read()
        res = transcribe_audio_bytes(content, filename_hint=file.filename or "audio.wav")
        if not res["success"] and res.get("error"):
            # Return 200 with success=False so frontend can display friendly message without crashing
            return res
        return res
    except Exception as exc:
        logger.error(f"Upload transcription error: {exc}")
        return {"success": False, "text": "", "error": str(exc)}

@router.post("/transcribe-base64")
def transcribe_base64(req: TranscribeBase64Request):
    """
    Transcribes base64-encoded audio data sent directly from the browser.
    """
    try:
        data = req.audio_base64
        if "," in data:
            data = data.split(",", 1)[1]
        decoded = base64.b64decode(data)
        return transcribe_audio_bytes(decoded, filename_hint=req.filename or "recording.wav")
    except Exception as exc:
        logger.error(f"Base64 transcription error: {exc}")
        return {"success": False, "text": "", "error": str(exc)}

@router.post("/speak")
def speak_text(req: SpeakRequest):
    """
    Synthesizes AI text into speech using server-side TTS.
    Returns the audio WAV stream.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    audio_path = synthesize_speech_file(req.text)
    if not audio_path or not os.path.exists(audio_path):
        return {
            "success": False,
            "message": "Server TTS output unavailable. Client should use Web Speech API fallback."
        }

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename="ai_opposition.wav"
    )
