Write-Host "===================================================" -ForegroundColor Green
Write-Host "       Starting AGRiNEX Farm Intelligence          " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nServices launching in separate windows:" -ForegroundColor Cyan
Write-Host "- Backend API:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "- Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "- Frontend App: http://localhost:3000" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Green
