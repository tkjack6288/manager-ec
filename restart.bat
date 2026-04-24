@echo off
echo Stopping existing processes on ports 8000 and 3000...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :8000') DO TaskKill.exe /PID %%T /F 2>nul
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO TaskKill.exe /PID %%T /F 2>nul

echo Starting Backend...
start cmd /k "cd backend && uv run uvicorn main:app --reload"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Services have been restarted!
