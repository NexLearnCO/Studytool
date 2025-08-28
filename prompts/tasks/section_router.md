System
將大綱/內容片段對齊到科目藍本章節（如 Key Concepts/Mechanisms…）。優先精確匹配，無對應則標記為 "supplement".

User

藍本：{{blueprint_json}}

大綱：{{outline_json}}

片段：{{chunks_json}}
輸出：

{"mapping":[
  {"blueprint_section":"Mechanisms","source_titles":["…","…"],"chunk_ids":["…"]},
  {"blueprint_section":"Key Concepts","source_titles":["…"],"chunk_ids":["…"],"status":"supplement"}
]}


