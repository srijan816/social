# Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Backend Issues

#### 1. "SettingsError: error parsing value for field" 
**Solution**: Make sure you have a `.env` file in the `backend/` directory.
```bash
cp backend/.env.example backend/.env
```

#### 2. "Registration failed" / Database errors
**Solution**: The backend creates SQLite database automatically. No setup needed.

#### 3. "Module not found" errors
**Solution**: Install dependencies in virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Frontend Issues

#### 1. "Proxy error: Could not proxy request"
**Problem**: Backend not running
**Solution**: Start backend first or use `npm start` from root directory

#### 2. ESLint warnings about unused imports
**Solution**: These are just warnings, app will still work. To fix:
```bash
cd frontend
npm run build  # Warnings disappear in production build
```

#### 3. "API calls failing"
**Solution**: Check that backend is running on port 8000
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Authentication Issues

#### 1. "Incorrect email or password"
**Solution**: 
- There's no default user - you need to register first
- Use the "Sign Up" link to create an account

#### 2. "Registration failed"
**Solution**: Check that:
- Username is at least 3 characters
- Email is valid format
- Password is at least 8 characters
- Username/email not already taken

### API Key Issues

#### 1. "Content generation failed"
**Solution**: Add your API keys in Settings:
- Anthropic API key (required for content generation)
- Perplexity API key (required for research)

#### 2. "Invalid API key" errors
**Solution**: 
- Get Anthropic key from: https://console.anthropic.com/
- Get Perplexity key from: https://www.perplexity.ai/settings/api
- Make sure keys are correctly copied (no extra spaces)

### Port Issues

#### 1. "Port already in use"
**Solution**: Kill existing processes
```bash
# Kill backend process
lsof -ti:8000 | xargs kill -9

# Kill frontend process  
lsof -ti:3000 | xargs kill -9
```

#### 2. "EADDRINUSE" errors
**Solution**: Change ports in configuration if needed
- Backend: Edit `package.json` start:backend script
- Frontend: Create `.env.local` with `PORT=3001`

### Platform Connection Issues

#### 1. "Twitter/X API errors"
**Solution**: 
- Get API keys from https://developer.twitter.com/
- Need API Key, API Secret, Access Token, Access Token Secret
- Make sure your Twitter developer account is approved

#### 2. "LinkedIn API errors"
**Solution**:
- LinkedIn requires OAuth2 flow
- Get credentials from https://developer.linkedin.com/
- May need LinkedIn partner approval for posting

## 🚀 Quick Reset

If everything is broken, try this:

```bash
# Stop all processes
pkill -f uvicorn
pkill -f "npm start"

# Clean install
rm -rf frontend/node_modules
rm -rf node_modules
rm -rf backend/venv

# Reinstall everything
./install-dependencies.sh

# Start fresh
npm start
```

## 📞 Getting Help

1. Check the console/terminal for error messages
2. Look at browser developer tools (F12) for frontend errors
3. Check backend logs for API errors
4. Ensure all required files exist:
   - `backend/.env`
   - `frontend/.env.local`
   - `backend/venv/` (created automatically)

## 🔍 Verify Installation

Test each component:

```bash
# Test backend
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# Test API
curl http://localhost:8000/docs
```

## 💡 Pro Tips

1. **Use the browser developer tools** - Most frontend issues show detailed errors in the console
2. **Check the terminal output** - Backend errors are usually very descriptive
3. **Start components separately** - Use `npm run start:backend` and `npm run start:frontend` to isolate issues
4. **Use the API documentation** - Visit http://localhost:8000/docs when backend is running