use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::connection::get_connection;

#[derive(Serialize, Deserialize)]
pub struct TimeEntry {
    pub id: String,
    pub task_id: String,
    pub work_date: i64,
    pub duration: i64,
    pub description: String,
    pub start_time: Option<i64>,
    pub end_time: Option<i64>,
    pub source: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[tauri::command(rename_all = "snake_case")]
pub fn list_time_entries(task_id: String) -> Result<Vec<TimeEntry>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, task_id, work_date, duration, description, start_time, end_time, source, created_at, updated_at FROM time_entries WHERE task_id = ? ORDER BY work_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![task_id], |r| {
            Ok(TimeEntry {
                id: r.get(0)?,
                task_id: r.get(1)?,
                work_date: r.get(2)?,
                duration: r.get(3)?,
                description: r.get(4)?,
                start_time: r.get(5)?,
                end_time: r.get(6)?,
                source: r.get(7)?,
                created_at: r.get(8)?,
                updated_at: r.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for e in rows {
        entries.push(e.map_err(|e| e.to_string())?);
    }
    Ok(entries)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_time_entry(
    task_id: String,
    work_date: i64,
    duration: i64,
    description: String,
    start_time: Option<i64>,
    end_time: Option<i64>,
    source: Option<String>,
) -> Result<String, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().timestamp_millis();
    let source = source.unwrap_or_else(|| "manual".to_string());

    conn.execute(
        "INSERT INTO time_entries (id, task_id, work_date, duration, description, start_time, end_time, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            id,
            task_id,
            work_date,
            duration,
            description,
            start_time,
            end_time,
            source,
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_time_entry(entry_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM time_entries WHERE id = ?", params![entry_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_time_entry(
    entry_id: String,
    duration: i64,
    description: String,
) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp_millis();

    conn.execute(
        "UPDATE time_entries SET duration = ?, description = ?, updated_at = ? WHERE id = ?",
        params![duration, description, now, entry_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
