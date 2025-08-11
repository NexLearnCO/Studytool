import openai
from config import Config

class OpenAIService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        
    def generate_notes(self, content, detail_level='medium', language='zh-tw', content_type='general'):
        """Generate notes from content using OpenAI with enhanced prompts"""
        
        # Get optimized prompt based on detail level, language, and content type
        prompt = self._create_prompt(content, detail_level, language, content_type)
        
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
    
    def _create_prompt(self, content, detail_level, language='zh-tw', content_type='general'):
        """Create optimized prompt for note generation based on Claude Opus 4.1 suggestions"""
        
        # Enhanced detail level instructions
        detail_instructions = {
            'brief': """專注於最核心的概念和要點。創建簡潔但完整的筆記：
- 只包含必須掌握的關鍵概念
- 每個主題限制在最重要的2-3個要點
- 使用簡潔的語言，避免冗餘
- 適合快速復習和概覽
- 保持邏輯清晰但內容精簡""",
            
            'medium': """平衡詳細說明和可讀性。創建全面但不冗長的筆記：
- 包含主要概念和重要的支持信息
- 提供必要的例子和說明
- 詳細程度適中，既不過簡也不過繁
- 適合常規學習和考試準備
- 保持良好的結構和流暢性""",
            
            'detailed': """提供全面深入的分析。創建完整詳盡的筆記：
- 包含所有重要信息和細節
- 提供豐富的例子、數據和說明
- 深入分析概念間的關係
- 包含背景信息和延伸思考
- 適合深度學習和專業研究
- 確保學術完整性和參考價值"""
        }
        
        # Enhanced language-specific instructions
        language_instructions = {
            'en': "Create comprehensive study notes in English. Use clear, academic English suitable for learning and review. Ensure professional terminology and proper grammar throughout.",
            'zh-cn': "请用简体中文创建全面的学习笔记。使用清晰、学术化的中文表达，适合学习和复习。确保专业术语准确，语法规范。",
            'zh-tw': "請用繁體中文創建全面的學習筆記。使用清晰、學術化的中文表達，適合學習和複習。確保專業術語準確，語法規範。"
        }
        
        # Content-type specific instructions
        content_type_instructions = {
            'youtube': """你是一位專業的學習筆記專家。請從提供的 YouTube 影片轉錄文本創建高質量的學習筆記。

## 分析方法：
1. **完整理解內容** - 仔細閱讀整個轉錄文本，識別主要概念和關鍵信息，過濾掉填充詞、重複內容和非教育性內容
2. **結構化組織** - 按主題而非時間順序組織，從基礎概念到進階內容，創建清晰的層次結構
3. **內容要求** - 包含所有重要信息點，保留具體例子和數據，突出關鍵術語和定義""",
            
            'pdf': """你是一位專業的學術筆記整理專家。請將提供的 PDF 文本內容轉換為結構化的學習筆記。

## 處理策略：
1. **文本分析** - 識別章節結構和主要論點，提取關鍵概念、定義和理論，保留重要的數據、統計和引用
2. **知識整合** - 按概念主題重新組織內容，建立概念之間的邏輯聯繫，突出重要的學術要點
3. **學習優化** - 簡化複雜句子但保留原意，添加邏輯連接詞增強可讀性，強調可考試的重點內容""",
            
            'general': """你是一位專業的內容組織專家。請將提供的文本內容轉換為結構化的學習筆記。

## 處理流程：
1. **內容理解** - 全面分析文本結構和核心主題，識別主要論點和支持信息
2. **結構重組** - 按邏輯主題重新排列內容，創建清晰的信息層次，建立概念間的關聯
3. **學習導向** - 優化內容以便理解和記憶，強調可操作的知識點，適合不同學習風格"""
        }
        
        detail_instruction = detail_instructions.get(detail_level, detail_instructions['medium'])
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        content_instruction = content_type_instructions.get(content_type, content_type_instructions['general'])
        
        prompt = f"""
{content_instruction}

## 詳細程度要求：
{detail_instruction}

## 格式要求：
**結構：**
- # 主標題（內容主要主題）
- ## 主要章節
- ### 子主題
- #### 詳細概念

**樣式：**
- **粗體** 標示重要術語
- `代碼格式` 用於技術術語或公式
- > 引用格式用於重要定義或要點
- - 項目符號用於列表
- 1. 數字列表用於步驟或序列

## 質量標準：
- ✅ 完整覆蓋所有教育內容
- ✅ 邏輯流暢，易於理解
- ✅ 適合複習和學習
- ✅ 無重複或冗餘信息
- ✅ 保留所有重要細節

**語言設置：**
{language_instruction}

請創建一份專業的學習筆記，就像是由教育專家編寫的完整學習指南。

---

**內容來源：**
{content[:6000]}
"""
        return prompt
    
    def generate_flashcards(self, notes, language='zh-tw'):
        """Generate enhanced flashcards from notes using optimized prompts"""
        
        # Enhanced language-specific instructions for flashcards
        language_instructions = {
            'en': "Create flashcards in English with clear, academic terminology. Design questions that test understanding and memory effectively.",
            'zh-cn': "创建简体中文学习卡片。设计能有效测试理解和记忆的问题，使用准确的学术术语。",
            'zh-tw': "創建繁體中文學習卡片。設計能有效測試理解和記憶的問題，使用準確的學術術語。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        prompt = f"""
基於提供的學習筆記，創建高質量的記憶卡片用於學習復習。

## 卡片設計原則：

1. **問題設計**
   - 針對關鍵概念創建明確的問題
   - 使用不同類型的問題（定義、應用、比較等）
   - 確保問題具有挑戰性但可回答
   - 避免過於模糊或過於簡單的問題

2. **答案要求**
   - 提供準確、完整的答案
   - 包含足夠的上下文信息
   - 使用清晰的解釋和例子
   - 適合記憶和理解

3. **學習效果**
   - 涵蓋筆記中的所有重要概念
   - 平衡記憶和理解類問題
   - 支持間隔重複學習法
   - 適合自我測試

**語言設置：**
{language_instruction}

**格式要求：**
返回 JSON 格式，包含 10 張卡片：

[
  {{"question": "清晰的問題", "answer": "詳細的答案"}},
  {{"question": "另一個問題", "answer": "對應的答案"}}
]

基於以下筆記內容創建記憶卡片：
{notes[:3000]}
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
基於提供的學習筆記，創建一個全面的選擇題測驗來評估學習效果。

## 測驗設計標準：

1. **題目質量**
   - 涵蓋筆記中的關鍵知識點
   - 測試不同層次的理解（記憶、理解、應用）
   - 問題表述清晰無歧義
   - 適當的難度分佈

2. **選項設計**
   - 一個正確答案，三個合理的干擾項
   - 干擾項要有迷惑性但明確錯誤
   - 避免"以上皆是"或"以上皆非"的選項
   - 選項長度相近，避免明顯提示

3. **評估效果**
   - 能有效測試學習成果
   - 覆蓋重要概念和細節
   - 支持自我評估和復習
   - 提供學習反饋

**語言設置：**
{language_instruction}

**格式要求：**
返回 JSON 格式，包含 5 道選擇題：

[
  {{
    "question": "問題內容",
    "options": ["A選項", "B選項", "C選項", "D選項"],
    "correct": "A",
    "explanation": "為什麼這個答案正確的詳細解釋"
  }}
]

基於以下筆記內容創建測驗：
{notes[:3000]}
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