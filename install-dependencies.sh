#!/bin/bash
echo "🚀 Installing SocialAI Pro dependencies..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run 'npm start' to start the application"