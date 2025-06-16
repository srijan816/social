# SocialAI Pro - AI-Powered Social Media Automation

An intelligent web application that automates social media content creation and scheduling for X (Twitter) and LinkedIn using AI-powered research and content generation.

## 🚀 Features

- **AI-Powered Content Generation**: Uses Claude Sonnet 4 for creating platform-optimized content
- **Intelligent Research**: Leverages Perplexity API to gather relevant data and insights
- **Multi-Platform Support**: Optimized content for X (Twitter) and LinkedIn
- **Interactive Web Interface**: User-friendly dashboard for content management
- **Smart Scheduling**: Schedule posts for optimal engagement times
- **Content Preview & Editing**: Review and modify AI-generated content before posting

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queue
- **Celery** - Background task processing
- **SQLAlchemy** - ORM

### Frontend
- **React** - UI framework
- **Material-UI** - Component library
- **React Query** - Data fetching
- **React Hook Form** - Form management

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- API Keys for:
  - Claude (Anthropic)
  - Perplexity
  - X (Twitter) Developer Account
  - LinkedIn Developer Account

## 🛠️ Quick Start

> 📖 **New to the project?** Check out [SETUP.md](SETUP.md) for a detailed 3-minute setup guide.

### Option 1: One-Command Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/social-media-automation.git
cd social-media-automation

# Install dependencies for both backend and frontend
npm run setup

# Start both backend and frontend simultaneously
npm start
```

### Option 2: Platform-Specific Scripts
```bash
# For Unix/macOS/Linux:
./start.sh

# For Windows:
start.bat
```

The application will start:
- **Backend**: http://localhost:8000 (API + Documentation)
- **Frontend**: http://localhost:3000 (Web Interface)

**To stop**: Press `Ctrl+C` in the terminal - this will stop both servers simultaneously.

## 📋 Manual Installation (Alternative)

If you prefer to set up each component separately:

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the backend server
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm start
```

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost/socialaipro
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=your-claude-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:8000
```

## 📖 Usage

1. **Sign Up/Login**: Create an account or login to your dashboard
2. **Connect Platforms**: Add your X and LinkedIn credentials
3. **Configure API Keys**: Add your Claude and Perplexity API keys
4. **Generate Content**:
   - Enter a topic or theme
   - Review AI research findings
   - Approve or edit generated content
   - Schedule for posting
5. **Manage Posts**: Use the calendar view to manage scheduled content

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📜 Available Scripts

Once installed, you can use these npm scripts from the root directory:

```bash
# Development
npm start              # Start both backend and frontend
npm run dev            # Same as npm start
npm run setup          # Install all dependencies and create env files

# Individual services
npm run start:backend  # Start only backend
npm run start:frontend # Start only frontend

# Installation
npm run install:all    # Install dependencies for both
npm run install:backend # Install Python dependencies
npm run install:frontend # Install Node.js dependencies

# Testing
npm test               # Run tests for both backend and frontend
npm run test:backend   # Run Python tests
npm run test:frontend  # Run React tests

# Building
npm run build          # Build frontend for production

# Linting
npm run lint           # Lint both backend and frontend code
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Claude API by Anthropic for content generation
- Perplexity API for research capabilities
- X (Twitter) and LinkedIn for platform APIs