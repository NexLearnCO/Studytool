# NexLearn AI Notes - Project Structure

## 目錄結構

```
nexlearn-ai-notes/
├── backend/                    # 後端 Flask 應用
│   ├── app.py                 # 主應用文件 - Flask應用和路由註冊
│   ├── config.py              # 配置文件 - 環境變數和設定
│   ├── models.py              # 數據模型 - SQLAlchemy ORM 模型
│   ├── requirements.txt       # Python依賴列表
│   ├── nexlearn.db           # SQLite 數據庫文件
│   ├── .env                   # 環境變數文件 (需要創建)
│   ├── api/                   # API Blueprint 模塊
│   │   ├── __init__.py       # Blueprint 初始化
│   │   ├── notes.py          # 筆記管理 API
│   │   └── events.py         # 事件追蹤 API
│   ├── services/              # 業務邏輯服務層
│   │   ├── __init__.py       # Python包初始化
│   │   ├── youtube_service.py # YouTube服務 - 字幕提取
│   │   ├── openai_service.py  # OpenAI服務 - AI筆記生成
│   │   ├── pdf_service.py     # PDF服務 - 文件解析
│   │   ├── flashcard_service.py # 閃卡服務
│   │   └── database_service.py # 數據庫服務
│   └── utils/                 # 工具類
│       ├── __init__.py       # 包初始化
│       └── sqlite_helpers.py  # SQLite 工具函數
├── frontend/                   # 前端 Next.js 應用
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 根布局組件
│   │   ├── page.tsx          # 首頁
│   │   ├── globals.css       # 全局樣式
│   │   ├── ai-notes/         # AI 筆記生成
│   │   │   ├── page.tsx      # 筆記生成頁面
│   │   │   └── result/[id]/  # 筆記結果頁面
│   │   ├── notes/            # 筆記管理 (新!)
│   │   │   ├── page.tsx      # 筆記列表頁面
│   │   │   └── [id]/page.tsx # 筆記編輯頁面
│   │   └── admin/            # 管理員介面 (新!)
│   │       └── data/page.tsx # 數據瀏覽頁面
│   ├── components/            # React 組件
│   │   ├── ui/               # 基礎 UI 組件 (Radix UI)
│   │   ├── app-sidebar.tsx   # 側邊欄組件
│   │   ├── ai-notes-modal.tsx # AI 筆記生成模態框
│   │   ├── markmap-viewer.tsx # 思維導圖組件
│   │   ├── simple-blocknote-unified.tsx # BlockNote 編輯器
│   │   ├── flashcard-generation-tab.tsx # 閃卡生成
│   │   └── quiz-generation-tab.tsx # 測驗生成
│   ├── src/                   # 源代碼
│   │   └── lib/              # 工具庫
│   │       ├── api/          # API 客戶端 (新!)
│   │       │   ├── client.ts # 通用 API 客戶端
│   │       │   └── notes.ts  # 筆記 API 函數
│   │       └── track.ts      # 事件追蹤工具
│   ├── package.json          # Node.js 依賴和腳本
│   ├── next.config.mjs       # Next.js 配置
│   ├── tailwind.config.ts    # Tailwind CSS 配置
│   ├── .env.local            # 前端環境變數 (需要創建)
│   └── env-example.txt       # 環境變數範例
├── docs/                      # 文檔目錄 (新!)
│   ├── API_REFERENCE.md      # API 參考文檔
│   └── DATABASE_SCHEMA.md    # 數據庫模式文檔
├── package.json              # 根目錄項目配置
├── README.md                 # 項目說明文檔
├── ROADMAP.md               # 開發路線圖
├── SETUP_GUIDE.md           # 設置指南
└── PROJECT_STRUCTURE.md    # 項目結構說明 (本文件)
```

## 文件說明

### 後端文件

**backend/app.py**
- Flask 應用主文件和路由註冊
- CORS 配置和中間件
- Blueprint 註冊和健康檢查
- AI 筆記生成端點

**backend/models.py**
- SQLAlchemy ORM 數據模型
- Note 和 Event 表定義
- 關係映射和約束

**backend/api/notes.py**
- 筆記管理 RESTful API
- CRUD 操作 (Create, Read, Update, Delete)
- 分頁、搜尋、篩選功能
- 多租戶數據隔離

**backend/api/events.py**
- 事件追蹤 API
- 用戶行為記錄
- 數據分析基礎

**backend/services/database_service.py**
- 數據庫連接和會話管理
- SQLAlchemy 配置
- 事務處理

**backend/services/openai_service.py**
- OpenAI API 集成和筆記生成
- 智能分塊處理
- 記憶卡片和測驗生成

**backend/services/youtube_service.py**
- YouTube 影片處理和字幕提取
- yt-dlp 音頻下載
- Whisper API 轉錄

**backend/utils/sqlite_helpers.py**
- SQLite 數據庫工具
- 安全的列添加機制
- 數據庫架構遷移

### 前端文件

**frontend/app/layout.tsx**
- Next.js 根布局組件
- 全局提供者和樣式
- 側邊欄集成

**frontend/app/notes/page.tsx**
- 筆記列表和管理界面
- 搜尋、篩選、創建功能
- 實時數據更新

**frontend/app/notes/[id]/page.tsx**
- 單個筆記編輯頁面
- BlockNote 編輯器集成
- Markmap 思維導圖預覽
- 自動保存功能

