# Database Schema - NexLearn.ai

這份文檔描述了 NexLearn.ai 平台的數據庫模式和數據結構。

## 📊 數據庫概覽

- **主數據庫**: SQLite (開發) / PostgreSQL (生產)
- **ORM**: SQLAlchemy 2.x
- **ID 生成**: 自增整數 (可擴展為 ULID/UUIDv7)
- **時間戳**: Epoch 毫秒 (integer)
- **軟刪除**: 支持，使用 `deleted_at` 字段

---

## 📝 Notes 表

主要的筆記存儲表，支持多租戶架構。

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(255) NOT NULL,
    org_id VARCHAR(255),                    -- 組織 ID (多租戶)
    course_id VARCHAR(255),                 -- 課程 ID
    folder_id VARCHAR(255),                 -- 資料夾 ID
    title VARCHAR(500) NOT NULL,
    content TEXT,                           -- 舊版兼容字段
    content_md TEXT,                        -- Markdown 內容
    content_json TEXT,                      -- JSON 格式內容 (BlockNote)
    tags TEXT,                              -- JSON 數組字符串
    status VARCHAR(50) DEFAULT 'draft',     -- draft, active, archived
    language VARCHAR(10) DEFAULT 'zh-tw',
    exam_system VARCHAR(100),               -- GSAT, TOEFL, etc.
    subject VARCHAR(100),                   -- 科目
    topic VARCHAR(200),                     -- 主題
    created_at INTEGER NOT NULL,            -- Epoch 毫秒
    updated_at INTEGER NOT NULL,            -- Epoch 毫秒
    deleted_at INTEGER                      -- 軟刪除時間戳
);

-- 索引
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_org_course ON notes(org_id, course_id);
CREATE INDEX idx_notes_deleted ON notes(deleted_at);
```

### 字段說明

| 字段 | 類型 | 必需 | 描述 |
|------|------|------|------|
| `id` | INTEGER | ✓ | 主鍵，自增 |
| `user_id` | VARCHAR(255) | ✓ | 用戶 ID |
| `org_id` | VARCHAR(255) | | 組織 ID，支持多租戶 |
| `course_id` | VARCHAR(255) | | 課程 ID |
| `folder_id` | VARCHAR(255) | | 資料夾 ID，支持階層組織 |
| `title` | VARCHAR(500) | ✓ | 筆記標題 |
| `content` | TEXT | | 舊版兼容內容字段 |
| `content_md` | TEXT | | Markdown 格式內容 |
| `content_json` | TEXT | | BlockNote JSON 格式 |
| `tags` | TEXT | | JSON 字符串數組，如 `["AI","學習"]` |
| `status` | VARCHAR(50) | | `draft`, `active`, `archived` |
| `language` | VARCHAR(10) | | 語言代碼，默認 `zh-tw` |
| `exam_system` | VARCHAR(100) | | 考試系統，如 `GSAT`, `TOEFL` |
| `subject` | VARCHAR(100) | | 科目，如 `數學`, `英文` |
| `topic` | VARCHAR(200) | | 主題，如 `微積分`, `文法` |
| `created_at` | INTEGER | ✓ | 創建時間 (epoch ms) |
| `updated_at` | INTEGER | ✓ | 更新時間 (epoch ms) |
| `deleted_at` | INTEGER | | 刪除時間 (epoch ms)，NULL 表示未刪除 |

### 數據示例

```json
{
  "id": 123,
  "user_id": "user_abc123",
  "org_id": "nexlearn_org",
  "course_id": "math_101",
  "folder_id": "calculus_notes",
  "title": "微積分基礎概念",
  "content": "微積分是數學的重要分支...",
  "content_md": "# 微積分基礎概念\n\n## 導數\n導數描述函數的變化率...",
  "content_json": "{\"type\":\"doc\",\"content\":[...]}",
  "tags": "[\"數學\",\"微積分\",\"導數\"]",
  "status": "active",
  "language": "zh-tw",
  "exam_system": "GSAT",
  "subject": "數學",
  "topic": "微積分",
  "created_at": 1756211738684,
  "updated_at": 1756211738695,
  "deleted_at": null
}
```

---

## 📊 Events 表

事件追蹤表，用於記錄用戶行為和系統事件。

```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(255) NOT NULL,
    org_id VARCHAR(255),                    -- 組織 ID
    event VARCHAR(100) NOT NULL,            -- 事件類型
    target_type VARCHAR(50),                -- 目標類型
    target_id VARCHAR(255),                 -- 目標 ID
    ts INTEGER NOT NULL,                    -- 時間戳 (epoch ms)
    props TEXT                              -- JSON 格式的事件屬性
);

