use chrono::Utc;
use rusqlite::params;
use serde::Serialize;
use tauri::AppHandle;
use uuid::Uuid;

use crate::db::connection::get_connection;

#[derive(Serialize)]
pub struct TaskDetail {
    pub id: String,
    pub node_id: String,
    pub title: String,
    pub status: String,
    pub priority: i64,
    pub due_date: Option<i64>,
    pub description: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 列出某个项目下的所有任务
#[tauri::command(rename_all = "snake_case")]
pub fn list_tasks(node_id: String) -> Result<Vec<TaskDetail>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, node_id, title, status, priority, due_date, description, created_at, updated_at FROM tasks WHERE node_id = ? ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![node_id], |r| {
            Ok(TaskDetail {
                id: r.get(0)?,
                node_id: r.get(1)?,
                title: r.get(2)?,
                status: r.get(3)?,
                priority: r.get(4)?,
                due_date: r.get(5)?,
                description: r.get(6)?,
                created_at: r.get(7)?,
                updated_at: r.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tasks = Vec::new();
    for t in rows {
        tasks.push(t.map_err(|e| e.to_string())?);
    }
    Ok(tasks)
}

/// 创建任务，返回新 id
#[tauri::command(rename_all = "snake_case")]
pub fn create_task(
    _app: AppHandle,
    node_id: String,
    title: String,
    status: Option<String>,
    priority: Option<i64>,
    due_date: Option<i64>,
    description: Option<String>,
) -> Result<String, String> {
    let now = Utc::now().timestamp();
    let task_id = Uuid::new_v4().to_string();

    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO tasks (id, node_id, title, status, priority, due_date, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            &task_id,
            &node_id,
            &title,
            status.unwrap_or_else(|| "todo".to_string()),
            priority.unwrap_or(0),
            due_date,
            description,
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(task_id)
}

/// 获取单个任务
#[tauri::command(rename_all = "snake_case")]
pub fn get_task(task_id: String) -> Result<TaskDetail, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, node_id, title, status, priority, due_date, description, created_at, updated_at FROM tasks WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let row = stmt
        .query_row(params![task_id.clone()], |r| {
            Ok(TaskDetail {
                id: r.get(0)?,
                node_id: r.get(1)?,
                title: r.get(2)?,
                status: r.get(3)?,
                priority: r.get(4)?,
                due_date: r.get(5)?,
                description: r.get(6)?,
                created_at: r.get(7)?,
                updated_at: r.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(row)
}

/// 更新任务
#[tauri::command(rename_all = "snake_case")]
pub fn update_task(
    task_id: String,
    title: Option<String>,
    status: Option<String>,
    priority: Option<i64>,
    due_date: Option<i64>,
    description: Option<String>,
) -> Result<(), String> {
    let now = Utc::now().timestamp();
    let conn = get_connection().map_err(|e| e.to_string())?;

    // simple update using COALESCE for optional fields
    conn.execute(
        "UPDATE tasks SET title = COALESCE(?, title), status = COALESCE(?, status), priority = COALESCE(?, priority), due_date = ?, description = ?, updated_at = ? WHERE id = ?",
        params![
            title,
            status,
            priority,
            due_date,
            description,
            now,
            task_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// 删除任务
#[tauri::command(rename_all = "snake_case")]
pub fn delete_task(task_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?", params![task_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
