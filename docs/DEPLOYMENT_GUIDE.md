# Deployment Guide - NexLearn.ai

這份文檔描述如何將 NexLearn.ai 部署到生產環境。

## 🎯 部署架構

```
Production Architecture:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│  (PostgreSQL)   │
│   Next.js App   │    │   Flask API     │    │   Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 前端部署 (Vercel)

### 準備工作

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **檢查構建**
   ```bash
   cd frontend
   npm run build
   npm run start  # 測試生產構建
   ```

### Vercel 部署步驟

1. **連接 GitHub**
   - 訪問 [Vercel](https://vercel.com)
   - 使用 GitHub 登入
   - 選擇你的倉庫

2. **配置項目**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **設置環境變數**
   ```env
   NEXT_PUBLIC_API_BASE=https://your-backend-domain.railway.app
   NEXT_PUBLIC_APP_ORIGIN=https://your-app.vercel.app
   ```

4. **高級配置** (vercel.json)
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "cd frontend && npm run build",
     "devCommand": "cd frontend && npm run dev",
     "installCommand": "cd frontend && npm install",
     "outputDirectory": "frontend/.next"
   }
   ```

---

## 🔧 後端部署 (Railway)

### 準備工作

1. **更新 requirements.txt**
   ```bash
   cd backend
   pip freeze > requirements.txt
   ```

2. **創建 Procfile**
   ```bash
   # 在 backend 目錄創建 Procfile
   echo "web: python app.py" > Procfile
   ```

3. **生產配置更新**
   ```python
   # config.py 添加生產配置
   import os
   
   class ProductionConfig:
       DATABASE_URL = os.getenv('DATABASE_URL')
       OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
       FLASK_DEBUG = False
   ```

### Railway 部署步驟

1. **連接 GitHub**
   - 訪問 [Railway](https://railway.app)
   - 使用 GitHub 登入
   - 創建新項目

2. **配置服務**
   - **Source**: GitHub Repository
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

3. **設置環境變數**
   ```env
   OPENAI_API_KEY=sk-your-production-api-key
   FLASK_PORT=8080
   FLASK_DEBUG=False
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

4. **數據庫配置**
   - 添加 PostgreSQL 插件
   - 獲取 DATABASE_URL
   - 更新環境變數

---

## 🗄️ 數據庫設置 (PostgreSQL)

### Supabase 設置

1. **創建項目**
   - 訪問 [Supabase](https://supabase.com)
   - 創建新項目
   - 選擇區域和計劃

2. **獲取連接信息**
   ```sql
   Host: db.your-project.supabase.co
   Database: postgres
   Port: 5432
   User: postgres
   Password: your-password
   ```

3. **運行初始化腳本**
   ```sql
   -- 在 Supabase SQL Editor 執行
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- 創建 notes 表
   CREATE TABLE notes (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       org_id VARCHAR(255),
       course_id VARCHAR(255),
       folder_id VARCHAR(255),
       title VARCHAR(500) NOT NULL,
       content TEXT,
       content_md TEXT,
       content_json TEXT,
       tags TEXT,
       status VARCHAR(50) DEFAULT 'draft',
       language VARCHAR(10) DEFAULT 'zh-tw',
       exam_system VARCHAR(100),
       subject VARCHAR(100),
       topic VARCHAR(200),
       created_at BIGINT NOT NULL,
       updated_at BIGINT NOT NULL,
       deleted_at BIGINT
   );
   
   -- 創建 events 表
   CREATE TABLE events (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       org_id VARCHAR(255),
       event VARCHAR(100) NOT NULL,
       target_type VARCHAR(50),
       target_id VARCHAR(255),
       ts BIGINT NOT NULL,
       props TEXT
   );
   
   -- 創建索引
   CREATE INDEX idx_notes_user_id ON notes(user_id);
   CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);
   CREATE INDEX idx_events_user_ts ON events(user_id, ts DESC);
   ```

### Railway PostgreSQL

1. **添加 PostgreSQL 插件**
   - 在 Railway 項目中添加 PostgreSQL
   - 獲取連接 URL

2. **配置環境變數**
   ```env
   DATABASE_URL=postgresql://postgres:password@host:port/railway
   ```

---

## 🔐 安全配置

### 環境變數管理

**生產環境必需變數:**
```env
# Backend
OPENAI_API_KEY=sk-prod-your-key
DATABASE_URL=postgresql://...
FLASK_DEBUG=False
CORS_ORIGINS=https://your-domain.vercel.app

