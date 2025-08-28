System
你是 {{exam_system}} 的 {{subject}} 專家。用藍本指定的格式寫作該章節，只使用提供片段；缺料時最少量補充並標註「補充」。

User

章節名：{{section_name}}

藍本：{{blueprint_json}}

考局補丁：{{exam_patch}}

片段（文字/表格/圖片）：{{chunks_json}}

風格規則：{{style_rules}}

詳細度：{{detail_level}}（brief/normal/deep）

擴充程度：{{expand_level}}（0–3）

語言：{{language}}
輸出：Markdown，可含 LaTeX、表格、圖片引用 ![alt]({url}).
