# Technology Stack - NexLearn.ai

這份文檔詳細描述了 NexLearn.ai 平台使用的技術棧和工具。

## 🏗️ 整體架構

```
┌─────────────────────────────────────────────────────────────┐
│                    NexLearn.ai Platform                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15)  │  Backend (Flask)  │  Database    │
│  ├─ React 19            │  ├─ Python 3.8+   │  ├─ SQLite   │
│  ├─ TypeScript 5.x      │  ├─ SQLAlchemy     │  ├─ PostgreSQL│
│  ├─ Tailwind CSS        │  ├─ Flask-CORS     │  └─ Supabase │
│  ├─ Radix UI            │  └─ OpenAI API     │              │
│  ├─ BlockNote           │                    │              │
│  └─ Markmap             │                    │              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 前端技術棧

### 核心框架

| 技術 | 版本 | 用途 | 為什麼選擇 |
|------|------|------|------------|
| **Next.js** | 15.2.4 | React 框架 | App Router、SSR、性能優化 |
| **React** | 19.x | UI 庫 | 組件化、生態豐富、性能優秀 |
| **TypeScript** | 5.x | 類型系統 | 類型安全、開發體驗、重構支持 |

### UI 和樣式

| 技術 | 版本 | 用途 | 特點 |
|------|------|------|------|
| **Tailwind CSS** | 4.1.9 | CSS 框架 | 工具類優先、高度可定制、響應式 |
| **Radix UI** | Latest | 無頭組件 | 可訪問性、無樣式、高質量 |
| **Lucide React** | Latest | 圖標庫 | 美觀、一致、SVG 格式 |

### 編輯器和可視化

| 技術 | 版本 | 用途 | 特點 |
|------|------|------|------|
| **BlockNote** | Latest | 富文本編輯器 | 類似 Notion、Markdown 支持、可擴展 |
| **Markmap** | 0.18.9 | 思維導圖 | Markdown 轉思維導圖、互動式 |

### 構建和工具

| 技術 | 版本 | 用途 | 特點 |
|------|------|------|------|
| **ESLint** | Latest | 代碼檢查 | 代碼質量、一致性 |
| **Prettier** | Latest | 代碼格式化 | 自動格式化、團隊一致性 |
| **PostCSS** | Latest | CSS 後處理 | 與 Tailwind 集成 |

---

## ⚙️ 後端技術棧

### 核心框架

| 技術 | 版本 | 用途 | 為什麼選擇 |
|------|------|------|------------|
| **Python** | 3.8+ | 編程語言 | AI 生態豐富、開發效率高 |
| **Flask** | 3.x | Web 框架 | 輕量級、靈活、快速開發 |
| **SQLAlchemy** | 2.x | ORM | 強大的 ORM、數據庫無關 |

### API 和架構

| 技術 | 版本 | 用途 | 特點 |
|------|------|------|------|
| **Flask-CORS** | Latest | 跨域處理 | 前後端分離必需 |
| **Blueprint** | Flask 內建 | 模塊化路由 | 大型應用組織 |
| **RESTful API** | 設計模式 | API 設計 | 標準化、易於理解 |

### AI 和數據處理

| 技術 | 版本 | 用途 | 特點 |
|------|------|------|------|
| **OpenAI API** | Latest | AI 服務 | GPT 模型、Whisper 語音識別 |
| **youtube-transcript-api** | Latest | YouTube 字幕 | 字幕提取 |
| **yt-dlp** | Latest | YouTube 下載 | 音頻下載、元數據提取 |
| **PyPDF2** | Latest | PDF 處理 | 文本提取 |

---

## 🗄️ 數據庫技術

### 數據庫系統

| 技術 | 環境 | 用途 | 特點 |
|------|------|------|------|
| **SQLite** | 開發 | 本地數據庫 | 零配置、檔案數據庫 |
| **PostgreSQL** | 生產 | 生產數據庫 | 功能豐富、高性能、可擴展 |
| **Supabase** | 生產 | 數據庫服務 | PostgreSQL + API + 認證 |

### 數據管理

| 技術 | 用途 | 特點 |
|------|------|------|
| **SQLAlchemy ORM** | 對象關係映射 | 類型安全、查詢構建器 |
| **Database Migration** | 架構變更 | 安全的列添加、版本控制 |
| **Soft Delete** | 數據保護 | 邏輯刪除、數據恢復 |

---

## 🔧 開發工具

### 版本控制

| 技術 | 用途 | 配置 |
|------|------|------|
| **Git** | 版本控制 | 分支策略、提交規範 |
| **GitHub** | 代碼託管 | Issues、Pull Requests、Actions |

### 開發環境

| 技術 | 用途 | 推薦配置 |
|------|------|----------|
| **VS Code** | 代碼編輯器 | TypeScript、Python、Tailwind 擴展 |
| **Node.js** | JavaScript 運行時 | 18+ LTS 版本 |
| **Python** | Python 解釋器 | 3.8+ 版本 |

### 包管理

| 技術 | 環境 | 用途 |
|------|------|------|
| **npm** | Node.js | 前端依賴管理 |
| **pip** | Python | Python 包管理 |

---

## 🚀 部署技術

### 託管平台

| 服務 | 用途 | 特點 |
|------|------|------|
| **Vercel** | 前端託管 | Next.js 優化、自動部署、CDN |
| **Railway** | 後端託管 | 容器化部署、數據庫集成 |
| **Supabase** | 數據庫託管 | PostgreSQL + API + 認證 |

### CI/CD

| 技術 | 用途 | 特點 |
|------|------|------|
| **GitHub Actions** | 自動化部署 | Git 集成、免費額度 |
| **Vercel CLI** | 部署工具 | 命令行部署 |

---

## 📊 監控和分析

### 應用監控

| 技術 | 用途 | 特點 |
|------|------|------|
| **Vercel Analytics** | 前端分析 | 頁面性能、用戶行為 |
| **Railway Logs** | 後端日誌 | 實時日誌、錯誤追蹤 |

### 錯誤追蹤

| 技術 | 用途 | 集成狀態 |
|------|------|----------|
| **Sentry** | 錯誤監控 | 計劃中 |
| **Console Logging** | 基礎日誌 | 已實現 |

---

## 🔒 安全技術

### 認證和授權

| 技術 | 現狀 | 計劃 |
|------|------|------|
| **Header 認證** | 當前實現 | 開發階段使用 |
| **JWT Token** | 計劃中 | 生產環境使用 |
| **Supabase Auth** | 計劃中 | 用戶管理系統 |

### 數據安全

| 技術 | 用途 | 實現狀態 |
|------|------|----------|
| **CORS 配置** | 跨域安全 | ✅ 已實現 |
| **環境變數** | 敏感信息保護 | ✅ 已實現 |
| **軟刪除** | 數據保護 | ✅ 已實現 |
| **多租戶隔離** | 數據隔離 | ✅ 已實現 |

---

## 📱 API 技術

### API 設計

| 技術 | 用途 | 特點 |
|------|------|------|
| **RESTful API** | API 架構 | 標準化、易於理解 |
| **JSON** | 數據格式 | 輕量級、廣泛支持 |
| **HTTP Status Codes** | 狀態標識 | 語義化響應 |

### API 工具

| 技術 | 用途 | 狀態 |
|------|------|------|
| **Flask Blueprint** | 路由組織 | ✅ 已實現 |
| **CORS 中間件** | 跨域支持 | ✅ 已實現 |
| **錯誤處理** | 統一錯誤響應 | ✅ 已實現 |

---

## 🧪 測試技術

### 前端測試

| 技術 | 用途 | 狀態 |
|------|------|------|
| **Jest** | 單元測試 | 計劃中 |
| **React Testing Library** | 組件測試 | 計劃中 |
| **Cypress** | E2E 測試 | 計劃中 |

### 後端測試

| 技術 | 用途 | 狀態 |
|------|------|------|
| **pytest** | Python 測試 | 計劃中 |
| **Flask Testing** | API 測試 | 計劃中 |

---

## 📦 依賴管理

### 前端依賴 (package.json)

```json
{
  "dependencies": {
    "next": "15.2.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@blocknote/core": "^0.15.0",
    "@blocknote/mantine": "^0.15.0",
    "@blocknote/react": "^0.15.0",
    "markmap-lib": "^0.18.9",
    "markmap-view": "^0.18.9",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^4.1.9",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.2.4"
  }
}
```

### 後端依賴 (requirements.txt)

```txt
Flask==3.0.0
Flask-CORS==4.0.0
SQLAlchemy==2.0.0
openai==1.0.0
youtube-transcript-api==0.6.0
yt-dlp==2023.12.30
PyPDF2==3.0.1
python-dotenv==1.0.0
requests==2.31.0
```

---

## 🔄 版本管理策略

### 版本號規則

- **主版本 (Major)**: 重大架構變更
- **次版本 (Minor)**: 新功能添加
- **修補版本 (Patch)**: Bug 修復

### 分支策略

- **main**: 生產環境分支
- **develop**: 開發環境分支
- **feature/***: 功能開發分支
- **hotfix/***: 緊急修復分支

---

## 📈 性能優化技術

### 前端優化

| 技術 | 用途 | 實現狀態 |
|------|------|----------|
| **Next.js SSR** | 服務端渲染 | ✅ 已實現 |
| **Code Splitting** | 代碼分割 | ✅ 已實現 |
| **Image Optimization** | 圖片優化 | 計劃中 |
| **CDN** | 內容分發 | Vercel 自動 |

### 後端優化

| 技術 | 用途 | 實現狀態 |
|------|------|----------|
| **Database Indexing** | 數據庫索引 | ✅ 已實現 |
| **Connection Pooling** | 連接池 | 計劃中 |
| **Caching** | 緩存策略 | 計劃中 |

---

## 🎯 未來技術規劃

### 短期目標

- [ ] **Redis 緩存**: 提升 API 響應速度
- [ ] **WebSocket**: 實時協作功能
- [ ] **Service Worker**: PWA 支持
- [ ] **Jest 測試**: 單元測試覆蓋

### 中期目標

- [ ] **GraphQL**: 靈活的 API 查詢
- [ ] **Docker**: 容器化部署
- [ ] **Kubernetes**: 容器編排
- [ ] **Micro-services**: 微服務架構

### 長期目標

- [ ] **AI 模型集成**: 本地 AI 模型
- [ ] **邊緣計算**: CDN 邊緣部署
- [ ] **多語言支持**: 國際化框架
- [ ] **移動端應用**: React Native

---

*此文檔會隨著技術棧的演進而更新*
