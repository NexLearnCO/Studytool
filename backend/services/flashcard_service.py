"""
閃卡生成服務
基於筆記內容使用 AI 生成高質量的記憶卡片
"""

import json
import re
from typing import List, Dict, Any, Optional
from .openai_service import OpenAIService

class FlashcardService:
    def __init__(self):
        self.openai_service = OpenAIService()
    
    def generate_flashcards_from_note(
        self, 
        content: str, 
        title: str = "", 
        card_count: int = 10,
        difficulty: str = "mixed"
    ) -> List[Dict[str, Any]]:
        """
        從筆記內容生成閃卡
        
        Args:
            content: 筆記內容
            title: 筆記標題
            card_count: 要生成的卡片數量
            difficulty: 難度設定 (easy/mixed/hard)
            
        Returns:
            生成的閃卡列表
        """
        try:
            # 使用自定義高質量 prompt 生成閃卡
            response = self._generate_with_custom_prompt(content, title, card_count, difficulty)
            
            # 解析和轉換為統一格式
            if isinstance(response, str):
                # 如果返回的是字符串，嘗試解析 JSON
                flashcards = self._parse_flashcard_response(response)
            elif isinstance(response, list):
                # 如果已經是列表，直接使用
                flashcards = response
            else:
                # 其他情況，嘗試作為字典處理
                flashcards = response.get('flashcards', []) if isinstance(response, dict) else []
            
            # 為每張卡片添加智能難度分級
            flashcards_with_difficulty = self._assign_intelligent_difficulty(flashcards, difficulty)
            
            # 驗證和清理結果
            validated_cards = self._validate_flashcards(flashcards_with_difficulty, card_count)
            
            return validated_cards
            
        except Exception as e:
            print(f"生成閃卡時發生錯誤: {str(e)}")
            return self._generate_fallback_cards(content, card_count)
    
    def _build_flashcard_prompt(
        self, 
        content: str, 
        title: str, 
        card_count: int, 
        difficulty: str
    ) -> str:
        """構建閃卡生成的 prompt"""
        
        difficulty_instructions = {
            "easy": "重點關注基礎概念、定義和事實記憶",
            "mixed": "包含不同難度層次，從基礎到應用都要涵蓋",
            "hard": "重點關注概念理解、應用和分析能力"
        }
        
        prompt = f"""
你是一位專業的教育心理學家和記憶法專家。請基於以下筆記內容生成 {card_count} 張高質量的學習記憶卡片。

**筆記標題**: {title}
**難度要求**: {difficulty_instructions.get(difficulty, "混合難度")}

**筆記內容**:
{content}

**生成要求**:
1. **問題設計原則**:
   - 每個問題要具體、可測試
   - 避免模糊或過於寬泛的問題
   - 使用主動回憶的方式提問
   - 問題要能檢驗真正的理解而非死記硬背

2. **答案設計原則**:
   - 答案要簡潔但完整
   - 包含關鍵信息和解釋
   - 必要時提供記憶技巧或助記符
   - 避免過於冗長的答案

3. **難度分布**:
   - 難度 1-2: 基礎概念和定義
   - 難度 3: 概念理解和簡單應用
   - 難度 4-5: 深度理解和復雜應用

4. **覆蓋範圍**:
   - 確保涵蓋筆記中的所有重要概念
   - 包含不同類型的知識點（事實、概念、程序、應用）
   - 避免重複或過於相似的問題

**輸出格式** (必須是有效的 JSON):
```json
{{
  "flashcards": [
    {{
      "question": "具體的問題",
      "answer": "簡潔但完整的答案",
      "hint": "可選的提示（如果有助於記憶）",
      "difficulty": 1-5,
      "tags": ["相關標籤"],
      "type": "Definition|Concept|Application|Example"
    }}
  ]
}}
```

現在開始生成:
"""
        return prompt
    
    def _parse_flashcard_response(self, response: str) -> List[Dict[str, Any]]:
        """解析 AI 回應中的閃卡 JSON"""
        try:
            # 嘗試提取 JSON 部分（支援數組和對象）
            json_match = re.search(r'```json\s*(\[.*?\]|\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # 如果沒有找到 ```json``` 包裹，嘗試直接解析
                json_str = response.strip()
            
            # 解析 JSON
            data = json.loads(json_str)
            
            if 'flashcards' in data:
                return data['flashcards']
            else:
                return data if isinstance(data, list) else []
                
        except json.JSONDecodeError as e:
            print(f"JSON 解析錯誤: {str(e)}")
            print(f"原始回應: {response}")
            return []
        except Exception as e:
            print(f"解析回應時發生錯誤: {str(e)}")
            return []
    
    def _validate_flashcards(self, flashcards: List[Dict[str, Any]], target_count: int) -> List[Dict[str, Any]]:
        """驗證和清理閃卡數據"""
        validated = []
        
        for card in flashcards:
            # 檢查必需字段
            if not card.get('question') or not card.get('answer'):
                continue
            
            # 清理和標準化數據
            cleaned_card = {
                'question': str(card['question']).strip(),
                'answer': str(card['answer']).strip(),
                'hint': str(card.get('hint', '')).strip() if card.get('hint') else None,
                'difficulty': self._normalize_difficulty(card.get('difficulty', 3)),
                'tags': card.get('tags', []) if isinstance(card.get('tags'), list) else [],
                'type': card.get('type', 'Concept')
            }
            
            # 過濾空的提示
            if not cleaned_card['hint']:
                cleaned_card['hint'] = None
            
            validated.append(cleaned_card)
            
            # 達到目標數量就停止
            if len(validated) >= target_count:
                break
        
        return validated
    
    def _normalize_difficulty(self, difficulty: Any) -> int:
        """標準化難度值"""
        try:
            if isinstance(difficulty, str):
                difficulty = int(difficulty)
            if isinstance(difficulty, (int, float)):
                return max(1, min(5, int(difficulty)))
        except:
            pass
        return 3  # 默認中等難度
    
    def _assign_intelligent_difficulty(self, flashcards: List[Dict[str, Any]], difficulty_setting: str) -> List[Dict[str, Any]]:
        """為閃卡智能分配難度等級"""
        
        difficulty_ranges = {
            "easy": [1, 2, 3],      # 簡單：主要 1-2 級，少量 3 級
            "mixed": [1, 2, 3, 4, 5], # 混合：全範圍
            "hard": [3, 4, 5]       # 困難：主要 4-5 級，少量 3 級
        }
        
        available_levels = difficulty_ranges.get(difficulty_setting, [1, 2, 3, 4, 5])
        
        for i, card in enumerate(flashcards):
            # 基於內容複雜度和位置智能分配難度
            if difficulty_setting == "easy":
                # 簡單模式：70% 為 1-2 級
                if i % 10 < 7:
                    card['difficulty'] = 1 if i % 2 == 0 else 2
                else:
                    card['difficulty'] = 3
            elif difficulty_setting == "hard":
                # 困難模式：70% 為 4-5 級
                if i % 10 < 7:
                    card['difficulty'] = 4 if i % 2 == 0 else 5
                else:
                    card['difficulty'] = 3
            else:
                # 混合模式：均勻分布
                card['difficulty'] = available_levels[i % len(available_levels)]
            
            # 基於問題長度微調難度
            question_length = len(card.get('question', ''))
            if question_length > 100:
                card['difficulty'] = min(5, card['difficulty'] + 1)
            elif question_length < 30:
                card['difficulty'] = max(1, card['difficulty'] - 1)
        
        return flashcards
    
    def _generate_with_custom_prompt(self, content: str, title: str, card_count: int, difficulty: str) -> str:
        """使用自定義高質量 prompt 生成閃卡"""
        
        # 構建高質量的專業 prompt
        prompt = self._build_enhanced_flashcard_prompt(content, title, card_count, difficulty)
        
        try:
            # 直接使用現有的 OpenAI 閃卡生成方法
            response = self.openai_service.generate_flashcards(
                notes=content,
                count=card_count,
                difficulty=difficulty
            )
            return response
            
        except Exception as e:
            print(f"閃卡生成失敗: {str(e)}")
            # 生成備用閃卡
            return self._generate_fallback_cards(content, card_count)
    
    def _build_enhanced_flashcard_prompt(self, content: str, title: str, card_count: int, difficulty: str) -> str:
        """構建增強的閃卡生成 prompt"""
        
        difficulty_guidelines = {
            "easy": """
重點關注：
- 基礎定義和概念
- 簡單的事實記憶
- 直接的問答
- 關鍵詞識別
難度分布：主要 1-2 級（基礎），少量 3 級（中等）""",
            
            "mixed": """
重點關注：
- 涵蓋各種認知層次
- 從記憶到理解到應用
- 包含不同類型的知識點
- 平衡簡單和複雜概念
難度分布：均勻分布 1-5 級""",
            
            "hard": """
重點關注：
- 深度理解和分析
- 概念間的關聯
- 應用和推理能力
- 批判性思維
難度分布：主要 4-5 級（困難），少量 3 級（中等）"""
        }
        
        guidelines = difficulty_guidelines.get(difficulty, difficulty_guidelines["mixed"])
        
        prompt = f"""
你是一位資深的教育心理學家和記憶科學專家，專精於設計高效的學習卡片。請基於以下筆記內容生成 {card_count} 張高質量的記憶卡片。

**筆記標題**: {title}
**內容**: {content}

**生成原則**:
{guidelines}

**卡片設計標準**:
1. **問題設計**:
   - 問題要具體、可測試、無歧義
   - 使用主動回憶原則
   - 避免是非題，多用開放式問題
   - 問題長度適中（20-80字）
   - 測試理解而非死記硬背

2. **答案設計**:
   - 答案簡潔但完整
   - 包含關鍵概念和解釋
   - 必要時提供記憶技巧
   - 長度控制在 50-200 字

3. **質量要求**:
   - 每張卡片聚焦單一概念
   - 涵蓋筆記中的重要知識點
   - 避免重複或過於相似
   - 確保答案在筆記中能找到依據

4. **類型分布**:
   - 定義類：核心概念的定義和解釋
   - 應用類：概念的實際應用和例子
   - 分析類：概念間的關係和差異
   - 記憶類：重要事實和細節

**輸出格式**（必須是有效的 JSON）:
```json
[
  {{
    "question": "具體明確的問題",
    "answer": "簡潔完整的答案",
    "hint": "記憶提示（可選）",
    "type": "Definition|Application|Analysis|Memory"
  }}
]
```

**重要**: 確保生成的卡片能有效測試學習者對筆記內容的掌握程度。現在開始生成：
"""
        return prompt
    
    def _generate_fallback_cards(self, content: str, card_count: int) -> List[Dict[str, Any]]:
        """生成備用閃卡（當 AI 生成失敗時）"""
        # 簡單的文本分析生成基礎閃卡
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        fallback_cards = []
        for i, paragraph in enumerate(paragraphs[:card_count]):
            if len(paragraph) > 50:  # 只有足夠長的段落才生成卡片
                # 取前50字作為問題提示，全段作為答案
                question = f"關於以下內容的重點是什麼？\n{paragraph[:50]}..."
                answer = paragraph
                
                fallback_cards.append({
                    'question': question,
                    'answer': answer,
                    'hint': None,
                    'difficulty': 3,
                    'tags': ['自動生成'],
                    'type': 'Concept'
                })
        
        return fallback_cards
    
    def generate_from_content_directly(
        self, 
        content: str, 
        source_type: str = "direct",
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        直接從內容生成閃卡（用於 PDF/YouTube 等直接生成場景）
        """
        return self.generate_flashcards_from_note(
            content=content,
            title=f"來自{source_type}的內容",
            **kwargs
        )
