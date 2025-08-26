# NexLearn.ai - AI 智慧學習平台

NexLearn.ai 是一個全面的 AI 驅動學習平台，集成了筆記生成、筆記管理、智能複習工具，為學習者提供完整的數位學習解決方案。

## ✨ 核心功能

### 📚 AI 筆記生成系統
- 🎥 **YouTube 影片轉筆記**: 自動提取影片字幕並生成結構化筆記
- 📄 **PDF 文件轉筆記**: 解析 PDF 內容並生成摘要筆記  
- 📝 **文字轉筆記**: 將任何文字內容轉換為組織良好的筆記
- 🌐 **網頁轉筆記**: 支援多種網路資源內容提取
- 🧠 **互動式思維導圖**: 使用 Markmap 自動生成可視化思維導圖
- ✏️ **BlockNote 編輯器**: 類似 Notion 的現代化富文本編輯體驗

### 🗂️ 筆記管理系統 (全新!)
- 📝 **筆記庫**: 完整的 CRUD 操作，搜尋、篩選、分類
- 🏷️ **標籤系統**: 靈活的標籤管理和內容組織
- 🔍 **智能搜尋**: 全文搜尋和語義匹配
- 💾 **自動保存**: 實時編輯和自動備份
- 📱 **多租戶支援**: 組織、課程、資料夾層級管理

### 🎯 智能學習工具
- 🃏 **AI 記憶卡片**: 從筆記內容自動生成學習卡片，支援編輯和自定義
- 📊 **智能測驗系統**: 生成多選題測驗，即時反饋和評分，支援字母和文本答案匹配
- 📈 **學習分析**: 詳細的學習進度和表現分析
- 🎯 **事件追蹤**: 用戶行為和學習模式分析

### 📱 現代化用戶界面
- 🎨 **美觀的 UI/UX**: 使用 Tailwind CSS 和 Radix UI 組件
- 📱 **響應式設計**: 完美支援桌面和移動設備
- ⚡ **快速載入**: Next.js 15 提供的極速用戶體驗
- 🔧 **管理員介面**: 數據瀏覽和系統管理工具

## 🛠 技術架構

### 前端 (Next.js 15)
- **框架**: Next.js 15.2.4 with React 19 & App Router
- **UI 組件**: Radix UI + Tailwind CSS 4.1.9
- **編輯器**: BlockNote (富文本編輯)
- **圖表**: Markmap (思維導圖)
- **狀態管理**: React Hooks + Context API
- **構建工具**: TypeScript 5.x
- **部署**: Vercel Ready

### 後端 (Flask + Python)
- **框架**: Flask 3.x with Blueprints
- **ORM**: SQLAlchemy 2.x
- **數據庫**: SQLite (開發) / PostgreSQL (生產)
- **AI 服務**: OpenAI GPT Models
- **數據處理**: 
  - YouTube: youtube-transcript-api + yt-dlp
  - PDF: PyPDF2
  - 音頻: Whisper API
- **API 設計**: RESTful APIs with CORS support

## 🚀 快速開始

### 系統要求
- **Node.js** 18+ 
- **Python** 3.8+
- **OpenAI API Key**
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

### 安裝步驟

#### 1. 克隆項目
```bash
git clone https://github.com/NexLearnCO/Studytool.git
cd Studytool
```

#### 2. 後端設置
```bash
cd backend
pip install -r requirements.txt

# 創建環境變數文件
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "FLASK_PORT=5000" >> .env
echo "FLASK_DEBUG=True" >> .env
```

#### 3. 前端設置
```bash
cd frontend
npm install
# 或使用 yarn
yarn install
```

#### 4. 啟動應用

**方法一：同時啟動前後端 (推薦)**
```bash
# 在項目根目錄
npm run dev
```

**方法二：分別啟動**

後端服務:
```bash
cd backend
python app.py
```

前端應用:
```bash
cd frontend
npm run dev
```

#### 5. 訪問應用
- **前端**: http://localhost:3000
- **後端 API**: http://localhost:5000
- **管理員介面**: http://localhost:3000/admin/data
- **筆記管理**: http://localhost:3000/notes

## 📖 使用指南

### 🎥 AI 筆記生成
1. **從主導航進入「AI 筆記」頁面**
2. **選擇內容來源**:
   - **YouTube**: 貼上影片網址，自動提取字幕
   - **PDF 文件**: 上傳 PDF 文件 (最大 10MB)
   - **文字內容**: 直接輸入或貼上文字
3. **設定生成參數**: 選擇詳細程度和輸出格式
4. **查看結果**: 在結果頁面編輯筆記、查看思維導圖、生成卡片和測驗

### 🃏 記憶卡片學習
1. **在筆記結果頁面點擊「記憶卡片」標籤**
2. **生成卡片**: AI 自動從筆記內容生成學習卡片
3. **編輯自定義**: 修改問題、答案、提示和難度
4. **開始學習**: 使用間隔重複算法進行高效複習

### 📊 智能測驗
1. **在筆記結果頁面點擊「測驗」標籤**
2. **配置測驗**: 設定題目數量和難度
3. **生成題目**: AI 生成多選題測驗
4. **開始測驗**: 即時反饋和詳細解析

