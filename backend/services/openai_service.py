import openai
from config import Config

class OpenAIService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        self.model = Config.OPENAI_MODEL
        
    def generate_notes(self, content, detail_level='medium', language='zh-tw', content_type='general'):
        """Generate notes from content using OpenAI with enhanced prompts and smart content handling"""
        
        # Handle very large content by intelligent chunking if needed
        if len(content) > 15000:  # ~15k characters is roughly safe limit for context
            return self._generate_notes_chunked(content, detail_level, language, content_type)
        
        # Get optimized prompt based on detail level, language, and content type
        prompt = self._create_prompt(content, detail_level, language, content_type)
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert note-taker who creates well-structured study notes in Markdown format. Provide content directly without meta-commentary or conclusive summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=Config.OPENAI_MAX_TOKENS,
                temperature=Config.OPENAI_TEMPERATURE
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Failed to generate notes: {str(e)}")
    
    def _generate_notes_chunked(self, content, detail_level, language, content_type):
        """Handle very large content by chunking and combining results"""
        
        # Split content into manageable chunks
        chunk_size = 12000  # Safe chunk size
        chunks = []
        
        for i in range(0, len(content), chunk_size):
            chunk = content[i:i + chunk_size]
            chunks.append(chunk)
        
        # Generate notes for each chunk
        chunk_notes = []
        for i, chunk in enumerate(chunks):
            try:
                prompt = self._create_prompt(chunk, detail_level, language, content_type)
                
                # Add chunk context
                if len(chunks) > 1:
                    prompt += f"\n\n注意：這是第 {i+1} 部分，共 {len(chunks)} 部分。請確保內容銜接自然。不要添加總結性結尾，直接以內容結束。"
                
                response = openai.ChatCompletion.create(
                    model=Config.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an expert note-taker who creates well-structured study notes in Markdown format. Provide content directly without meta-commentary or conclusive summaries."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=Config.OPENAI_MAX_TOKENS,
                    temperature=Config.OPENAI_TEMPERATURE
                )
                
                chunk_notes.append(response.choices[0].message.content)
                
            except Exception as e:
                chunk_notes.append(f"## 第 {i+1} 部分處理錯誤\n\n錯誤: {str(e)}")
        
        # Combine all chunk notes
        if len(chunk_notes) == 1:
            return chunk_notes[0]
        
        # Create a unified document from chunks
        combined_notes = "# 完整學習筆記\n\n"
        for i, notes in enumerate(chunk_notes):
            # Remove duplicate headers and combine
            clean_notes = notes.replace("# ", "## ").replace("##", f"## 第 {i+1} 部分 - ")
            combined_notes += clean_notes + "\n\n---\n\n"
        
        return combined_notes.rstrip("\n---\n")
    
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
            
            'medium': """創建平衡但全面的詳細筆記：
【核心要求】
- 包含所有主要概念的完整解釋
- 提供關鍵例子的詳細分析
- 包含重要的公式、數據和步驟
- 解釋概念間的關係和連結

【詳細程度】
- 每個概念都要有充分的解釋
- 包含至少2-3個典型例子
- 提供實用的識別方法和技巧
- 適合深度學習，不只是概覽""",
            
            'detailed': """創建極其詳盡、全面的學習筆記：
【完整性要求】
- 包含源內容中的ALL信息，不遺漏任何細節
- 提供COMPLETE解釋，不只是總結
- 包含所有提及的例子、數據、公式、步驟
- 解釋"為什麼"，不只是"是什麼"

【詳細程度標準】
- 沒看過原內容的人應該完全理解主題
- 足夠詳細用於考試準備
- 適合初學和復習雙重用途
- 絕不使用縮略解釋 - 必須徹底完整"""
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

### 1. 結構與格式化
- 使用清晰的表情符號圖標標示主要章節 (🔄, 🧪, 📊, ⚗️, 📈, 💡等)
- 創建多層次標題結構 (H1, H2, H3, H4)
- 為比較和關係創建表格
- 使用項目符號列表
- **粗體**標示關鍵術語和定義
- 包含相關的公式/方程式

### 2. 內容深度要求
- 提供**完整**解釋，而非僅僅總結
- 包含源內容中提及的**所有**例子
- 顯示逐步過程
- 包含具體數字、公式和數據
- 解釋概念背後的"為什麼"，不只是"是什麼"

