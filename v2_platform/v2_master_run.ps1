# SkillFirst Hire V2 - Master Startup Script (Windows PowerShell)
# This script launches all 6 platform services in separate terminal windows.

Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Gray
# Aggressive kill for any node or python instances
taskkill /F /IM node.exe /T 2>$null
taskkill /F /IM python.exe /T 2>$null

# Surgical kill for ports 5000-5174
$ports = 5000, 5001, 5002, 5003, 5005, 5173, 5174
foreach ($port in $ports) {
    # Use netstat to find PIDs on the port and kill them directly
    $pids = (netstat -ano | findstr ":$port" | ForEach-Object { $_.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)[-1] } | Select-Object -Unique)
    foreach ($foundProcessId in $pids) {
        if ($foundProcessId -match '^\d+$') {
            Write-Host "Force killing PID $foundProcessId on port $port" -ForegroundColor Gray
            taskkill /F /PID $foundProcessId /T 2>$null
        }
    }
}

Write-Host "🚀 Launching RESTRUCTURED SkillFirst Hire Platform (V2)..." -ForegroundColor Cyan

# 1. Main Core Backend (Port 5005)
Write-Host "1. Starting Core Backend (Port 5005)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/backend/core" -ArgumentList "-NoExit", "-Command", "`$env:PORT=5005; node server.js"

# 2. LiveCode Backend (Port 5001)
Write-Host "2. Starting LiveCode Backend (Port 5001)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/backend/live" -ArgumentList "-NoExit", "-Command", "`$env:PORT=5001; node index.js"

# 3. Database Middleware (Port 5002)
Write-Host "3. Starting Database Middleware (Port 5002)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/data/backend" -ArgumentList "-NoExit", "-Command", "`$env:PORT=5002; node server.js"

# 4. ML Service (Port 5003)
Write-Host "4. Starting ML Service (Port 5003)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/ai_ml" -ArgumentList "-NoExit", "-Command", "`$env:PORT=5003; python app.py"

# 5. LiveCode Frontend (Vite) - Lab
Write-Host "5. Starting LiveCode Frontend (Port 5173)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/frontend/livecode-react" -ArgumentList "-NoExit", "-Command", "npm run dev -- --port 5173"

# 6. NEW Main React Frontend (Vite) - App
Write-Host "6. Starting Main React Frontend (Port 5174)..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot/frontend/main-react" -ArgumentList "-NoExit", "-Command", "npm run dev -- --port 5174"

Write-Host "`n✅ All 6 services initiated!" -ForegroundColor Green
Write-Host "💡 Access MAIN APP (React): http://localhost:5174" -ForegroundColor Yellow
Write-Host "💡 Access LAB (Live-Code): http://localhost:5173" -ForegroundColor Yellow
Write-Host "💡 Access Legacy Profile (Vanilla): http://localhost:5005/profile.html" -ForegroundColor Yellow
