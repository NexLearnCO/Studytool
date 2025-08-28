# PURPOSE
將多個章節 Markdown 片段組稿為「一份完整筆記」，統一標題層級、目錄、腳註與版面；輸出純 Markdown。

# VARIABLES
- title: {{title}}                        # 筆記標題
- exam_system: {{exam_system}}
- subject: {{subject}}
- language: {{language}}
- sections_markdown: {{sections_markdown}}  # 陣列：[{id,title,order,markdown}]
- tags: {{tags}}                          # 例：["BIO.1.3","SK.EXPLAIN","D2"]

# ASSEMBLY RULES
- 文件結構：
  1) YAML frontmatter（title, exam_system, subject, tags, generated_at）
  2) H1 主標題（同 title）
  3) 目錄（以文件內標題自動生成的層級）
  4) 各章節依 order 排列，章節標題從 H2 開始；片段內若已用 H3 起算，保持相對層級。
  5) 文末附「來源與版權」區塊：彙整各片段內的來源註記（doc_id/page）。
- 統一格式：
  - 行內/區塊 LaTeX 保留
  - 表格維持 Markdown 格式
  - 內嵌圖片 `![alt](url)` 原樣保留
- 嚴禁新增未知來源內容；若章節為補充，於該小節標註「（補充）」。

# OUTPUT
- 僅輸出 **完整 Markdown**（含 YAML frontmatter），無多餘說明。

# PROMPT
請將以下章節組裝為完整筆記（輸出純 Markdown）：
[meta] title={{title}} | exam={{exam_system}} | subject={{subject}} | lang={{language}} | tags={{tags}}

[sections]
{{sections_markdown}}
