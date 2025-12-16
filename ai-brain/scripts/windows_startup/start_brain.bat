@echo off
echo Starting Omnixa AI Stack...

echo [1/3] Checking Redis...
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if NOT "%ERRORLEVEL%"=="0" (
    echo Starting Redis...
    start /min "" "C:\redis\redis-server.exe"
    timeout /t 2 /nobreak >nul
)
echo Redis OK

echo [2/3] Activating Python environment...
cd ai-brain
if not exist venv (
    echo Creating Virtual Environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r brain/requirements.txt
) else (
    call venv\Scripts\activate
)

echo [3/3] Starting AI Brain on Port 8000...
python -m uvicorn brain.main:app --host 0.0.0.0 --port 8000
pause
