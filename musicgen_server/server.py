import os
import uuid
import logging
import traceback
import asyncio
import threading
import wave as wave_module
import struct
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import numpy as np
from audiocraft.models import MusicGen

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Constants
# musicgen-small : max_duration=30s, CPU-friendly, fast
# musicgen-medium: max_duration=30s, higher quality, more RAM
# We support long tracks by chaining 30-second segments.
# ──────────────────────────────────────────────────────────────────────────────
MODEL_NAME = "facebook/musicgen-small"
OUTPUT_DIR = "static/audio"
MODEL_MAX_CHUNK   = 30    # musicgen-small / medium hard limit per generation call
MAX_DURATION      = 120   # seconds — total supported (multi-chunk)
DEFAULT_DURATION  = 30    # seconds — default for a single nice track

os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Local MusicGen API", description="API for generating music using Meta's AudioCraft")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

model = None
_generation_lock = threading.Lock()


@app.on_event("startup")
async def startup_event():
    global model
    logger.info(f"Loading {MODEL_NAME} model…")
    try:
        model = MusicGen.get_pretrained(MODEL_NAME)
        logger.info(
            f"Model loaded! sample_rate={model.sample_rate}Hz  "
            f"max_chunk={MODEL_MAX_CHUNK}s  total_supported={MAX_DURATION}s"
        )
    except Exception as e:
        logger.error(f"Failed to load model: {e}\n{traceback.format_exc()}")
        raise RuntimeError(f"Failed to initialize MusicGen model: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# Prompt enhancement — phonk-tuned
# ──────────────────────────────────────────────────────────────────────────────
def enhance_prompt(prompt: str) -> str:
    """Inject genre-specific quality descriptors into the prompt."""
    lower = prompt.lower()

    if any(k in lower for k in ("montagem", "brazilian phonk")):
        return (
            "dark aggressive brazilian montagem phonk, distorted 808 bass drops, "
            "fast cowbell melody, trap hi-hats, heavy compression, energetic progression, "
            "pitch-shifted vocal stabs, dark synth leads, relentless energy, no ambience, "
            "120 BPM, full musical structure with verse and drops"
        )
    if any(k in lower for k in ("horror phonk",)):
        return (
            "horror phonk trap beat, dark eerie minor melody, distorted 808 bass hits, "
            "aggressive percussion drops, menacing atmosphere, phonk cowbell, "
            "pitch-shifted samples, high energy, 130 BPM, structured drops and builds"
        )
    if any(k in lower for k in ("phonk", "dark phonk", "ultrafunk")):
        return (
            "dark phonk music, heavy distorted 808 bass, driving cowbell rhythm, "
            "aggressive trap percussion, dark minor chord progression, distorted synth stabs, "
            "menacing low-end groove, high energy, 130 BPM, full song structure, "
            "verse chorus bridge drops, no ambient pads"
        )
    if any(k in lower for k in ("gym", "workout", "hype")):
        return (
            "high energy gym workout phonk, aggressive trap beats, heavy bass drops, "
            "motivational dark progression, intense percussion fills, powerful low-end, "
            "no slow sections, 140 BPM, adrenaline rush energy"
        )
    if any(k in lower for k in ("villain", "antagonist", "cinematic")):
        return (
            "dark villain cinematic music, aggressive bass hits, menacing orchestral stabs, "
            "rising tension, dark chord progression, heavy percussion drops, intense energy, "
            "trailer style, full dynamic arc with quiet and loud sections"
        )
    if any(k in lower for k in ("action", "epic", "trailer")):
        return (
            "epic action trailer music, powerful orchestra, intense percussion, brass hits, "
            "rising tension, blockbuster energy, full musical structure with drops and builds"
        )
    if any(k in lower for k in ("lo-fi", "lofi")):
        return (
            "lo-fi hip hop, chill beats, vinyl crackle, mellow chords, soft drums, "
            "jazzy samples, relaxed atmosphere, smooth progression"
        )
    # Generic enhancement
    return (
        f"{prompt}, high energy, full musical structure with verse chorus drops, "
        f"strong bass, clear rhythm, professional mix, 128 BPM, no ambient filler"
    )


# ──────────────────────────────────────────────────────────────────────────────
# WAV helpers
# ──────────────────────────────────────────────────────────────────────────────
def _normalize(audio_np: np.ndarray) -> np.ndarray:
    """Normalize float32 array to 95% full scale."""
    max_val = np.abs(audio_np).max()
    if max_val > 0:
        audio_np = audio_np / max_val * 0.95
    return audio_np


def _write_wav(filepath: str, audio_np: np.ndarray, sample_rate: int):
    """Write a mono 16-bit PCM WAV — universally browser-compatible."""
    audio_np = _normalize(audio_np)
    audio_int16 = (audio_np * 32767).astype(np.int16)
    with wave_module.open(filepath, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)          # 16-bit = 2 bytes
        wf.setframerate(sample_rate)
        wf.writeframes(audio_int16.tobytes())


def _wav_duration(filepath: str) -> float:
    """Return actual duration of saved WAV in seconds."""
    with wave_module.open(filepath, "rb") as wf:
        return wf.getnframes() / wf.getframerate()


# ──────────────────────────────────────────────────────────────────────────────
# Core generation — chunked for durations > MODEL_MAX_CHUNK
# ──────────────────────────────────────────────────────────────────────────────
def _generate_chunk(prompt: str, chunk_duration: int) -> np.ndarray:
    """
    Generate one chunk and return raw float32 numpy array (mono, 1-D).
    Caller must hold _generation_lock.
    """
    model.set_generation_params(
        duration=chunk_duration,
        temperature=1.1,      # Slightly above 1.0 → more energetic / less repetitive
        top_k=250,            # Wide token pool for variety
        top_p=0.0,            # Disabled — pure top_k sampling
        cfg_coef=6.0,         # Higher classifier-free guidance → stronger prompt adherence
    )
    wav = model.generate([prompt])          # shape: (1, channels, time)
    audio_np = wav[0].cpu().numpy()         # (channels, samples) or (samples,)
    if audio_np.ndim == 2:
        audio_np = audio_np[0]              # take first channel → mono 1-D
    return audio_np


def _run_generation(prompt: str, duration: int) -> str:
    """
    Thread-safe generation. Chains multiple 30-second chunks for long durations.
    Returns filepath of the final WAV.
    """
    enhanced = enhance_prompt(prompt)
    logger.info(f"Enhanced prompt: {enhanced!r}")
    logger.info(f"Requested duration: {duration}s | chunk_limit: {MODEL_MAX_CHUNK}s")

    with _generation_lock:
        chunks_needed = max(1, -(-duration // MODEL_MAX_CHUNK))   # ceiling division
        logger.info(f"Will generate {chunks_needed} chunk(s) of ≤{MODEL_MAX_CHUNK}s each")

        segments: List[np.ndarray] = []
        remaining = duration

        for i in range(chunks_needed):
            chunk_dur = min(remaining, MODEL_MAX_CHUNK)
            logger.info(f"Generating chunk {i+1}/{chunks_needed}: {chunk_dur}s …")
            seg = _generate_chunk(enhanced, chunk_dur)
            segments.append(seg)
            remaining -= chunk_dur
            logger.info(
                f"Chunk {i+1} done. samples={len(seg)}  "
                f"actual={len(seg)/model.sample_rate:.2f}s"
            )

        # Concatenate all segments
        full_audio = np.concatenate(segments, axis=0)
        logger.info(
            f"All chunks concatenated. total_samples={len(full_audio)}  "
            f"total_duration={len(full_audio)/model.sample_rate:.2f}s"
        )

        filename = f"{uuid.uuid4().hex}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)
        _write_wav(filepath, full_audio, model.sample_rate)

        actual_dur = _wav_duration(filepath)
        logger.info(f"WAV saved: {filepath}  |  actual_duration: {actual_dur:.2f}s")
        return filepath


# ──────────────────────────────────────────────────────────────────────────────
# API Models
# ──────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt: str
    duration: Optional[int] = DEFAULT_DURATION


class GenerateResponse(BaseModel):
    url: str
    prompt: str
    duration: int
    model: str
    actual_duration: Optional[float] = None


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/generate", response_model=GenerateResponse)
async def generate_music(request: GenerateRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    prompt   = request.prompt.strip()
    duration = request.duration or DEFAULT_DURATION

    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    # Clamp to valid range
    duration = max(1, min(duration, MAX_DURATION))
    logger.info(f"Accepted request: prompt='{prompt}'  duration={duration}s")

    try:
        filepath = await asyncio.to_thread(_run_generation, prompt, duration)
        filename = os.path.basename(filepath)
        actual   = _wav_duration(filepath)
        url      = f"http://localhost:8000/static/audio/{filename}"
        logger.info(f"Returning URL: {url}  actual_duration={actual:.2f}s")
        return GenerateResponse(
            url=url, prompt=prompt, duration=duration,
            model=MODEL_NAME, actual_duration=actual
        )
    except Exception as e:
        full_trace = traceback.format_exc()
        err = str(e) if str(e).strip() else repr(e)
        logger.error(f"Generation error: {err}\n{full_trace}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {err}")


@app.get("/api/health")
async def health_check():
    return {
        "status"       : "ok",
        "model_loaded" : model is not None,
        "model_name"   : MODEL_NAME,
        "model_max_chunk": MODEL_MAX_CHUNK,
        "max_duration" : MAX_DURATION,
        "sample_rate"  : model.sample_rate if model else None,
    }
