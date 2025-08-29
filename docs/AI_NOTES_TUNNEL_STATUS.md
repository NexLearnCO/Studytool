# AI 筆記生成（Tunnel）現狀與下一步（以 PyMuPDF 為主）

> 目標：在不改動現有代碼前提下，讓團隊明白目前可用程度、已知風險，以及啟用 PyMuPDF 圖文抽取 的最短路徑。之後再逐步接 MinerU / 資產（圖片）落地 / Router 精準化。

---

## 1) 目前可用狀態

### 1.1 後端流程（Tunnel 三種模式）

- outline-only：outline_extract  outline_refine  notes_assemble（ 可用）
- blueprint-only：section_writer（帶 LaTeX 標準化 + citation guard） notes_assemble（ 可用）
- hybrid：outline_extract  section_router  逐章 section_writer（每章含 LaTeX + tags_classify） notes_assemble（彙總 tags；尾段再做 citation guard）（ 可用）

### 1.2 抽取層（文件  chunks）

- PDF：優先用 PyMuPDF 產生分頁 chunks（文字 / 圖片 / 表格，含 doc_id / page / bbox / url(佔位)）。
  若環境沒有 PyMuPDF，會自動 fallback 純文字抽取（流程不中斷，但無圖片/表格高保真）。
- 圖片/表格：
  - 若有 image chunk，會跑 image_captions 產簡短圖說（附在章節末）。
  - 若有 table chunk，組稿時會加「附錄：表格」（	able_to_markdown）。

### 1.3 MinerU（可選）

- 已有 ingest 代理（上傳 / 抽取 / 查詢），可用 PREFER_MINERU / MINERU_API_BASE / MINERU_API_KEY 切換。
  未設置時為 stub（不影響既有流程）。

### 1.4 前端

- Modal 支援 **Legacy / Tunnel** 切換；Tunnel 路徑做了必填校驗。
- 新增 **autorun 勾選**（自動生成閃卡 / 測驗，對應 payload options.generate_*）。
  目前實作：筆記建立成功後，前端立即呼叫後端生成並保存 artifacts（含事件追蹤）。

---

## 2) 已知風險與欠缺（不改代碼前的提醒）

1) PyMuPDF 安裝：你的主機是 **Python 3.13**，pip 安裝 PyMuPDF 需要 VS Build Tools；**最穩是用 Python 3.11 venv** 安裝。
   現代碼已做「安全載入＋fallback」，不會因 itz 失敗而崩。

2) 圖片 URL 未落地：目前 image chunk 的 url 還是佔位（如 inline:image:...），**筆記內看不到真圖片**。
   要顯示圖，需補「資產落地」與 URL（本機 static/ 或 S3/CDN）。Writer 已支持 ![caption](url)，只要回填真 URL 即可顯示。

3) Router 輸出 chunk_ids：若 Router 沒給 chunk_ids，會用**關鍵詞回退選塊**（已降低全量餵入）。
   下一步要把 ile_chunks 的 doc_id / page 餵進 Router 的 prompt，要求輸出 **精準的 chunk_ids**，Writer 只吃命中的 chunk。

---

## 3) 決策建議（本階段預設）

- 抽取優先順序：PyMuPDF （缺失時）純文字 （準備好後）MinerU
- 圖片落地：先走 **Flask static/assets**（本機可直接用），**兩週後**再切 S3/R2 + CDN
- autorun 位置：先維持在前端（已可用），**之後**再搬到後端 /api/generate-notes 完成段（避免前端等待）

> 傳統穩法：先用本機靜態資源把功能跑通，再上雲。邏輯簡單、易維護。

---

## 4) 最短落地路徑（以 PyMuPDF 為主）

> 不改既有程式邏輯，只定下環境與路徑，等你說「開始動」再做代碼變更。

### 4.1 建立 Python 3.11 venv（Windows PowerShell）

`powershell
# 進入 backend
cd backend

# 建 venv
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -U pip
pip install pymupdf pillow

# 啟動後端
python app.py
`

