import openai
from config import Config

class OpenAIService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        
    def generate_notes(self, content, detail_level='medium', language='zh-tw'):
        """Generate notes from content using OpenAI"""
        
        # Get prompt based on detail level and language
        prompt = self._create_prompt(content, detail_level, language)
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert note-taker who creates well-structured study notes in Markdown format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=Config.OPENAI_MAX_TOKENS,
                temperature=Config.OPENAI_TEMPERATURE
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Failed to generate notes: {str(e)}")
    
    def _create_prompt(self, content, detail_level, language='zh-tw'):
        """Create prompt for note generation"""
        
        detail_instruction = Config.NOTE_DETAIL_LEVELS.get(detail_level, Config.NOTE_DETAIL_LEVELS['medium'])
        
        # Language-specific instructions
        language_instructions = {
            'en': "Please create well-organized study notes in English.",
            'zh-cn': "请创建结构良好的学习笔记，使用简体中文。",
            'zh-tw': "請創建結構良好的學習筆記，使用繁體中文。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        prompt = f"""
{detail_instruction}

Format the notes using Markdown with:
- # for main topics
- ## for subtopics  
- ### for sub-subtopics
- **bold** for important terms
- - bullet points for key concepts
- > for important quotes or definitions
- ` ` for technical terms or formulas

Content to convert into notes:

{content[:4000]}

{language_instruction}
"""
        return prompt
    
    def generate_flashcards(self, notes, language='zh-tw'):
        """Generate flashcards from notes"""
        
        # Language-specific instructions for flashcards
        language_instructions = {
            'en': "Create flashcards in English. Make questions clear and concise.",
            'zh-cn': "创建简体中文学习卡片。问题要清晰简洁。",
            'zh-tw': "創建繁體中文學習卡片。問題要清晰簡潔。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        prompt = f"""
Based on these notes, create 10 flashcards for studying.
Format as JSON array with "question" and "answer" fields.
{language_instruction}

Example format:
[
  {{"question": "What is...", "answer": "The answer is..."}},
  {{"question": "How does...", "answer": "It works by..."}}
]

Notes:
{notes[:2000]}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.5
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Failed to generate flashcards: {str(e)}")
    
    def generate_quiz(self, notes, language='zh-tw'):
        """Generate quiz from notes"""
        
        # Language-specific instructions for quiz
        language_instructions = {
            'en': "Create quiz questions in English. Make questions educational and clear.",
            'zh-cn': "创建简体中文测验题目。题目要有教育意义且清晰。",
            'zh-tw': "創建繁體中文測驗題目。題目要有教育意義且清晰。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        prompt = f"""
Create 5 multiple choice questions based on these notes.
Format as JSON array with:
- "question": the question
- "options": array of 4 options (A, B, C, D)
- "correct": the correct option letter
- "explanation": why this answer is correct

{language_instruction}

Example format:
[
  {{
    "question": "What is...",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correct": "A",
    "explanation": "The answer is A because..."
  }}
]

Notes:
{notes[:2000]}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.5
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Failed to generate quiz: {str(e)}")