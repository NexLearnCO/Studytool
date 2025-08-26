# NexLearn AI Notes - 設置指南

## 🚀 快速開始

### 步驟 1: 環境準備

#### 必要軟體:
- **Node.js 18+** - [下載連結](https://nodejs.org/)
- **Python 3.8+** - [下載連結](https://www.python.org/downloads/)
- **現代瀏覽器** - Chrome, Firefox, Safari, Edge
- **代碼編輯器** - VS Code (推薦), WebStorm, 或其他

#### 檢查版本:
```powershell
node --version    # 應該 >= 18.0.0
python --version  # 應該 >= 3.8.0
npm --version     # 應該 >= 8.0.0
```

### 步驟 2: 安裝依賴

#### 安裝後端 Python 依賴:
```powershell
cd backend
pip install -r requirements.txt
```

#### 安裝前端 Node.js 依賴:
```powershell
cd frontend
npm install
# 或使用 yarn
yarn install
```

#### 如果遇到安裝問題:
```powershell
# Python 依賴問題
python -m pip install --upgrade pip
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/

# Node.js 依賴問題
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 步驟 3: 配置環境變數

#### 後端配置 (.env):
在 `backend` 目錄創建 `.env` 文件:

```powershell
cd backend
New-Item -Name ".env" -ItemType File
```

在 `.env` 文件中添加:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
FLASK_PORT=5000
FLASK_DEBUG=True

# 可選配置
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
```

#### 前端配置 (.env.local):
在 `frontend` 目錄創建 `.env.local` 文件:

```powershell
cd frontend
Copy-Item env-example.txt .env.local
```

編輯 `.env.local` 文件:
```bash
# API 端點
NEXT_PUBLIC_API_BASE=http://localhost:5000
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000

# 多租戶配置 (可選)
NEXT_PUBLIC_ORG_ID=demo-org
NEXT_PUBLIC_COURSE_ID=demo-course
```

#### 獲取 OpenAI API 密鑰:
1. 訪問 [OpenAI官網](https://platform.openai.com/)
2. 註冊/登入帳戶
3. 前往 API Keys 頁面
4. 創建新的API密鑰
5. 複製密鑰並替換上面的 `sk-your-actual-api-key-here`

⚠️ **重要**: 
- 不要將 `.env` 文件提交到Git倉庫
- API 密鑰請妥善保管

### 步驟 4: 啟動應用

#### 方法一：統一啟動 (推薦)
```powershell
# 在項目根目錄
npm run dev
```
這會同時啟動前端和後端服務。

#### 方法二：分別啟動
**啟動後端:**
```powershell
cd backend
python app.py
```

**啟動前端:**
```powershell
cd frontend
npm run dev
```

### 步驟 5: 驗證安裝

#### 檢查後端服務:
1. 訪問: http://localhost:5000
2. 你應該看到 API 信息響應
3. 測試健康檢查: http://localhost:5000/healthz

#### 檢查前端應用:
1. 訪問: http://localhost:3000
2. 你應該看到 NexLearn.ai 主頁
3. 側邊欄應該正常顯示

#### 測試核心功能:
1. **筆記管理**: 訪問 http://localhost:3000/notes
2. **AI 筆記生成**: 點擊「AI 筆記」
3. **管理員介面**: 訪問 http://localhost:3000/admin/data

如果所有頁面都能正常載入，恭喜！系統安裝成功！🎉

## 🔧 常見問題排解

### 問題 1: TypeError: Failed to fetch

**錯誤信息:**
```
TypeError: Failed to fetch
```

**可能原因:**
- 後端未啟動或端口不對
- 前端環境變數未設置
- CORS 被瀏覽器阻擋

**解決方案:**
1. 確認後端運行：`curl http://localhost:5000/healthz`
2. 檢查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_BASE`
3. 重啟前端開發服務器：`npm run dev`

### 問題 2: 模組未找到錯誤

**錯誤信息:**
```
ModuleNotFoundError: No module named 'flask'
```

**解決方案:**
```powershell
pip install flask
# 或者重新安裝所有依賴
pip install -r requirements.txt
```

### 問題 3: Next.js 編譯錯誤

**錯誤信息:**
```
Module not found: Can't resolve 'markmap-common'
```

**解決方案:**
```powershell
cd frontend
npm install markmap-common markmap-lib markmap-view
npm run dev
```

### 問題 4: OpenAI API 錯誤

**錯誤信息:**
```
Error: The api_key client option must be set
```

**解決方案:**
1. 檢查 `backend/.env` 文件是否存在
2. 確認API密鑰格式正確 (以 `sk-` 開頭)
3. 重啟後端服務

### 問題 5: 數據庫錯誤

**錯誤信息:**
```
no such table: notes
```

**解決方案:**
數據庫會自動初始化，如果遇到問題：
```powershell
cd backend
# 刪除數據庫文件重新創建
rm nexlearn.db
python app.py
```

### 問題 4: YouTube字幕無法獲取

**錯誤信息:**
```
Could not retrieve a transcript for the video
```

**可能原因:**
- 影片沒有字幕
- 影片是私人的
- 影片在你的地區不可用
- YouTube URL格式不正確

**解決方案:**
- 嘗試使用有字幕的公開影片
- 檢查URL格式是否正確

### 問題 5: PDF解析失敗

**錯誤信息:**
```
Failed to extract PDF text
```

**可能原因:**
- PDF文件過大 (>10MB)
- PDF是掃描版本 (圖片格式)
- PDF文件損壞

**解決方案:**
- 使用較小的PDF文件
- 確保PDF包含可選文字 (非圖片)
- 嘗試使用其他PDF文件

## 🔨 開發環境設置

### VS Code 擴展推薦:
- Python
- Pylance
- HTML CSS Support
- JavaScript (ES6) code snippets
- Live Server

### 開發工作流程:

1. **後端開發:**
   ```powershell
   cd backend
   python app.py
   ```

2. **前端開發:**
   - 使用Live Server擴展
   - 或直接在瀏覽器中打開 `frontend/index.html`

3. **測試更改:**
   - 修改後端代碼後重啟Python服務
   - 修改前端代碼後刷新瀏覽器

### Git版本控制:

#### 初始化倉庫:
```powershell
git init
git add .
git commit -m "Initial commit: NexLearn AI Notes system"
```

#### .gitignore 建議:
```
backend/.env
backend/__pycache__/
*.pyc
*.pyo
*.pyd
node_modules/
.DS_Store
Thumbs.db
```

## 📊 性能優化建議

### 開發環境:
- 使用SSD硬碟
- 至少8GB RAM
- 穩定的網路連接

### API成本控制:
```python
# 在 config.py 中設置合理的限制
OPENAI_MAX_TOKENS = 1000  # 減少令牌使用
OPENAI_TEMPERATURE = 0.3  # 降低創造性但提高一致性
```

### 快取策略:
- 考慮添加結果快取
- 避免重複處理相同內容

## 🚀 部署準備

### 生產環境配置:
```
FLASK_DEBUG=False
FLASK_PORT=80
```

### 安全性檢查清單:
- [ ] 移除調試信息
- [ ] 設置強密碼和密鑰
- [ ] 啟用HTTPS
- [ ] 添加速率限制
- [ ] 驗證用戶輸入

## 📞 獲取幫助

### 資源:
- [Flask文檔](https://flask.palletsprojects.com/)
- [OpenAI API文檔](https://platform.openai.com/docs)
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api)

### 支援:
- 查看 `ROADMAP.md` 了解開發計劃
- 查看 `PROJECT_STRUCTURE.md` 了解代碼組織
- 查看錯誤日誌獲取詳細信息

---

**恭喜! 🎉 你的NexLearn AI Notes系統現在應該已經運行正常了!**