### 4.2 prompts 檔案放位

把四個骨幹 prompt 放到：ackend/prompts/tasks/

`
outline_extract.md
section_router.md
section_writer.md
notes_assemble.md
`

> 這樣就不會再出「No such file or directory」的錯。

### 4.3 圖片顯示（先不寫代碼，先定規格）

- 落地路徑：ackend/static/assets/<doc_id>/<asset_id>.png
- 對外 URL：http://localhost:5000/static/assets/<doc_id>/<asset_id>.png
- chunk 返還（之後代碼改這樣回填）：

`json
{
   type: image,
  doc_id: doc_123,
  page: 12,
  bbox: [0,0,0,0],
  asset_id: 01J...,
  url: http://localhost:5000/static/assets/doc_123/01J....png,
  width: 1024,
  height: 768,
  caption: （選填）
}
`

- 筆記內呈現：Writer 會輸出 ![caption](url)，前端 Markdown / BlockNote 立即可見。

---

## 5) 之後（下一個衝刺）要做的三件事

> 等你一句話「開做」，再補上代碼。

1) 資產落地 + URL 暴露
   - 抽圖時把 Pixmap 存成 PNG/WEBP（限制最大邊長、壓縮大小）
   - 計算 sha256（去重）
   - 回 chunk 時寫真 URL
   - （可選）在 /admin/data 增加 **Assets** 表檢視

2) Router 精準化
   - Prompt 餵 ile_chunks 的 id / doc_id / page
   - 產出 chunk_ids: string[]（章節素材來源）
   - Writer 僅根據 chunk_ids 匹配文字/圖片/表格，避免喂全量

3) autorun 後端化（可延後）
   - /api/generate-notes 完成後根據 options.generate_* 在後端直接生成並保存 artifacts
   - 前端只負責顯示結果，體驗更穩

---

## 6) MinerU 的位置（先不動代碼，只做選項）

- 不建議把 MinerU 源碼直接塞進專案（依賴複雜、升級困難）
- 建議兩種方式擇一：
  1) 官方 API（最快接入；設 PREFER_MINERU=true + MINERU_API_*）
  2) 自託管服務（docker-compose 跑起 mineru-api；你的後端以 HTTP 呼叫）

> 等 PyMuPDF 路徑穩定、你需要更強抽圖/版面/OCR 時再切 MinerU。兩者可共存：MinerU  首選，PyMuPDF  fallback。

---

## 7) 驗收清單（今天就能檢查）

- [ ] 三條 Tunnel 模式都能回筆記（）
- [ ] 沒裝 PyMuPDF 時，不崩潰、能回純文字（）
- [ ] 裝好 3.11 venv + PyMuPDF 後，後端啟動能 log 出「PyMuPDF available」（待檢）
- [ ] prompts 四檔到位，後端不再報「檔案缺失」（待檢）
- [ ] 筆記內可看到圖片圖說文字（目前已可）
- [ ] 圖片本體：待資產落地（下一步）
- [ ] autorun 在前端開關生效（）

---

## 8) 常見問題（Q&A）

**Q1：要不要放棄 PyMuPDF？**

不用。用 3.11 venv 裝起來最穩。沒有它也能跑，但看不到圖表的真圖。

**Q2：MinerU 能不能整搬？**

不建議嵌進專案。用 API 或自託管服務（FastAPI / docker-compose）最穩，邊界清晰、易升級。

**Q3：為什麼先用本機 static/ 而不是直接 S3？**

傳統穩法：先把功能跑通，待路徑穩定後再切 S3/R2 + CDN，前端與 LLM 都不需改（只改 URL 生成）。

---

### 一句話總結

> 先把 PyMuPDF 跑起來（3.11 venv）＋把圖片落地成 URL，你的 Tunnel 筆記就能真正「圖文並茂」。接著再把 Router 精準化、資產上雲，最後才輪到 MinerU 進場強化抽取。這是一條穩、清楚、可擴的路。
