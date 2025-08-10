# Environment Setup Instructions

## Required: OpenAI API Key Setup

To run NexLearn AI Notes, you need to set up your OpenAI API key:

### Option 1: Environment Variable (Recommended)
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your_openai_api_key_here"

# Windows Command Prompt
set OPENAI_API_KEY=your_openai_api_key_here

# Linux/Mac
export OPENAI_API_KEY=your_openai_api_key_here
```

### Option 2: Create .env file
1. Create a file named `.env` in the `backend/` directory
2. Add the following content:
```
OPENAI_API_KEY=your_openai_api_key_here
FLASK_PORT=5000
FLASK_DEBUG=True
```

### Getting Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key and use it in the setup above

⚠️ **Important**: Never commit your actual API key to Git repositories!

### Verify Setup
Run the Flask server and check for any API key errors:
```bash
cd backend
python app.py
```

If successful, you should see:
```
* Running on http://127.0.0.1:5000
```