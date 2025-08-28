# NexLearn Studytool × Course Alignment Plan

本文件整理 AI Studio 優先、Notes 庫優化、以及閃卡集/錯題集後續的落地方案，並對齊資料表與 API 設計，作為後續開發與溝通基準。

## 1. 原則
- 功能先行：可讀、可存、可回看，逐步提升品質
- 保守預設：低風險整理重排，擴充需標記
- 一套語言：生成內容附來源/標籤，支援後續 RAG/分析

## 2. 生成模式（Modal）
- 必填：exam_system / subject / language / mode(Hybrid|Blueprint|Outline)
- 選填：topic / detail_level(brief|medium|detailed) / expansion(0..3)
- 多檔上傳：PDF/DOCX/PPTX/YouTube/URL → documents/chunks/assets

## 3. 模式定義
- Outline-only：忠實轉錄，僅清理排版
- Blueprint-only：按藍本輸出，不引用來源
- Hybrid（預設）：藍本骨架 × 來源對齊 × 受 expansion 控制補充

## 4. 擴充程度（臆想控制）
- 0：僅整理重排
- 1：可補缺漏，必須有來源 chunk
- 2：可加背景，標記「補充」
- 3：可擴展說明，但限同一課綱/同科

## 5. 資料/事件模型（新增表）
- artifacts: flashcards/quiz/markmap 存檔
- documents/chunks/assets/notes_sources: 多來源與抽取
- blueprints: 科目藍本規格
- note_chunks: 筆記切片（RAG/搜尋）
- events: 行為追蹤（已存在）

## 6. 結果頁（AI Studio）
- 路由：/ai-notes/result/[id]?tab=note|mindmap|flashcards|quiz
- 分頁保存為 artifacts，右側工具卡顯示已保存項並可跳轉
- Mindmap：MarkmapViewer，提供保存成 artifact
- Flashcards：生成→審閱→保存（支持數量、難度/類型）
- Quiz：生成→作答/評分→保存（支持數量、解析）

## 7. Prompt 模組化
- tasks/：outline 抽取、section writer、mindmap、flashcards、quiz 等
- blueprints/subject.yaml：科目藍本章節與樣式
- exams/{exam}.yaml：考局補丁（術語/偏好）
- 參數化：detail_level / expansion / language / subject / exam

## 8. 近期里程碑（AI Studio-first）
- [x] 語言對齊：生成語言跟隨 note
- [x] 思維導圖 UX 優化：保持視口、移除點擊跳動
- [x] Artifacts 自動載入：返回 AI Studio 自動顯示已保存內容
- [ ] AI Studio 生成 Modal 完整化（模式/詳細度/擴充/多檔）
- [ ] Ingest API：/ingest/pdf、/documents/:id/extract、/documents/:id/chunks
- [ ] Prompts 目錄初始化與核心模板

## 9. 後續（Notes 庫、閃卡集/錯題集）
- Notes 列表：資料夾、標籤、搜尋/篩選、狀態
- Note 頁右側工具卡：顯示 artifacts 快速開啟
- 閃卡集：Deck 管理、FSRS 複習、進度追蹤
- 錯題集：由 quiz 結果生成，管理與練習流程

## 10. 安全與運維
- CORS 限定自家域名
- 基礎限流（Flask-Limiter）
- Sentry 前後端錯誤上報

此文檔將隨需求與實作持續更新，並與 DATABASE_SCHEMA、API_REFERENCE、ROADMAP 保持一致。
