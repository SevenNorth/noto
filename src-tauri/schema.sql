-- =====================================================
-- Final Database Schema (SQLite)
-- App: Tauri Desktop App (Projects / Notes / Snippets)
-- =====================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- 1. Tree Nodes (structure / folders)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tree_nodes (
  id TEXT PRIMARY KEY,
  parent_id TEXT,

  name TEXT NOT NULL,
  scope TEXT NOT NULL,         -- 'projects' | 'notes' | 'snippets'

  order_index INTEGER NOT NULL DEFAULT 0, -- ordering among siblings
         -- 'projects' | 'notes' | 'snippets'

  description_note_id TEXT,    -- optional: projects description

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (parent_id) REFERENCES tree_nodes(id),
  FOREIGN KEY (description_note_id) REFERENCES notes(id)
);

CREATE INDEX IF NOT EXISTS idx_tree_nodes_parent
ON tree_nodes(parent_id);

CREATE INDEX IF NOT EXISTS idx_tree_nodes_scope
ON tree_nodes(scope);

CREATE INDEX IF NOT EXISTS idx_tree_nodes_parent_order
ON tree_nodes(parent_id, order_index);

-- -----------------------------------------------------
-- 2. Tasks (execution units)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,       -- belongs to a tree_node (scope=projects)

  title TEXT NOT NULL,
  status TEXT NOT NULL,        -- 'todo' | 'doing' | 'done'
  priority INTEGER DEFAULT 0,
  due_date INTEGER,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (node_id) REFERENCES tree_nodes(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_node
ON tasks(node_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
ON tasks(status);

-- -----------------------------------------------------
-- 3. Time Entries (work logs)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,

  work_date INTEGER NOT NULL,  -- day start timestamp (00:00)
  duration INTEGER NOT NULL,   -- seconds
  description TEXT NOT NULL,

  start_time INTEGER,
  end_time INTEGER,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'timer'

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX IF NOT EXISTS idx_time_entries_task
ON time_entries(task_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_work_date
ON time_entries(work_date);

-- -----------------------------------------------------
-- 4. Notes (markdown documents)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_path TEXT NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- -----------------------------------------------------
-- 5. Snippets (code snippets)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT,
  content TEXT NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- -----------------------------------------------------
-- 6. Node Resources (attachments / references)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS node_resources (
  node_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,   -- 'note' | 'snippet'

  created_at INTEGER NOT NULL,

  PRIMARY KEY (node_id, resource_id, resource_type),
  FOREIGN KEY (node_id) REFERENCES tree_nodes(id)
);

CREATE INDEX IF NOT EXISTS idx_node_resources_node
ON node_resources(node_id);

CREATE INDEX IF NOT EXISTS idx_node_resources_resource
ON node_resources(resource_id, resource_type);

-- =====================================================
-- End of schema
-- =====================================================
