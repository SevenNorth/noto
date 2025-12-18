# 项目总提示词（Project Brief）

你是一个**熟悉 Tauri v2 + Rust + SQLite 的工程顾问**，正在协助我开发一个**本地优先（offline-first）的桌面生产力应用**，目标类似「个人知识管理 + 项目管理系统」。

---

## 一、核心目标

使用 **Tauri v2** 构建一个跨平台桌面应用，主要功能包括：

1. **记事本（Notes）**
   - 使用 **Markdown 文件存储**
   - 支持分组
   - 可挂载到项目下
2. **代码片段（Snippets）**
   - 支持语言标签
   - 可独立分组，也可挂载到项目
3. **项目管理（Projects）**
   - 树状结构
   - 支持子项目 / 任务
   - 任务支持 **手动录入多段工作时间 + 工作描述**
   - 可统计项目 / 任务总用时
4. **统一树结构**
   - 项目 / 子项目 / 任务 / note / snippet 统一在一棵树中展示
   - 支持拖拽排序
   - 支持引用 / 挂载（同一 note/snippet 可在多个视图出现）

---

## 二、核心数据模型（已确定）

### 1. tree_nodes（统一树节点）

- 表示所有节点：project / task / note / snippet
- 关键字段：
  - `id`
  - `parent_id`
  - `scope` -- 'project' | 'notes' | 'snippets'
  - `title`
  - `order_index`（用于拖拽排序）
  - `created_at`
  - `updated_at`

### 2. 业务表

- `notes`
- `snippets`
- `tasks`
- `time_entries`（任务多段工时）
- `node_resources`（树节点与 note/snippet 的引用关系）

> note / snippet：
> - 可以独立存在
> - 也可以通过“挂载（引用）”出现在项目下

---

## 三、存储策略（已确认）

- **结构数据**：SQLite
- **内容本体**：
  - Notes / Snippets → Markdown 文件
- SQLite 中只存：
  - 元信息
  - 文件路径
  - 引用关系

---

## 四、后端实现现状（已完成）

### 技术栈

- Tauri v2
- Rust
- SQLite（rusqlite + bundled）
- Windows 开发环境

### 已完成事项

1. Tauri v2 项目初始化
2. 正确使用：
   - `.setup(|app: &mut App| {})`
   - `app.handle()`
   - `AppHandle.path().app_data_dir()`
3. Windows AppData 路径确认：
    C:\Users<User>\AppData\Roaming\com.sevennorth.noto
4. 应用启动自动初始化：
- 创建目录（notes / attachments / cache）
- 创建 `db.sqlite`
5. SQLite schema 初始化：
- `schema.sql`
- 所有 `CREATE TABLE / INDEX` 使用 `IF NOT EXISTS`
- 启动幂等，不 panic
6. 已解决常见问题：
- Tauri v2 路径 API 变更
- App / AppHandle 类型不匹配
- SQLite 重复建表 panic

---

## 五、当前状态总结

> 后端基础设施已稳定跑通，可以安全进入业务功能开发阶段。

---

## 六、下一步计划（推荐顺序）

1. **实现 create_note**
2. 扩展 create_snippet
3. tree_nodes 通用 CRUD
4. 拖拽排序（order_index）
5. 任务工时录入与统计
