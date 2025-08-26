# API Reference - NexLearn.ai

這份文檔描述了 NexLearn.ai 平台的所有 API 端點。

## 🔗 基本信息

- **Base URL**: `http://localhost:5000` (開發環境)
- **Content-Type**: `application/json`
- **認證**: 暫時使用 Header 認證 (生產環境將使用 JWT)

### 通用 Headers

```http
Content-Type: application/json
X-User-Id: demo-user           # 用戶 ID (暫時)
X-Org-Id: your-org-id          # 組織 ID (可選)
X-Course-Id: your-course-id    # 課程 ID (可選)
```

### 通用響應格式

所有 API 響應都遵循以下格式：

```json
{
  "ok": true,           // 是否成功
  "data": {...},        // 數據內容
  "message": "string"   // 錯誤信息 (失敗時)
}
```

---

## 📝 筆記管理 API

### 獲取筆記列表

```http
GET /api/v1/notes
```

**查詢參數:**

| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| `limit` | integer | 否 | 返回筆記數量 (默認: 50, 最大: 100) |
| `cursor` | integer | 否 | 分頁游標 (epoch ms) |
| `folder_id` | string | 否 | 資料夾 ID 篩選 |
| `tag` | string | 否 | 標籤篩選 |
| `org_id` | string | 否 | 組織 ID 篩選 |
| `course_id` | string | 否 | 課程 ID 篩選 |

**響應示例:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "123",
        "title": "我的筆記",
        "content": "筆記內容 (兼容舊版)",
        "content_md": "# 我的筆記\n筆記內容...",
        "content_json": {...},
        "tags": ["AI", "學習"],
        "status": "active",
        "language": "zh-tw",
        "exam_system": "GSAT",
        "subject": "數學",
        "topic": "微積分",
        "org_id": "org-123",
        "course_id": "course-456",
        "folder_id": "folder-789",
        "created_at": 1756211738684,
        "updated_at": 1756211738684,
        "deleted_at": null
      }
    ],
    "nextCursor": 1756211738683
  }
}
```

### 獲取單個筆記

```http
GET /api/v1/notes/{note_id}
```

**路徑參數:**
- `note_id`: 筆記 ID

**響應示例:**
```json
{
  "ok": true,
  "data": {
    "id": "123",
    "title": "我的筆記",
    "content_md": "# 我的筆記\n筆記內容...",
    "tags": ["AI", "學習"],
    // ... 其他字段
  }
}
```

### 創建筆記

```http
POST /api/v1/notes
```

**請求體:**
```json
{
  "title": "我的新筆記",
  "content": "筆記內容 (兼容舊版)",
  "content_md": "# 我的新筆記\n筆記內容...",
  "content_json": {...},
  "tags": ["AI", "學習"],
  "status": "active",
  "language": "zh-tw",
  "exam_system": "GSAT",
  "subject": "數學",
  "topic": "微積分",
  "folder_id": "folder-789"
}
```

**響應示例:**
```json
{
  "ok": true,
  "data": {
    "id": "124",
    "title": "我的新筆記",
    // ... 完整筆記數據
  }
}
```

### 更新筆記

```http
PATCH /api/v1/notes/{note_id}
```

**請求體:** (僅包含要更新的字段)
```json
{
  "title": "更新的標題",
  "content_md": "更新的內容",
  "tags": ["更新", "標籤"]
}
```

**響應示例:**
```json
{
  "ok": true,
  "data": {
    // ... 更新後的完整筆記數據
  }
}
```

### 刪除筆記 (軟刪除)

```http
DELETE /api/v1/notes/{note_id}
```

**響應示例:**
```json
{
  "ok": true,
  "message": "Note deleted successfully"
}
```

---

## 📊 事件追蹤 API

### 記錄事件

```http
POST /api/v1/events
```

**請求體:**
```json
{
  "event": "NOTE_CREATED",
  "target_type": "note",
  "target_id": "123",
  "props": {
    "source": "ai",
    "word_count": 500,
    "processing_time": "5.2s"
  }
}
```

**響應示例:**
```json
{
  "ok": true,
  "data": {
    "id": "event-456",
    "user_id": "demo-user",
    "org_id": "org-123",
    "event": "NOTE_CREATED",
    "target_type": "note",
    "target_id": "123",
    "ts": 1756211738684,
    "props": "{\"source\":\"ai\",\"word_count\":500}"
  }
}
```

### 獲取事件列表 (管理員)

```http
GET /api/v1/events
```

**查詢參數:**
| 參數 | 類型 | 必需 | 描述 |
|------|------|------|------|
| `limit` | integer | 否 | 返回事件數量 (默認: 200, 最大: 500) |

**響應示例:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "event-456",
        "user_id": "demo-user",
        "event": "NOTE_CREATED",
        "target_type": "note",
        "target_id": "123",
        "ts": 1756211738684,
        "props": "{\"source\":\"ai\"}"
      }
    ]
  }
}
```

---

## 🤖 AI 筆記生成 API

### 統一筆記生成

