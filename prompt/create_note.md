# create_note 功能实现 · 专用提示词

你是一个**精通 Tauri v2 + Rust + SQLite 的工程顾问**，请协助我实现桌面应用中的第一个真实业务功能：**创建笔记（create_note）**。

---

## 一、当前上下文

- 使用 Tauri v2
- 后端：Rust
- 数据库：SQLite（rusqlite，bundled）
- 本地数据目录：
  AppData/Roaming/com.sevennorth.noto/
- 已完成：
- 目录初始化（notes / attachments / cache）
- db.sqlite 创建
- schema.sql 幂等执行

---

## 二、功能目标：create_note

实现一个 **Tauri command：`create_note`**，完成以下行为：

1. 在 `tree_nodes` 中创建一个节点：
 - `node_type = 'note'`
 - 支持 `parent_id`
2. 在 `notes` 表中创建记录
3. 在文件系统中创建对应的 Markdown 文件
4. 建立 node ↔ note ↔ file 的关联关系

---

## 三、数据一致性要求

- SQLite 写入与文件创建必须逻辑一致
- 若中途失败：
- 不留下孤儿 DB 记录
- 不留下孤儿文件
- 推荐使用 transaction + 明确错误处理

---

## 四、数据模型假设

### tree_nodes

- `id TEXT PRIMARY KEY`
- `parent_id TEXT`
- `node_type TEXT`
- `title TEXT`
- `order_index INTEGER`
- `created_at INTEGER`
- `updated_at INTEGER`

### notes

- `id TEXT PRIMARY KEY`
- `node_id TEXT`
- `file_path TEXT`
- `created_at INTEGER`
- `updated_at INTEGER`

---

## 五、文件存储规则

- Markdown 文件路径：
app_data_dir/notes/<note_id>.md
- 初始内容：
```md
# Note Title

```

## 六、你需要输出的内容
请一步到位给我：
  - #[tauri::command] fn create_note(...)
  - 数据库 transaction 插入逻辑
  - Markdown 文件创建代码
  - 错误处理策略说明
  - 关键实现顺序说明（先 DB 还是先文件）

## 七、最终目标
调用 create_note(title, parent_id) 后：
  UI 树中出现新 Note
  本地文件系统中出现对应 .md 文件
