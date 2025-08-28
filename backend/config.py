import os
from dotenv import load_dotenv

# Load environment variables
try:
    # Try to load .env from current directory first
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    # Also try from current working directory
    load_dotenv('.env')
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    pass  # Ignore dotenv errors

class Config:
    # OpenAI API Key - REQUIRED: Set this as environment variable
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable is required. Please set it in your .env file.")
    
    # Flask settings
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {'pdf', 'txt'}
    
    # Database settings
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///nexlearn.db')
    
    # OpenAI settings
    OPENAI_MODEL = "gpt-3.5-turbo"
    OPENAI_MAX_TOKENS = 6000  # Further increased for comprehensive notes
    OPENAI_TEMPERATURE = 0.3
    
    # Note generation settings
    NOTE_DETAIL_LEVELS = {
        'brief': 'Create brief notes with only main points',
        'medium': 'Create balanced notes with main points and some details',
        'detailed': 'Create comprehensive notes with all important information'
    }

    # Ingest pipeline preferences
    PREFER_MINERU = os.getenv('PREFER_MINERU', 'false').lower() == 'true'
    MINERU_API_BASE = os.getenv('MINERU_API_BASE', '')
    MINERU_API_KEY = os.getenv('MINERU_API_KEY', '')