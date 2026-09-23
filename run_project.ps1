Write-Host "===================================================" -ForegroundColor Green
Write-Host "       Starting AGRiNEX Farm Intelligence          " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Start Backend
$backendCmd = "cd '$PSScriptRoot\backend'; if (Test-Path '.\venv\Scripts\python.exe') { .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 } else { python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Start Frontend
$frontendCmd = "cd '$PSScriptRoot\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "`nServices launching in separate windows:" -ForegroundColor Cyan
Write-Host "- Backend API:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "- Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "- Frontend App: http://localhost:3000" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Green

