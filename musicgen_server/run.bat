@echo off
echo ==========================================
echo Starting Local Meta AudioCraft Server
echo ==========================================

call venv\Scripts\activate.bat
echo Running FastAPI Server on http://localhost:8000
python -m uvicorn server:app --host 0.0.0.0 --port 8000
