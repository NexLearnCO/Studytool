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
            # 直接使用現有的 OpenAI 閃卡生成方法
            response = self.openai_service.generate_flashcards(
                notes=content,
                count=card_count,
                difficulty=difficulty
            )
            
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
            
            # 驗證和清理結果
            validated_cards = self._validate_flashcards(flashcards, card_count)
            
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
            # 嘗試提取 JSON 部分
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
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
