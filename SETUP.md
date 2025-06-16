# Quick Setup Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies
```bash
npm install -g concurrently  # Install globally (one-time only)
npm run setup               # Install all project dependencies
```

### Step 2: Configure Environment Variables
```bash
# Edit backend/.env file
# Add your API keys:
ANTHROPIC_API_KEY=your-claude-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/socialaipro
```

### Step 3: Start the Application
```bash
npm start
```

That's it! 🎉

- Backend API: http://localhost:8000
- Frontend App: http://localhost:3000
- API Docs: http://localhost:8000/docs

## 🔧 Configuration Requirements

### Required API Keys
1. **Claude (Anthropic)**: Get from https://console.anthropic.com/
2. **Perplexity**: Get from https://www.perplexity.ai/settings/api

### Optional Platform Keys (can be added later)
1. **X (Twitter)**: Get from https://developer.twitter.com/
2. **LinkedIn**: Get from https://developer.linkedin.com/

### Database Setup
- Default: SQLite (no setup required)
- Production: PostgreSQL (update DATABASE_URL)

## 🔐 Security Notes

- Never commit `.env` files
- Use strong SECRET_KEY (generate with: `openssl rand -hex 32`)
- API keys are encrypted in the database
- Users can provide their own API keys

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports
sudo lsof -ti:8000 | xargs kill -9  # Backend
sudo lsof -ti:3000 | xargs kill -9  # Frontend
```

**Python virtual environment:**
```bash
# Manually create if needed
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

**Missing dependencies:**
```bash
# Reinstall everything
npm run install:all
```

**Database issues:**
```bash
# Reset database (development only)
rm backend/app.db  # If using SQLite
```

## 🏃‍♂️ Development Workflow

1. **Start development**: `npm start`
2. **Make changes**: Edit files in `backend/` or `frontend/`
3. **Test**: `npm test`
4. **Stop**: `Ctrl+C` (stops both servers)

## 📁 Project Structure
```
social-media-automation/
├── backend/           # FastAPI Python backend
├── frontend/          # React frontend
├── docs/             # Documentation
├── start.sh          # Unix/Mac start script
├── start.bat         # Windows start script
└── package.json      # Root package with scripts
```