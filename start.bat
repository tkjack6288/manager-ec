@echo off
echo ========================================================
echo Manager EC 啟動腳本
echo 正在準備啟動前後端服務...
echo ========================================================

echo [1/3] 清除佔用 Port 3000 和 8000 的既有程序...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :8000') DO TaskKill.exe /PID %%T /F 2>nul
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :3000') DO TaskKill.exe /PID %%T /F 2>nul

echo [2/3] 啟動後端服務 (Port 8000)...
start cmd /k "cd backend && uv run uvicorn main:app --reload"

echo [3/3] 啟動前端服務 (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo 啟動指令已送出！(請檢查新開出的兩個視窗狀態)
echo 後端 API 伺服器將執行於: http://localhost:8000
echo 前端網站將執行於: http://localhost:3000
echo ========================================================