### 3. 視覺組織
- 為相關概念創建比較表格
- 為重要定義使用格式化框
- 包含過程流程圖 (步驟1 → 步驟2 → 步驟3)
- 在清晰章節中分離例子
- 對類似內容類型使用一致格式

### 4. 具體包含內容

**對於概念：**
- 完整定義
- 運作方式
- 重要性原因
- 相關概念

**對於過程：**
- 每個步驟的詳細解釋
- 每個階段發生什麼
- 常見變化

**對於例子：**
- 完整的方程式/公式
- 逐步分析
- 識別所有組成部分
- 解釋結果

**對於規則/原理：**
- 清楚陳述規則
- 列出所有例外
- 提供應用例子
- 常見誤解

### 5. 表格格式要求
```
| 欄位1 | 欄位2 | 欄位3 |
|-------|-------|-------|
| 概念 | 定義 | 例子 |
| 過程 | 發生什麼 | 結果 |
| 比較 | 項目A | 項目B |
```

### 6. 例子格式
```
### 例子X: [標題]
**給定：** [初始條件]
**過程：**
- 步驟1: [詳細解釋]
- 步驟2: [什麼改變及為什麼]

**識別：**
- 組成1: [角色和變化]
- 組成2: [角色和變化]

**結果：** [最終結果及解釋]
```

### 7. 必須包含的關鍵章節
- 🎯 概覽/介紹
- 🧠 核心概念（完整解釋）
- ⚙️ 詳細機制/過程
- 📝 多個完整例子
- ⚠️ 特殊情況和例外
- 📋 快速參考/總結
- 🔍 識別方法/技巧

## 質量標準：
- ✅ 沒看過原內容的人應該完全理解主題
- ✅ 足夠詳細用於考試準備  
- ✅ 適合初學和復習雙重用途
- ✅ 包含實際化學公式，不只是名稱
- ✅ 顯示氧化態標記 (+2, -1等)
- ✅ 包含電子轉移方程式
- ✅ 解釋概念間關係
- ✅ 提供記憶輔助和模式識別
- ✅ 絕不使用縮略解釋 - 必須徹底完整

**格式要求：**
- 直接提供學習內容，不要添加總結性結尾
- 不要包含"這些筆記提供了..."或"理解這些概念很重要"等總結語句
- 筆記應該以實際內容結束，而不是元評論
- 使用表情符號和表格增強視覺效果
- 為所有例子提供完整的逐步分析

**語言設置：**
{language_instruction}

請創建一份專業的學習筆記，直接提供學習內容，無需總結性結尾。

---

**內容來源：**
{content}
"""
        return prompt
    
    def generate_flashcards(self, notes, count=15, difficulty='medium', types=['definition', 'example'], language='zh-tw'):
        """Generate enhanced flashcards from notes using optimized prompts"""
        
        # Enhanced language-specific instructions for flashcards
        language_instructions = {
            'en': "Create flashcards in English with clear, academic terminology. Design questions that test understanding and memory effectively.",
            'zh-cn': "创建简体中文学习卡片。设计能有效测试理解和记忆的问题，使用准确的学术术语。",
            'zh-tw': "創建繁體中文學習卡片。設計能有效測試理解和記憶的問題，使用準確的學術術語。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        # Define card types in different languages
        type_descriptions = {
            'en': {
                'definition': 'Definition/explanation cards',
                'example': 'Example/illustration cards', 
                'application': 'Application/problem-solving cards',
                'comparison': 'Comparison/contrast cards'
            },
            'zh-cn': {
                'definition': '定义解释类卡片',
                'example': '举例说明类卡片',
                'application': '应用练习类卡片', 
                'comparison': '比较分析类卡片'
            },
            'zh-tw': {
                'definition': '定義解釋類卡片',
                'example': '舉例說明類卡片',
                'application': '應用練習類卡片',
                'comparison': '比較分析類卡片'
            }
        }
        
        type_desc = type_descriptions.get(language, type_descriptions['zh-tw'])
        selected_types = [type_desc[t] for t in types if t in type_desc]

        prompt = f"""
基於提供的學習筆記，創建 {count} 張高質量的記憶卡片用於學習復習。