# Frontend  
NEXT_PUBLIC_API_BASE=https://your-backend.railway.app
NEXT_PUBLIC_APP_ORIGIN=https://your-domain.vercel.app
```

### CORS 配置

```python
# backend/app.py
from flask_cors import CORS

# 生產環境限制域名
cors_origins = os.getenv('CORS_ORIGINS', 'https://your-domain.vercel.app').split(',')
CORS(app, origins=cors_origins)
```

### API 安全

```python
# 添加速率限制
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per hour"]
)

@app.route('/api/v1/notes', methods=['POST'])
@limiter.limit("10 per minute")
def create_note():
    # ...
```

---

## 📊 監控和日誌

### 應用監控

1. **Vercel Analytics**
   - 啟用 Vercel Analytics
   - 監控頁面性能

2. **Railway Logs**
   - 查看部署日誌
   - 設置錯誤警報

### 錯誤追蹤

```python
# 集成 Sentry
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

---

## 🧪 部署測試

### 健康檢查

```bash
# 測試後端
curl https://your-backend.railway.app/healthz

# 測試 API
curl -H "X-User-Id: test-user" \
     https://your-backend.railway.app/api/v1/notes
```

### 功能測試

1. **前端測試**
   - 訪問主頁：https://your-app.vercel.app
   - 測試筆記列表：/notes
   - 測試 AI 生成：/ai-notes

2. **API 測試**
   - 創建測試筆記
   - 驗證數據持久化
   - 檢查事件追蹤

---

## 🔄 CI/CD 設置

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
      - name: Build project
        run: cd frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 性能優化

### 前端優化

1. **圖片優化**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-domain.com'],
       formats: ['image/webp', 'image/avif']
     }
   }
   ```

2. **代碼分割**
   ```javascript
   // 動態導入
   const AdminPanel = dynamic(() => import('./AdminPanel'), {
     loading: () => <p>Loading...</p>
   })
   ```

### 後端優化

1. **數據庫連接池**
   ```python
   # 配置連接池
   from sqlalchemy import create_engine
   
   engine = create_engine(
       DATABASE_URL,
       pool_size=10,
       max_overflow=20
   )
   ```

2. **緩存策略**
   ```python
   # Redis 緩存
   import redis
   
   cache = redis.Redis.from_url(os.getenv('REDIS_URL'))
   
   @app.route('/api/v1/notes')
   def list_notes():
       cache_key = f"notes:{user_id}"
       cached = cache.get(cache_key)
       if cached:
           return json.loads(cached)
       # ... 查詢數據庫
   ```

---

## 🆘 故障排除

### 常見部署問題

1. **Build 失敗**
   ```bash
   # 檢查依賴
   npm audit fix
   npm run build
   ```

2. **API 連接問題**
   - 檢查 CORS 設置
   - 驗證環境變數
   - 查看網絡日誌

3. **數據庫連接失敗**
   - 檢查 DATABASE_URL 格式
   - 驗證網絡權限
   - 查看連接池配置

### 回滾策略

```bash
# Vercel 回滾
vercel rollback [deployment-url]

# Railway 回滾
# 通過 Dashboard 選擇之前的部署
```

---

## 📋 部署檢查清單

### 部署前檢查

- [ ] 所有測試通過
- [ ] 環境變數配置正確
- [ ] 數據庫遷移完成
- [ ] CORS 設置正確
- [ ] API 密鑰更新為生產版本

### 部署後驗證

- [ ] 前端頁面正常載入
- [ ] API 端點響應正常
- [ ] 數據庫連接成功
- [ ] 監控和日誌工作正常
- [ ] 性能測試通過

---

*此文檔會隨著部署經驗的積累而持續更新*
