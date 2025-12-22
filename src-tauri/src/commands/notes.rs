use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

use crate::db::connection::get_connection;
use crate::db::models::{insert_node_note_resource, insert_note, insert_notes_tree_node};
use crate::fs::notes::{create_note_file, delete_note_file};

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
