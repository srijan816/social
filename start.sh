#!/bin/bash
# Start script for SocialAI Pro (Unix/macOS/Linux)

echo "🚀 Starting SocialAI Pro..."
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Check if virtual environment exists for backend
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend && python -m venv venv && cd ..
fi

# Activate virtual environment and start backend
source backend/venv/bin/activate

# Start both servers concurrently
npx concurrently \
    --names "Backend,Frontend" \
    --prefix-colors "blue,green" \
    "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" \
    "cd frontend && npm start"