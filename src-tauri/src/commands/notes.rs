use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

use crate::db::connection::get_connection;
use crate::db::models::{insert_node_note_resource, insert_note, insert_notes_tree_node};
use crate::fs::notes::{create_note_file, delete_note_file};
use rusqlite::params;
use serde::Serialize;
use std::fs;

#[tauri::command(rename_all = "snake_case")]
pub fn create_note(app: AppHandle, title: String, parent_id: Option<String>) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp();

    let note_id = Uuid::new_v4().to_string();
    let node_id = Uuid::new_v4().to_string();

    // 1. 先创建 Markdown 文件（失败直接返回）
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let note_file_path =
        create_note_file(&app_data_dir, &note_id, &title).map_err(|e| e.to_string())?;

    // 2. 打开数据库连接
    let mut conn = get_connection().map_err(|e| e.to_string())?;

    // 3. 开启 transaction
    let tx = conn.transaction().map_err(|e| {
        delete_note_file(&note_file_path);
        e.to_string()
    })?;

    // 4. 插入 tree_nodes（Notes Scope）
    if let Err(e) = insert_notes_tree_node(&tx, &node_id, parent_id.as_deref(), &title, 0, now) {
        delete_note_file(&note_file_path);
        return Err(e.to_string());
    }

    // 5. 插入 notes
    if let Err(e) = insert_note(
        &tx,
        &note_id,
        &title,
        note_file_path.to_string_lossy().as_ref(),
        now,
    ) {
        delete_note_file(&note_file_path);
        return Err(e.to_string());
    }

    // 6. 将 Note 挂载到该 tree_node（关键新增）
    if let Err(e) = insert_node_note_resource(&tx, &node_id, &note_id, now) {
        delete_note_file(&note_file_path);
        return Err(e.to_string());
    }

    // 7. 提交 transaction
    if let Err(e) = tx.commit() {
        delete_note_file(&note_file_path);
        return Err(e.to_string());
    }

    Ok(())
}

#[derive(Serialize)]
pub struct NoteDetail {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 获取笔记详情（标题 + 内容）
#[tauri::command(rename_all = "snake_case")]
pub fn get_note(note_id: String) -> Result<NoteDetail, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, content_path, created_at, updated_at FROM notes WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let row = stmt
        .query_row(params![note_id], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, i64>(3)?,
                r.get::<_, i64>(4)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let content = fs::read_to_string(&row.2).map_err(|e| e.to_string())?;

    Ok(NoteDetail {
        id: row.0,
        title: row.1,
        content,
        created_at: row.3,
        updated_at: row.4,
    })
}

/// 更新笔记标题，并同步树节点名称
#[tauri::command(rename_all = "snake_case")]
pub fn update_note_title(note_id: String, title: String) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp();
    let mut conn = get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1) 更新 notes 标题/更新时间
    tx.execute(
        "UPDATE notes SET title = ?, updated_at = ? WHERE id = ?",
        params![title, now, note_id],
    )
    .map_err(|e| e.to_string())?;

    // 2) 找到挂载该 note 的树节点并同步名称/更新时间
    tx.execute(
        r#"
        UPDATE tree_nodes
        SET name = ?, updated_at = ?
        WHERE id IN (
            SELECT node_id FROM node_resources
            WHERE resource_type = 'note' AND resource_id = ?
        )
        "#,
        params![title, now, note_id],
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

/// 更新笔记内容，并更新 notes.updated_at
#[tauri::command(rename_all = "snake_case")]
pub fn update_note_content(note_id: String, content: String) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp();
    let conn = get_connection().map_err(|e| e.to_string())?;

    // 获取内容路径
    let mut stmt = conn
        .prepare("SELECT content_path FROM notes WHERE id = ?")
        .map_err(|e| e.to_string())?;
    let content_path: String = stmt
        .query_row(params![note_id.clone()], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    // 写文件
    fs::write(&content_path, content).map_err(|e| e.to_string())?;

    // 更新 updated_at
    conn.execute(
        "UPDATE notes SET updated_at = ? WHERE id = ?",
        params![now, note_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