-- 索引
CREATE INDEX idx_events_user_ts ON events(user_id, ts DESC);
CREATE INDEX idx_events_type ON events(event);
CREATE INDEX idx_events_target ON events(target_type, target_id);
CREATE INDEX idx_events_org ON events(org_id);
```

### 字段說明

| 字段 | 類型 | 必需 | 描述 |
|------|------|------|------|
| `id` | INTEGER | ✓ | 主鍵，自增 |
| `user_id` | VARCHAR(255) | ✓ | 用戶 ID |
| `org_id` | VARCHAR(255) | | 組織 ID |
| `event` | VARCHAR(100) | ✓ | 事件類型 |
| `target_type` | VARCHAR(50) | | 目標對象類型 |
| `target_id` | VARCHAR(255) | | 目標對象 ID |
| `ts` | INTEGER | ✓ | 事件時間戳 (epoch ms) |
| `props` | TEXT | | JSON 格式的額外屬性 |

### 常見事件類型

| 事件類型 | 描述 | target_type | 示例 props |
|----------|------|-------------|------------|
| `NOTE_CREATED` | 筆記創建 | `note` | `{"source":"ai","word_count":500}` |
| `NOTE_UPDATED` | 筆記更新 | `note` | `{"fields_changed":["title","content"]}` |
| `NOTE_DELETED` | 筆記刪除 | `note` | `{"deletion_type":"soft"}` |
| `NOTE_VIEWED` | 筆記查看 | `note` | `{"view_duration":30000}` |
| `AI_GENERATION` | AI 生成 | `generation` | `{"model":"gpt-4","tokens":1200}` |
| `FLASHCARD_CREATED` | 閃卡創建 | `flashcard` | `{"source_note_id":"123"}` |
| `QUIZ_COMPLETED` | 測驗完成 | `quiz` | `{"score":85,"time_spent":300}` |
| `USER_LOGIN` | 用戶登入 | `session` | `{"login_method":"email"}` |

### 數據示例

```json
{
  "id": 456,
  "user_id": "user_abc123", 
  "org_id": "nexlearn_org",
  "event": "NOTE_CREATED",
  "target_type": "note",
  "target_id": "123",
  "ts": 1756211738684,
  "props": "{\"source\":\"ai\",\"word_count\":500,\"processing_time\":\"5.2s\"}"
}
```

---

## 🔄 數據庫操作

### 安全的列添加

系統使用 `sqlite_helpers.py` 來安全地添加新列：

```python
from utils.sqlite_helpers import ensure_note_columns

# 自動檢查和添加缺失的列
ensure_note_columns(database_url)
```

支持的列檢查：
- `org_id`, `course_id`, `folder_id` (多租戶支持)
- `content_md`, `content_json` (新內容格式)
- `tags`, `status`, `language` (元數據)
- `exam_system`, `subject`, `topic` (分類)
- `deleted_at` (軟刪除)

### 查詢示例

```python
from sqlalchemy import and_, or_, desc
from models import Note, Event

# 獲取用戶的活躍筆記
notes = session.query(Note).filter(
    and_(
        Note.user_id == user_id,
        Note.deleted_at.is_(None),
        Note.status == 'active'
    )
).order_by(desc(Note.updated_at)).all()

# 按標籤搜索
notes_with_tag = session.query(Note).filter(
    and_(
        Note.user_id == user_id,
        Note.tags.contains('"AI"'),  # JSON 包含檢查
        Note.deleted_at.is_(None)
    )
).all()

# 獲取最近事件
recent_events = session.query(Event).filter(
    Event.user_id == user_id
).order_by(desc(Event.ts)).limit(50).all()
```

---

## 🚀 擴展性設計

### 多租戶支持

系統設計支持多層級的數據隔離：

```
Organization (org_id)
  └── Course (course_id) 
      └── Folder (folder_id)
          └── Note (id)
```

### 未來擴展

計劃支持的額外表：

```sql
-- 用戶表
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    settings TEXT,  -- JSON
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 組織表  
CREATE TABLE organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    settings TEXT,  -- JSON
    created_at INTEGER NOT NULL
);

-- 課程表
CREATE TABLE courses (
    id VARCHAR(255) PRIMARY KEY,
    org_id VARCHAR(255) REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings TEXT,  -- JSON
    created_at INTEGER NOT NULL
);

-- 閃卡表
CREATE TABLE flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER REFERENCES notes(id),
    user_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    hint TEXT,
    difficulty VARCHAR(20),
    created_at INTEGER NOT NULL
);

-- 測驗表
CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER REFERENCES notes(id),
    user_id VARCHAR(255) NOT NULL,
    questions TEXT NOT NULL,  -- JSON
    settings TEXT,            -- JSON  
    created_at INTEGER NOT NULL
);
```

---

## 🔧 維護和優化

### 性能優化

1. **索引策略**: 基於查詢模式添加復合索引
2. **數據清理**: 定期清理軟刪除的舊數據
3. **分頁**: 使用游標分頁而非 OFFSET
4. **緩存**: 熱點數據的 Redis 緩存

### 備份策略

```bash
# SQLite 備份
sqlite3 nexlearn.db ".backup backup.db"

# PostgreSQL 備份
pg_dump nexlearn > backup.sql
```

### 監控指標

- 數據庫連接數
- 查詢執行時間
- 表大小增長
- 索引使用率

---

## 🔐 安全考慮

### 數據隔離

- 所有查詢都包含 `user_id` 過濾
- 多租戶數據通過 `org_id` 隔離
- Row Level Security (RLS) 支持

### 數據驗證

- JSON 字段的結構驗證
- 字符串長度限制
- SQL 注入防護

### 敏感數據

- 不存儲用戶密碼 (使用外部認證)
- 加密存儲敏感內容
- 審計日誌記錄

---

*此文檔會隨著數據庫模式的演進而更新*