### 🤖 AI 導師
1. **點擊主導航的「AI 導師」**
2. **提出問題**: 關於學習內容或方法的任何問題
3. **獲得指導**: 個人化的學習建議和解答

## 🔌 API 文檔

### 筆記生成 API
```
POST /api/generate-notes          # 統一筆記生成 (支援多種來源)
POST /api/youtube-to-notes        # YouTube 轉筆記
POST /api/pdf-to-notes           # PDF 轉筆記
POST /api/text-to-notes          # 文字轉筆記
```

### 筆記管理 API (新!)
```
GET    /api/v1/notes             # 獲取筆記列表
POST   /api/v1/notes             # 創建新筆記
GET    /api/v1/notes/{id}        # 獲取單個筆記
PATCH  /api/v1/notes/{id}        # 更新筆記
DELETE /api/v1/notes/{id}        # 刪除筆記 (軟刪除)
```

### 學習工具 API
```
POST /api/generate-flashcards-from-notes  # 從筆記生成閃卡
POST /api/generate-quiz-from-notes        # 從筆記生成測驗
```

### 事件追蹤 API (新!)
```
POST /api/v1/events              # 記錄用戶事件
GET  /api/v1/events              # 獲取事件列表 (管理員)
```

詳細 API 文檔請參考 [API_REFERENCE.md](./docs/API_REFERENCE.md)

## 🎯 主要頁面

| 頁面 | 路由 | 功能 |
|------|------|------|
| 儀表板 | `/` | 學習概覽、統計數據、快速操作 |
| AI 筆記生成 | `/ai-notes` | 筆記生成工具 |
| 筆記結果 | `/ai-notes/result/[id]` | 筆記編輯、思維導圖、卡片、測驗 |
| **筆記管理** | `/notes` | **筆記列表、搜尋、篩選** |
| **筆記編輯** | `/notes/[id]` | **單個筆記編輯、Markmap 預覽** |
| **管理員介面** | `/admin/data` | **數據瀏覽、筆記和事件管理** |
| AI 導師 | `/ai-tutor` | 智能問答助手 |
| 學習分析 | `/analytics` | 詳細學習數據分析 |
| 練習工具 | `/practice` | 各種練習模式 |
| 記憶卡片 | `/flashcards` | 卡片管理和學習 |

## 🔧 配置選項

### 環境變數 (.env)
```bash
# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # 或 gpt-4
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7

# Flask 配置  
FLASK_PORT=5000
FLASK_DEBUG=True
FLASK_ENV=development

# 其他服務 (可選)
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

### 前端配置 (.env.local)
```bash
# API 端點
NEXT_PUBLIC_API_BASE=http://localhost:5000
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000

# 多租戶配置 (可選)
NEXT_PUBLIC_ORG_ID=demo-org
NEXT_PUBLIC_COURSE_ID=demo-course

# OpenAI 配置 (客戶端使用，如需要)
# NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 部署指南

### Vercel 部署 (推薦)
1. Fork 此倉庫到你的 GitHub
2. 在 Vercel 中導入項目
3. 設定環境變數
4. 自動部署完成

### Docker 部署
```bash
# 構建鏡像
docker build -t nexlearn-app .

# 運行容器
docker run -p 3000:3000 -p 5000:5000 nexlearn-app
```

## 🛣 發展路線圖

### 近期計劃 (Q1 2025)
- [x] 🗄️ **數據持久化**: SQLite/PostgreSQL 整合 ✅
- [x] 📚 **筆記管理系統**: 筆記庫、標籤、搜尋、CRUD ✅
- [x] 🎯 **事件追蹤系統**: 用戶行為分析基礎 ✅
- [x] 🔧 **管理員介面**: 數據瀏覽和管理工具 ✅
- [ ] 👥 **用戶認證系統**: 登入、註冊、個人檔案
- [ ] 🔄 **同步功能**: 跨設備數據同步

### 中期計劃 (Q2-Q3 2025)
- [ ] 📱 **移動端應用**: React Native 版本
- [ ] 🌍 **多語言支援**: 英文、日文、韓文
- [ ] 🎥 **更多平台支援**: Bilibili、Khan Academy
- [ ] 🤝 **協作功能**: 共享筆記、群組學習

### 長期願景 (Q4 2025+)
- [ ] 🎓 **學校整合**: LMS 系統整合
- [ ] 🧠 **高級 AI**: 個人化學習路徑
- [ ] 📊 **深度分析**: 學習行為洞察
- [ ] 🏆 **遊戲化**: 成就系統、排行榜

## 🤝 貢獻指南

我們歡迎社群貢獻！請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解詳細的貢獻流程。

### 開發流程
1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

本項目採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 📞 聯繫我們

- **官網**: https://nexlearn.ai
- **GitHub**: https://github.com/NexLearnCO/Studytool
- **Email**: support@nexlearn.ai
- **Discord**: [NexLearn 社群](https://discord.gg/nexlearn)

---

<div align="center">

**🌟 如果這個項目對你有幫助，請給我們一個 Star！**

Made with ❤️ by [NexLearn Team](https://nexlearn.ai)

</div>