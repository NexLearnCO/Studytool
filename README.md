# NexLearn.ai - AI 智慧學習平台

NexLearn.ai 是一個全面的 AI 驅動學習平台，集成了筆記生成、智能複習、分析工具和個人化 AI 導師，為學習者提供完整的數位學習解決方案。

## ✨ 核心功能

### 📚 AI 筆記生成系統
- 🎥 **YouTube 影片轉筆記**: 自動提取影片字幕並生成結構化筆記
- 📄 **PDF 文件轉筆記**: 解析 PDF 內容並生成摘要筆記  
- 📝 **文字轉筆記**: 將任何文字內容轉換為組織良好的筆記
- 🧠 **互動式思維導圖**: 使用 Markmap 自動生成可視化思維導圖
- ✏️ **BlockNote 編輯器**: 類似 Notion 的現代化富文本編輯體驗

### 🎯 智能學習工具
- 🃏 **AI 記憶卡片**: 從筆記內容自動生成學習卡片，支援編輯和自定義
- 📊 **智能測驗系統**: 生成多選題測驗，即時反饋和評分
- 🔄 **間隔重複學習**: 整合 FSRS 算法的科學記憶系統
- 📈 **學習分析**: 詳細的學習進度和表現分析

### 🤖 AI 導師助手
- 💬 **個人化 AI 導師**: 24/7 智能問答和學習指導
- 🎓 **適應性學習**: 根據個人學習風格調整內容
- 📊 **學習洞察**: 提供學習建議和改進方向

### 📱 現代化用戶界面
- 🎨 **美觀的 UI/UX**: 使用 Tailwind CSS 和 Radix UI 組件
- 📱 **響應式設計**: 完美支援桌面和移動設備
- 🌙 **深色模式**: 護眼的深色主題支援
- ⚡ **快速載入**: Next.js 14 提供的極速用戶體驗

## 🛠 技術架構

### 前端 (Next.js 15)
- **框架**: Next.js 15.2.4 with React 19
- **UI 組件**: Radix UI + Tailwind CSS 4.1.9
- **編輯器**: BlockNote (富文本編輯)
- **圖表**: Recharts + Markmap (思維導圖)
- **狀態管理**: React Hooks + Context API
- **部署**: Vercel Ready

### 後端 (Flask + Python)
- **框架**: Flask 2.3.2
- **AI 服務**: OpenAI GPT Models
- **數據處理**: 
  - YouTube: youtube-transcript-api + yt-dlp
  - PDF: PyPDF2
  - 音頻: Pydub
- **數據庫**: SQLAlchemy (支援多種數據庫)

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

**後端服務:**
```bash
cd backend
python app.py
```

**前端應用:**
```bash
cd frontend
npm run dev
# 或
yarn dev
```

#### 5. 訪問應用
- 前端: http://localhost:3000
- 後端 API: http://localhost:5000

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
POST /api/generate-notes
POST /api/youtube-to-notes  
POST /api/pdf-to-notes
POST /api/text-to-notes
```

### 學習工具 API
```
POST /api/generate-flashcards-from-notes
POST /api/generate-quiz-from-notes
POST /api/ai-tutor-chat
```

### 用戶數據 API
```
GET /api/user-progress
POST /api/save-study-session
GET /api/analytics-data
```

## 🎯 主要頁面

| 頁面 | 路由 | 功能 |
|------|------|------|
| 儀表板 | `/` | 學習概覽、統計數據、快速操作 |
| AI 筆記 | `/ai-notes` | 筆記生成工具 |
| 筆記結果 | `/ai-notes/result/[id]` | 筆記編輯、思維導圖、卡片、測驗 |
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
NEXT_PUBLIC_API_URL=http://localhost:5000

# 功能開關
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_TUTOR=true
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
- [ ] 🗄️ **用戶數據持久化**: Supabase/PostgreSQL 整合
- [ ] 👥 **用戶認證系統**: 登入、註冊、個人檔案
- [ ] 📚 **筆記管理系統**: 筆記庫、標籤、搜尋
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