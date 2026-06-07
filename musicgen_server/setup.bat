@echo off
echo ==========================================
echo Setting up Local Meta AudioCraft Server
echo ==========================================

echo [1/3] Creating Python Virtual Environment...
python -m venv venv

echo [2/3] Activating Virtual Environment and Upgrading Pip...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip

echo [3/3] Installing Dependencies (PyTorch with CUDA, FastAPI, etc)...
pip install fastapi>=0.104.1 uvicorn>=0.24.0 pydantic>=2.5.2 torch torchaudio numpy --index-url https://download.pytorch.org/whl/cu121 --extra-index-url https://pypi.org/simple

echo [4/4] Installing AudioCraft dependencies and AudioCraft (bypassing strict numpy)...
pip install av einops flashy>=0.0.1 hydra-core>=1.1 hydra_colorlog julius num2words sentencepiece spacy>=3.6.1 huggingface_hub tqdm
pip install audiocraft==1.3.0 --no-deps

echo.
echo ==========================================
echo Setup Complete! 
echo Ensure FFmpeg is installed and added to your system PATH.
echo You can now run the server using run.bat
echo ==========================================
