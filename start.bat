@echo off
REM Start script for SocialAI Pro (Windows)

echo 🚀 Starting SocialAI Pro...
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Check if virtual environment exists for backend
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend && python -m venv venv && cd ..
)

REM Activate virtual environment
call backend\venv\Scripts\activate.bat

REM Start both servers concurrently
npx concurrently ^
    --names "Backend,Frontend" ^
    --prefix-colors "blue,green" ^
    "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" ^
    "cd frontend && npm start"