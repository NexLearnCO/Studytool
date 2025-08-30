# PURPOSE
為抽取到的圖片生成精確的中文描述和標題，基於圖片在文檔中的上下文。

# VARIABLES
- images_json: {{images_json}}   # [{"image_id":"…","url":"…","doc_id":"…","page":5,"width":800,"height":600,"context":"圖片周邊文字..."}]

# RULES
1. 優先使用'context'字段中的周邊文字信息來理解圖片內容
2. 基於圖片在文檔中的位置和頁碼生成描述
3. 使用中文描述，避免英文術語
4. 包含頁碼信息便於引用
5. 如果context有意義的信息，根據context推測圖片類型（圖表、流程圖、示意圖等）
6. 如果無法確定圖片內容，使用通用但有意義的描述
7. 避免過於技術性的詞彙，使用學生易懂的語言

# OUTPUT FORMAT (JSON ONLY)
```json
[
  {
    "image_id": "file:example.pdf-p1-img1",
    "caption": "圖表：燃料電池的基本結構圖 (第1頁)",
    "alt": "燃料電池結構示意圖"
  }
]
```

# PROMPT
請為以下圖片生成合適的中文描述。特別注意：
- 仔細閱讀每個圖片的'context'字段，這包含了圖片周邊的文字信息
- 根據context內容推測圖片可能的類型和用途
- 生成的caption應該反映圖片在學習材料中的作用

輸入圖片信息：
{{images_json}}

請生成符合上述JSON格式的回應，確保每個圖片都有基於上下文的有意義中文描述。