```http
POST /api/generate-notes
POST /api/unified-notes  # 別名
```

**請求體:**
```json
{
  "title": "我的 AI 筆記",
  "examSystem": "GSAT",
  "subject": "數學",
  "topic": "微積分",
  "detailLevel": "medium",
  "language": "zh-tw",
  "sources": {
    "youtube": ["https://youtube.com/watch?v=example"],
    "text": ["要轉換的文字內容"],
    "webpages": ["https://example.com"],
    "files": [
      {
        "name": "document.pdf",
        "size": 1024000,
        "type": "application/pdf",
        "data": "data:application/pdf;base64,..."
      }
    ]
  }
}
```

**響應示例:**
```json
{
  "success": true,
  "notes": "# 微積分筆記\n\n## 主要概念\n...",
  "title": "我的 AI 筆記",
  "exam_system": "GSAT",
  "subject": "數學",
  "topic": "微積分",
  "sources": [
    {
      "type": "youtube",
      "title": "微積分入門",
      "url": "https://youtube.com/watch?v=example"
    }
  ],
  "word_count": 1250,
  "processing_time": "calculated_on_frontend"
}
```

### YouTube 轉筆記

```http
POST /api/youtube-to-notes
```

**請求體:**
```json
{
  "url": "https://youtube.com/watch?v=example",
  "detail_level": "medium",
  "language": "zh-tw"
}
```

### PDF 轉筆記

```http
POST /api/pdf-to-notes
```

**請求體:** (multipart/form-data)
```
file: [PDF 文件]
detail_level: medium
language: zh-tw
```

### 文字轉筆記

```http
POST /api/text-to-notes
```

**請求體:**
```json
{
  "text": "要轉換的文字內容",
  "detail_level": "medium",
  "language": "zh-tw"
}
```

---

## 🎯 學習工具 API

### 從筆記生成閃卡

```http
POST /api/generate-flashcards-from-notes
```

**請求體:**
```json
{
  "notes": "筆記內容...",
  "count": 10,
  "difficulty": "medium",
  "language": "zh-tw"
}
```

**響應示例:**
```json
{
  "success": true,
  "flashcards": [
    {
      "id": 1,
      "question": "什麼是微積分？",
      "answer": "微積分是研究變化率的數學分支",
      "hint": "想想導數和積分",
      "difficulty": "easy",
      "category": "定義"
    }
  ]
}
```

### 從筆記生成測驗

```http
POST /api/generate-quiz-from-notes
```

**請求體:**
```json
{
  "notes": "筆記內容...",
  "count": 5,
  "difficulty": "medium",
  "language": "zh-tw"
}
```

**響應示例:**
```json
{
  "success": true,
  "quiz": [
    {
      "id": 1,
      "question": "微積分的基本定理是什麼？",
      "options": ["A) 導數定理", "B) 積分定理", "C) 極限定理", "D) 連續定理"],
      "correct": "B",
      "correct_text": "積分定理",
      "explanation": "微積分基本定理連接了導數和積分..."
    }
  ]
}
```

---

## 🔧 系統 API

### 健康檢查

```http
GET /healthz
```

**響應示例:**
```json
{
  "ok": true
}
```

### API 信息

```http
GET /
```

**響應示例:**
```json
{
  "message": "NexLearn AI Notes API",
  "version": "2.0.0",
  "endpoints": [
    "/api/v1/notes",
    "/api/v1/events",
    "/api/generate-notes",
    // ... 其他端點
  ]
}
```

---

## 🚨 錯誤處理

### 常見錯誤代碼

| 狀態碼 | 描述 | 示例 |
|--------|------|------|
| 400 | 請求錯誤 | 缺少必需參數 |
| 404 | 資源不存在 | 筆記不存在 |
| 500 | 服務器錯誤 | AI 服務暫時不可用 |

### 錯誤響應格式

```json
{
  "ok": false,
  "message": "Note not found"
}
```

---

## 🔐 認證

目前使用臨時的 Header 認證：

```http
X-User-Id: demo-user
X-Org-Id: your-org-id    # 可選
X-Course-Id: your-course-id    # 可選
```

**未來計劃**: JWT Token 認證

```http
Authorization: Bearer your-jwt-token
```

---

## 📝 數據模型

詳細的數據模型請參考 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 🧪 測試

### 使用 curl 測試

```bash
# 獲取筆記列表
curl -H "X-User-Id: demo-user" \
     http://localhost:5000/api/v1/notes

# 創建筆記
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-User-Id: demo-user" \
     -d '{"title":"測試筆記","content_md":"# 測試"}' \
     http://localhost:5000/api/v1/notes
```

### 使用 JavaScript 測試

```javascript
// 使用項目的 API 客戶端
import { listNotes, createNote } from '@/src/lib/api/notes'

// 獲取筆記
const notes = await listNotes()

// 創建筆記
const newNote = await createNote({
  title: '測試筆記',
  content_md: '# 測試筆記\n這是測試內容'
})
```

---

*此文檔會隨著 API 的更新而持續更新*
