# Prompts Directory Plan

本文件定義 prompts 目錄結構與模板清單，採參數化 + 差異補丁，避免模板爆炸。

## 目錄結構
```
prompts/
  tasks/
    outline_extract.md
    section_writer.md
    mindmap_convert.md
    flashcards_generate.md
    quiz_generate.md
    cleanup_normalize.md
    classify_topic_skill.md
    explain_solution.md
    summarize_preview.md
  blueprints/
    CHEM.yaml
    PHYS.yaml
    BIO.yaml
    MATH.yaml
  exams/
    HKDSE.yaml
    IB.yaml
  questions/
    mcq.md
    short_answer.md
    cloze.md
```

## 參數（統一）
- language: zh-tw|en
- detail_level: brief|medium|detailed
- expansion: 0..3
- exam_system: HKDSE|IB|SAT
- subject: BIO|CHEM|PHYS|MATH
- topic: string

## 任務模板說明（摘錄）
- outline_extract: 從 chunks 建立大綱（僅整理）
- section_writer: 章節寫作器（吃藍本章節 + chunks；受 expansion 控制）
- mindmap_convert: Markdown → mindmap-friendly 結構
- flashcards_generate: 高品質閃卡（數量、難度、類型）
- quiz_generate: 標準 MCQ（數量、解析、合理干擾項）

後續將逐步補齊模板內容與示例，並在 API_REFERENCE 中標註對應任務。
