# NexLearn AI Notes - 設置指南

## 🚀 快速開始

### 步驟 1: 環境準備

#### 必要軟體:
- **Python 3.8+** - [下載連結](https://www.python.org/downloads/)
- **現代瀏覽器** - Chrome, Firefox, Safari, Edge
- **文字編輯器** - VS Code, Sublime Text, 或任何編輯器

#### 檢查Python版本:
```powershell
python --version
```

### 步驟 2: 安裝依賴

#### 安裝Python套件:
```powershell
cd backend
pip install -r requirements.txt
```

#### 如果遇到安裝問題:
```powershell
# 升級pip
python -m pip install --upgrade pip

# 使用國內鏡像 (中國用戶)
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

### 步驟 3: 配置OpenAI API

#### 獲取API密鑰:
1. 訪問 [OpenAI官網](https://platform.openai.com/)
2. 註冊/登入帳戶
3. 前往 API Keys 頁面
4. 創建新的API密鑰
5. 複製密鑰 (只顯示一次!)

#### 創建環境變數文件:
在 `backend` 目錄下創建 `.env` 文件:

```bash
# 在backend目錄下
New-Item -Name ".env" -ItemType File
```

在 `.env` 文件中添加:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
FLASK_PORT=5000
FLASK_DEBUG=True
```

⚠️ **重要**: 
- 將 `sk-your-actual-api-key-here` 替換為你的真實API密鑰
- 不要將 `.env` 文件提交到Git倉庫

### 步驟 4: 測試設置

#### 啟動後端服務:
```powershell
cd backend
python app.py
```

你應該看到類似輸出:
```
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[::1]:5000
```

#### 測試API:
打開瀏覽器，訪問: http://localhost:5000

你應該看到JSON響應:
```json
{
  "message": "NexLearn AI Notes API",
  "endpoints": [...]
}
```

#### 打開前端:
在文件管理器中，雙擊 `frontend/index.html` 文件

## 🔧 常見問題排解

### 問題 1: 模組未找到錯誤

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

### 問題 2: OpenAI API錯誤

**錯誤信息:**
```
Error: The api_key client option must be set
```

**解決方案:**
1. 檢查 `.env` 文件是否存在於 `backend` 目錄
2. 確認API密鑰格式正確 (以 `sk-` 開頭)
3. 重啟後端服務

### 問題 3: CORS錯誤

**錯誤信息:**
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```

**解決方案:**
1. 確認後端服務正在運行
2. 檢查 `flask-cors` 是否已安裝
3. 在瀏覽器中直接訪問後端URL確認可達性

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