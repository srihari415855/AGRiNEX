@echo off
title AGRiNEX Launcher
echo ===================================================
echo           Starting AGRiNEX Farm Intelligence
echo ===================================================
echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "AGRiNEX Backend (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && .\venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo Starting Frontend (Next.js on http://localhost:3000)...
start "AGRiNEX Frontend (Next.js)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Both services are launching in separate windows!
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo - Frontend: http://localhost:3000
echo ===================================================
pause
