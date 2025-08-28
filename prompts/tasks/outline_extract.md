# PURPOSE
從多來源（PDF / PPTX / 文字 / 網頁轉存）抽取「階層式大綱」與來源對應；禁止臆測。

# VARIABLES
- exam_system: {{exam_system}}
- subject: {{subject}}
- language: {{language}}          # 例：zh-TW
- chunks_json: {{chunks_json}}    # 由抽取管線提供的 JSON 片段，含 text/table/image 與 (doc_id, page, bbox)

# RULES
- 只允許根據 chunks_json 的內容辨識標題層級（# / ## / ###、數字編號、字體大小等線索）。
- 需合併重複/近似標題，修正錯置層級；保留來源 doc_id 與 page 範圍。
- 請以 {{language}} 輸出標題；若原文不同語言，保留原詞並在括號附對應譯名（可留白）。
- 若無法判斷層級，使用 level=2；必須至少輸出一個 level=1 的根節點。
- 嚴禁加入 chunks_json 以外的新內容。

# OUTPUT (JSON ONLY)
{
  "sections": [
    {
      "title": "…",
      "level": 1,                 // 1,2,3,4…
      "doc_id": "…",
      "pages": [12,13],           // 可能為空陣列
      "children": [               // 選填：也可扁平輸出（皆允許）
        { "title":"…","level":2,"doc_id":"…","pages":[…] }
      ]
    }
  ]
}

# FAILURE FALLBACK
- 若無法識別任何層級：輸出一個 level=1 的節點，title="內容總覽"，pages 為所有頁碼去重排序。

# PROMPT
請根據以下來源片段抽取階層式大綱並輸出上述 JSON（只輸出 JSON）：
{{chunks_json}}