## 卡片要求：
- 數量：{count} 張
- 難度：{difficulty}
- 包含類型：{', '.join(selected_types)}

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
{notes}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,  # Increased for better flashcards
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
{notes}
"""
        
        try:
            response = openai.ChatCompletion.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2500,  # Increased for comprehensive quizzes
                temperature=0.5
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Failed to generate quiz: {str(e)}")

    def generate_unified_notes(self, content, detail_level='medium', language='zh-tw', context_info=None):
        """Generate notes from multiple unified sources with enhanced context awareness"""
        
        if not context_info:
            context_info = {}
        
        # Enhanced language-specific instructions
        language_instructions = {
            'en': "Create comprehensive unified study notes in English from multiple sources. Integrate all content seamlessly while maintaining academic quality.",
            'zh-cn': "请从多个来源创建全面统一的简体中文学习笔记。无缝整合所有内容，保持学术质量。",
            'zh-tw': "請從多個來源創建全面統一的繁體中文學習筆記。無縫整合所有內容，保持學術質量。"
        }
        
        language_instruction = language_instructions.get(language, language_instructions['zh-tw'])
        
        # Context-aware prompt enhancement
        exam_context = ""
        if context_info.get('exam_system'):
            exam_system_names = {
                'ibdp': 'IB Diploma Programme',
                'al': 'A Level',
                'gcse': 'GCSE',
                'hkdse': 'HKDSE',
                'ap': 'Advanced Placement',
                'sat': 'SAT'
            }
            exam_name = exam_system_names.get(context_info['exam_system'], context_info['exam_system'])
            exam_context = f"針對 {exam_name} 考試系統"
        
        subject_context = ""
        if context_info.get('subject'):
            subject_names = {
                'chemistry': '化學',
                'physics': '物理',
                'biology': '生物',
                'pure-mathematics': '純數學',
                'computer-science': '計算機科學'
            }
            subject_name = subject_names.get(context_info['subject'], context_info['subject'])
            subject_context = f"，科目：{subject_name}"
        
        topic_context = ""
        if context_info.get('topic') or context_info.get('custom_topic'):
            topic = context_info.get('custom_topic') or context_info.get('topic', '')
            topic_context = f"，主題：{topic}"
        
        source_context = ""
        if context_info.get('sources'):
            source_types = [s['type'] for s in context_info['sources']]
            source_counts = {}
            for source_type in source_types:
                source_counts[source_type] = source_counts.get(source_type, 0) + 1
            
            source_descriptions = []
            for source_type, count in source_counts.items():
                type_names = {
                    'youtube': 'YouTube 影片',
                    'file': '文件',
                    'text': '文字內容',
                    'webpage': '網頁'
                }
                type_name = type_names.get(source_type, source_type)
                source_descriptions.append(f"{count}個{type_name}")
            
            source_context = f"，整合來源：{', '.join(source_descriptions)}"

        prompt = f"""你是一位專業的多源學習內容整合專家。{language_instruction}

## 任務背景：
{exam_context}{subject_context}{topic_context}{source_context}

## 內容整合要求：

### 🎯 整合原則：
1. **統一性** - 將所有來源的內容整合為一個連貫的學習資源
2. **層次性** - 按重要性和邏輯順序組織內容
3. **完整性** - 保留所有重要信息，避免重複和冗餘
4. **學習導向** - 針對{exam_context}的學習和考試需求優化

### 📚 筆記結構：
1. **核心概念總覽** - 所有來源的關鍵概念統整
2. **詳細內容組織** - 按邏輯主題分類整合
3. **關鍵點提取** - 重要定義、公式、例子
4. **學習重點** - 考試要點和重要知識點
5. **內容來源標註** - 適當標註重要信息的來源類型

### 🔍 內容處理：
- **去重整合** - 合併相似內容，補充不同角度的信息
- **結構優化** - 重新組織為最佳學習順序
- **語言統一** - 使用一致的術語和表達風格
- **深度整合** - 建立不同來源間的概念聯繫

### 📊 品質標準：
- **準確性** - 保持所有技術信息的準確性
- **完整性** - 覆蓋所有重要學習內容
- **可讀性** - 清晰的結構和表達
- **實用性** - 便於複習和考試準備

請基於以上要求，將提供的多源內容整合為高質量的統一學習筆記：

---

{content}

---

請確保生成的筆記具有清晰的結構、豐富的內容和優秀的學習價值。"""

        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": language_instruction},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating unified notes: {e}")
            return "抱歉，生成統一筆記時出現錯誤。"