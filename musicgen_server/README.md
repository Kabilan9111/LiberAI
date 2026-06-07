# Local Meta AudioCraft (MusicGen) Setup for Liber AI

This directory contains a standalone FastAPI server that runs Meta's AudioCraft (specifically the `facebook/musicgen-small` model) entirely on your local machine. This allows Liber AI to generate music without relying on Hugging Face or any other paid API.

## Prerequisites

Before starting, ensure you have the following installed:
1. **Python 3.9 - 3.11** (Check with `python --version`)
2. **NVIDIA GPU** (Minimum 8GB VRAM recommended for `small` model, 16GB+ for `large`)
3. **FFmpeg** (Required by torchaudio to process audio files)
   - Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/)
   - Extract and add the `bin` folder to your system's `PATH` environment variable.
   - Verify by running `ffmpeg -version` in your terminal.

## Installation (Windows)

1. Double-click or run `setup.bat`.
2. The script will automatically:
   - Create a Python virtual environment (`venv`).
   - Install PyTorch with CUDA 12.1 support.
   - Install AudioCraft, FastAPI, and Uvicorn.

*Note: The first time you run the server, it will download the model weights (~1.5GB for `small`).*

## Running the Server

1. Double-click or run `run.bat`.
2. The server will start on `http://localhost:8000`.
3. Wait until you see `Model facebook/musicgen-small loaded successfully!` in the console.

## API Usage

The Next.js backend automatically proxies requests to this server. If you want to test it manually:

**Endpoint:** `POST http://localhost:8000/api/generate`

**Payload:**
```json
{
  "prompt": "80s pop track with synth bass and electronic drums",
  "duration": 8
}
```

## Switching Models

To switch from the `small` model to a more advanced model (`medium`, `large`, or `melody`):
1. Open `server.py`.
2. Change the `MODEL_NAME` constant:
   ```python
   MODEL_NAME = "facebook/musicgen-medium" # or "facebook/musicgen-large"
   ```
3. Restart the server. It will download the new weights on the next startup.
*Warning: Larger models require significantly more VRAM and take longer to generate audio.*

## GPU Requirements & Performance

- **CPU Only**: Possible, but incredibly slow (can take minutes for 5 seconds of audio). Not recommended.
- **small (300M params)**: Requires ~4GB VRAM. Fast generation.
- **medium (1.5B params)**: Requires ~8GB VRAM. High quality, moderate speed.
- **large (3.3B params)**: Requires ~16GB VRAM. Best quality, slower speed.

## Deployment for Other Users

If you want to host this for others to use, you should move this server to a cloud GPU provider:
1. **RunPod / Vast.ai**: Rent an RTX 3090/4090 instance.
2. **Docker**: Create a Dockerfile to package the Python environment.
3. **Expose Port**: Expose port 8000 and use a tool like Ngrok or Cloudflare Tunnels to get a public HTTPS URL.
4. **Update Next.js**: Update `LOCAL_MODEL_URL` in `src/app/api/generate-music/route.ts` to point to your new cloud URL.
