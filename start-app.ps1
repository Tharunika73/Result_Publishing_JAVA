# Start both Frontend and Backend in parallel
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SAERP - Starting Frontend & Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing Java processes
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Rebuild backend
Write-Host "Rebuilding Backend..." -ForegroundColor Yellow
cd backend
mvn clean compile 2>&1 | Out-Null
cd ..

# Start Backend in background
Write-Host "Starting Backend..." -ForegroundColor Green
$backendProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c `"cd backend && mvn spring-boot:run`""
Write-Host "Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

# Wait for backend to start
Start-Sleep -Seconds 10

# Start Frontend in background
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendProcess = Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList "/c `"cd frontend && npm run dev`""
Write-Host "Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green

# Display status
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Services Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5174" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
    if ($backendProcess.HasExited -or $frontendProcess.HasExited) {
        Write-Host "One or more services stopped!" -ForegroundColor Red
        break
    }
}

# Cleanup
Write-Host "Stopping services..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "Stopped." -ForegroundColor Green