**frontend/app/admin/data/page.tsx**
- 管理員數據瀏覽介面
- 筆記和事件數據展示
- 開發和調試工具

**frontend/components/simple-blocknote-unified.tsx**
- 統一的 BlockNote 編輯器組件
- Markdown 轉換支持
- 編輯和預覽模式

**frontend/components/markmap-viewer.tsx**
- 思維導圖可視化組件
- Markmap 庫集成
- 縮放和導航控制

**frontend/src/lib/api/client.ts**
- 通用 API 客戶端
- HTTP 請求封裝
- 錯誤處理和重試

**frontend/src/lib/api/notes.ts**
- 筆記相關 API 函數
- TypeScript 類型定義
- CRUD 操作封裝

## 開發工作流程

### 1. 環境設置
1. **後端設置**:
   ```bash
   cd backend
   pip install -r requirements.txt
   # 創建 .env 文件並設置 OPENAI_API_KEY
   ```

2. **前端設置**:
   ```bash
   cd frontend
   npm install
   # 創建 .env.local 並設置 NEXT_PUBLIC_API_BASE
   ```

3. **啟動開發環境**:
   ```bash
   # 方法一：統一啟動 (推薦)
   npm run dev
   
   # 方法二：分別啟動
   cd backend && python app.py    # 終端 1
   cd frontend && npm run dev     # 終端 2
   ```

### 2. 開發建議

**後端開發:**
- 使用 Blueprint 組織 API 路由
- 遵循 RESTful API 設計原則
- 所有查詢都包含用戶隔離
- 使用 SQLAlchemy ORM 進行數據操作

**前端開發:**
- 使用 TypeScript 確保類型安全
- 組件化設計，重用 UI 組件
- 使用 API 客戶端封裝後端調用
- 實現響應式和移動端友好設計

**數據庫開發:**
- 使用 `utils/sqlite_helpers.py` 安全添加新列
- 遵循多租戶數據隔離原則
- 實施軟刪除策略

### 3. 測試和調試

**API 測試:**
```bash
# 健康檢查
curl http://localhost:5000/healthz

# 獲取筆記列表
curl -H "X-User-Id: demo-user" http://localhost:5000/api/v1/notes
```

**前端調試:**
- 使用瀏覽器開發者工具
- 檢查 Network 標籤查看 API 請求
- 使用 React DevTools 檢查組件狀態

### 4. 部署準備

**前端部署 (Vercel):**
- 自動從 GitHub 部署
- 設置環境變數: `NEXT_PUBLIC_API_BASE`
- 自動 TypeScript 檢查和構建

**後端部署 (Render/Railway):**
- 設置環境變數: `OPENAI_API_KEY`, `DATABASE_URL`
- 配置 PostgreSQL 數據庫
- 啟用數據庫遷移腳本

## 技術決策

### 為什麼選擇 Flask + Blueprint?
- **輕量級**: 快速原型開發和迭代
- **模塊化**: Blueprint 支持大型應用組織
- **擴展性**: 豐富的生態系統和中間件
- **熟悉度**: Python 開發者友好

### 為什麼選擇 Next.js 15 + React 19?
- **現代化**: 最新的 React 特性和性能優化
- **App Router**: 強大的路由和布局系統
- **SSR/SSG**: 優秀的 SEO 和首屏加載性能
- **TypeScript**: 類型安全和開發體驗
- **部署**: Vercel 無縫集成

### 為什麼選擇 SQLAlchemy + SQLite/PostgreSQL?
- **ORM 抽象**: 簡化數據庫操作和關係管理
- **數據庫無關**: 開發用 SQLite，生產用 PostgreSQL
- **遷移支持**: 安全的架構變更
- **多租戶**: 內建的數據隔離機制

### 為什麼選擇 BlockNote?
- **現代化**: 類似 Notion 的編輯體驗
- **Markdown**: 原生 Markdown 支持
- **可擴展**: 豐富的插件和自定義選項
- **TypeScript**: 完整的類型支持

### 為什麼選擇 Markmap?
- **可視化**: 優秀的思維導圖渲染
- **Markdown**: 直接支援 Markdown 語法
- **互動性**: 縮放、導航、摺疊功能
- **性能**: 處理大型思維導圖

## 未來改進

### 短期 (1-2週)
- [ ] **用戶認證系統**: JWT Token + Supabase Auth
- [ ] **實時協作**: WebSocket 多用戶編輯
- [ ] **搜尋優化**: 全文搜尋和語義匹配
- [ ] **性能優化**: 緩存策略和懶加載

### 中期 (1-2月)
- [ ] **移動端 PWA**: 漸進式 Web 應用
- [ ] **批量操作**: 多選、批量刪除、導出
- [ ] **高級編輯**: LaTeX 數學公式、代碼高亮
- [ ] **國際化**: 多語言界面支持

### 長期 (3-6月)
- [ ] **團隊協作**: 共享筆記、權限管理
- [ ] **AI 增強**: 智能摘要、關鍵詞提取
- [ ] **分析工具**: 學習進度、知識圖譜
- [ ] **平台集成**: LMS 系統、第三方工具

## 維護指南

### 定期檢查
- OpenAI API使用量
- 錯誤日誌
- 用戶反饋

### 更新策略
- 定期更新依賴
- 監控安全漏洞
- 備份用戶數據

### 效能監控
- API回應時間
- 前端載入速度
- 資源使用情況