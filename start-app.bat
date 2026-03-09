@echo off
echo ========================================
echo   SAERP - Starting Frontend & Backend
echo ========================================
echo.

REM Open backend terminal and start backend
start cmd /k "cd backend && mvn spring-boot:run"

REM Wait 5 seconds for backend to start
timeout /t 5 /nobreak

REM Open frontend terminal and start frontend
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both services are starting...
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5174
echo ========================================
echo.
pause
