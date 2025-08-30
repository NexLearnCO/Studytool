"""
Vision AI Service for analyzing images and determining content placement
"""

import base64
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from backend.config import Config


class VisionService:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
    
    def encode_image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Failed to encode image {image_path}: {e}")
            return ""
    
    def analyze_image_content(self, image_path: str, image_url: str, page: int, context: str = "") -> Dict[str, Any]:
        """
        Analyze image content using OpenAI Vision API
        Returns detailed description and suggested placement context
        """
        try:
            base64_image = self.encode_image_to_base64(image_path)
            if not base64_image:
                return self._create_fallback_analysis(image_url, page, context)
            
            prompt = f"""請分析這張圖片並提供以下信息：

1. 圖片類型（圖表、流程圖、示意圖、照片等）
2. 主要內容描述（用中文，適合學生理解）
3. 關鍵概念和術語
4. 建議在哪種文本內容附近插入此圖片（基於圖片內容推測）

上下文信息：
- 頁碼：第{page}頁
- 周邊文字：{context[:200] if context else '無'}

請以JSON格式回應：
{{
    "image_type": "圖表/流程圖/示意圖/照片",
    "description": "詳細的中文描述",
    "key_concepts": ["概念1", "概念2", "概念3"],
    "suggested_placement_context": ["相關主題1", "相關主題2"],
    "educational_value": "這張圖片的教學價值說明"
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o",  # Use vision model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            # Parse JSON response
            content = response.choices[0].message.content
            try:
                analysis = json.loads(content)
                analysis.update({
                    "image_url": image_url,
                    "page": page,
                    "context": context,
                    "analysis_success": True
                })
                return analysis
            except json.JSONDecodeError:
                # If JSON parsing fails, create structured response from text
                return self._parse_text_response(content, image_url, page, context)
                
        except Exception as e:
            print(f"Vision analysis failed for {image_path}: {e}")
            return self._create_fallback_analysis(image_url, page, context)
    
    def _create_fallback_analysis(self, image_url: str, page: int, context: str) -> Dict[str, Any]:
        """Create fallback analysis when vision API fails"""
        return {
            "image_type": "圖表",
            "description": f"第{page}頁的圖表或示意圖",
            "key_concepts": [],
            "suggested_placement_context": ["相關概念", "圖表說明"],
            "educational_value": "提供視覺化學習支援",
            "image_url": image_url,
            "page": page,
            "context": context,
            "analysis_success": False
        }
    
    def _parse_text_response(self, content: str, image_url: str, page: int, context: str) -> Dict[str, Any]:
        """Parse non-JSON text response from Vision API"""
        return {
            "image_type": "圖表",
            "description": content[:200] if content else f"第{page}頁的圖表",
            "key_concepts": [],
            "suggested_placement_context": ["相關內容"],
            "educational_value": "提供學習參考",
            "image_url": image_url,
            "page": page,
            "context": context,
            "analysis_success": True,
            "raw_response": content
        }

    def determine_image_placements(self, text_content: str, image_analyses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Determine the best placement positions for images within the text content
        """
        if not image_analyses:
            return []
        
        try:
            # Create summary of available images
            images_summary = []
            for i, analysis in enumerate(image_analyses):
                summary = {
                    "index": i,
                    "type": analysis.get("image_type", "圖表"),
                    "description": analysis.get("description", "")[:100],
                    "key_concepts": analysis.get("key_concepts", []),
                    "page": analysis.get("page", 0),
                    "url": analysis.get("image_url", "")
                }
                images_summary.append(summary)
            
            prompt = f"""我有以下圖片需要插入到文本中，請幫我決定每張圖片的最佳插入位置：

文本內容：
{text_content[:3000]}...

可用圖片：
{json.dumps(images_summary, ensure_ascii=False, indent=2)}

請分析文本內容，為每張圖片找到最適合的插入位置。考慮：
1. 圖片內容與文本段落的相關性
2. 圖片的教學價值
3. 文本流暢性
4. 學習體驗

請以JSON格式回應：
{{
    "placements": [
        {{
            "image_index": 0,
            "insert_after_paragraph": 2,
            "insert_reason": "此圖表說明了前面提到的概念",
            "caption": "圖1：概念示意圖 (第X頁)"
        }}
    ]
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
                return result.get("placements", [])
            except json.JSONDecodeError:
                print(f"Failed to parse placement response: {content}")
                return self._create_default_placements(image_analyses)
                
        except Exception as e:
            print(f"Placement determination failed: {e}")
            return self._create_default_placements(image_analyses)
    
    def _create_default_placements(self, image_analyses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create default placements when AI analysis fails"""
        placements = []
        for i, analysis in enumerate(image_analyses):
            placement = {
                "image_index": i,
                "insert_after_paragraph": i + 1,  # Distribute evenly
                "insert_reason": "基於頁碼順序插入",
                "caption": f"圖{i+1}：{analysis.get('description', '圖表')} (第{analysis.get('page', '?')}頁)"
            }
            placements.append(placement)
        return placements
