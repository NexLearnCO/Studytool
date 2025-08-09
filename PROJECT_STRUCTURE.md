# NexLearn AI Notes - Project Structure

## 目錄結構

```
nexlearn-ai-notes/
├── backend/                    # 後端 Python Flask 應用
│   ├── app.py                 # 主應用文件 - Flask路由和API端點
│   ├── config.py              # 配置文件 - 環境變數和設定
│   ├── requirements.txt       # Python依賴列表
│   ├── .env                   # 環境變數文件 (需要創建)
│   └── services/              # 服務層
│       ├── __init__.py       # Python包初始化
│       ├── youtube_service.py # YouTube服務 - 字幕提取
│       ├── openai_service.py  # OpenAI服務 - AI筆記生成
│       └── pdf_service.py     # PDF服務 - 文件解析
├── frontend/                   # 前端用戶界面
│   ├── index.html             # 主頁面 - 用戶界面
│   ├── css/
│   │   └── styles.css         # 樣式表 - 視覺設計
│   ├── js/
│   │   ├── app.js            # 主要JavaScript - 應用邏輯
│   │   └── mindmap.js        # 思維導圖 - Markmap集成
│   └── assets/               # 靜態資源 (圖片等)
│       └── logo.png          # 徽標 (待添加)
├── package.json              # 項目配置文件
└── README.md                 # 項目說明文檔
```

## 文件說明

### 後端文件

**backend/app.py**
- Flask應用的主文件
- 定義所有API路由
- 處理HTTP請求和回應
- 集成各種服務

**backend/config.py**
- 配置管理
- 環境變數載入
- OpenAI設定
- 應用常數定義

**backend/services/youtube_service.py**
- YouTube影片處理
- 影片ID提取
- 字幕下載和格式化
- 錯誤處理

**backend/services/openai_service.py**
- OpenAI API集成
- 筆記生成邏輯
- 記憶卡片生成
- 測驗問題生成

**backend/services/pdf_service.py**
- PDF文件處理
- 文本提取
- 文件驗證

### 前端文件

**frontend/index.html**
- 主用戶界面
- 多標籤設計 (YouTube/PDF/文字)
- 響應式佈局
- 外部庫集成

**frontend/css/styles.css**
- 完整視覺設計
- 響應式CSS
- 動畫效果
- 主題色彩

**frontend/js/app.js**
- 主要應用邏輯
- API調用管理
- 用戶界面交互
- 事件處理

**frontend/js/mindmap.js**
- 思維導圖渲染
- Markmap集成
- 縮放控制
- 動態樣式

## 開發工作流程

### 1. 環境設置
1. 安裝Python依賴: `pip install -r backend/requirements.txt`
2. 配置環境變數: 創建 `backend/.env`
3. 啟動後端: `python backend/app.py`
4. 打開前端: 在瀏覽器中打開 `frontend/index.html`

### 2. 開發建議
- 後端開發: 先測試API端點
- 前端開發: 使用瀏覽器開發者工具
- 調試: 檢查控制台錯誤信息
- 測試: 從簡單功能開始

### 3. 部署準備
- 後端: 可部署到Heroku、Render、或VPS
- 前端: 可部署到Netlify、Vercel、或靜態託管
- 環境: 生產環境需要修改API_BASE_URL

## 技術決策

### 為什麼選擇Flask?
- 輕量級Python框架
- 快速原型開發
- 容易部署和擴展

### 為什麼使用原生JavaScript?
- 避免框架複雜性
- 更好的性能
- 更容易調試

### 為什麼選擇Markmap?
- 優秀的思維導圖渲染
- 直接支援Markdown
- 互動性強

## 未來改進

### 短期 (1-2週)
- [ ] 錯誤處理改進
- [ ] 用戶體驗優化
- [ ] 移動端適配

### 中期 (1-2月)
- [ ] 用戶認證系統
- [ ] 筆記管理功能
- [ ] 批量處理

### 長期 (3-6月)
- [ ] 多語言支援
- [ ] 團隊協作功能
- [ ] 高級分析工具

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