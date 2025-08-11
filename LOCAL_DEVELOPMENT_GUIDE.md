# 🛠️ Local Development Guide

## 🔑 Setting Up API Keys for Local Testing

### The Problem
- `.env` files are ignored by Git (security)
- But you need your API key locally to test

### ✅ Solution Methods

#### **Method 1: Command Line (What we just did)**
```bash
# Create .env file via PowerShell
echo "OPENAI_API_KEY=your_actual_key_here" > backend\.env
echo "FLASK_PORT=5000" >> backend\.env
echo "FLASK_DEBUG=True" >> backend\.env
```

#### **Method 2: Manual File Creation**
1. Open any text editor (Notepad, VSCode, etc.)
2. Create new file in `backend` folder named `.env`
3. Add these lines:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
FLASK_PORT=5000
FLASK_DEBUG=True
```

#### **Method 3: Copy from Template**
```bash
# Copy template and edit
copy backend\env_template.txt backend\.env
# Then edit backend\.env with your API key
```

#### **Method 4: Environment Variables (WORKING SOLUTION)**
If .env files have encoding issues, set directly in PowerShell:
```bash
# Set in current PowerShell session
$env:OPENAI_API_KEY="your_key_here"
$env:FLASK_PORT="5000"
$env:FLASK_DEBUG="True"

# Then start backend
python backend/app.py
```

**✅ This method works immediately and bypasses .env file issues!**

## 🧪 Testing Your Setup

### 1. Test Backend Startup
```bash
python backend/app.py
```
Should show: `Running on http://0.0.0.0:5000`

### 2. Test API Key Loading
```bash
cd backend
python -c "from config import Config; print('✅ API Key loaded:', bool(Config.OPENAI_API_KEY))"
```

### 3. Test YouTube Integration
```bash
python test_youtube_integration.py
```

### 4. Test Web Interface
1. Start backend: `python backend/app.py`
2. Open `frontend/index.html` in browser
3. Try YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

## 🔒 Security Notes

- ✅ `.env` files are automatically ignored by Git
- ✅ Never commit API keys to repository
- ✅ Your local `.env` stays on your machine only
- ✅ Safe to test locally with real API keys

## 🚨 If Still Not Working

1. **Check file location**: `.env` must be in `backend` folder
2. **Check file format**: No spaces around `=` sign
3. **Check API key**: Copy from OpenAI dashboard
4. **Restart terminal**: Sometimes environment changes need restart

## 💡 Pro Tips

- Keep a backup copy of your API key
- Set monthly usage limits in OpenAI dashboard
- Use different API keys for dev/production
- Check OpenAI usage regularly

---

**✅ You're now set up for local development!**
The backend should start without errors and YouTube transcription should work.