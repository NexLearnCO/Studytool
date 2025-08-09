# NexLearn AI Notes Generator

一個功能強大的AI筆記生成工具，可以將YouTube影片、PDF文件和文字內容轉換為結構化的學習筆記。

## 功能特點

- 🎥 **YouTube影片轉筆記**: 自動提取影片字幕並生成結構化筆記
- 📄 **PDF文件轉筆記**: 解析PDF內容並生成摘要筆記
- 📝 **文字轉筆記**: 將任何文字內容轉換為組織良好的筆記
- 🧠 **思維導圖**: 自動生成互動式思維導圖
- 🎯 **記憶卡片**: 基於筆記內容生成學習卡片
- 📊 **智能測驗**: 自動生成多選題測驗

## 系統要求

- Python 3.8+
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)
- OpenAI API Key

## 安裝步驟

### 1. 安裝Python依賴

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置環境變數

在 `backend` 目錄下創建 `.env` 文件：

```
OPENAI_API_KEY=your_openai_api_key_here
FLASK_PORT=5000
FLASK_DEBUG=True
```

### 3. 啟動後端服務

```bash
cd backend
python app.py
```

### 4. 打開前端界面

在瀏覽器中打開 `frontend/index.html`

## 使用方法

1. **YouTube轉筆記**:
   - 選擇YouTube標籤
   - 貼上YouTube影片網址
   - 選擇詳細程度
   - 點擊「生成筆記」

2. **PDF轉筆記**:
   - 選擇PDF文件標籤
   - 上傳PDF文件 (最大10MB)
   - 選擇詳細程度
   - 點擊「生成筆記」

3. **文字轉筆記**:
   - 選擇文字輸入標籤
   - 貼上或輸入文字內容
   - 選擇詳細程度
   - 點擊「生成筆記」

## API端點

- `GET /` - API信息
- `POST /api/youtube-to-notes` - YouTube轉筆記
- `POST /api/pdf-to-notes` - PDF轉筆記
- `POST /api/text-to-notes` - 文字轉筆記
- `POST /api/generate-flashcards` - 生成記憶卡片
- `POST /api/generate-quiz` - 生成測驗

## 技術棧

### 後端
- **Flask**: Python Web框架
- **OpenAI API**: AI文本處理
- **youtube-transcript-api**: YouTube字幕提取
- **PyPDF2**: PDF文本提取

### 前端
- **HTML5/CSS3**: 用戶界面
- **JavaScript (ES6+)**: 前端邏輯
- **D3.js + Markmap**: 思維導圖渲染
- **Marked.js**: Markdown渲染

## 開發計劃

- [ ] 支援更多影片平台
- [ ] 添加更多文件格式支援
- [ ] 用戶認證和筆記管理
- [ ] 批量處理功能
- [ ] 移動端優化

## 許可證

版權所有 © 2025 NexLearn. 保留所有權利。

## 聯繫方式

如有問題或建議，請聯繫開發團隊。