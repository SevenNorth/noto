use tauri::AppHandle;
use uuid::Uuid;

use crate::db::connection::get_connection;
use crate::db::models::{insert_node_snippet_resource, insert_snippet, insert_snippets_tree_node};

#[tauri::command]
pub fn create_snippet(
    _app: AppHandle,
    title: String,
    language: Option<String>,
    content: String,
    parent_id: Option<String>,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp();

    let snippet_id = Uuid::new_v4().to_string();
    let node_id = Uuid::new_v4().to_string();

    // 1. 打开数据库连接
    let conn = get_connection().map_err(|e| e.to_string())?;

    // 2. 开启 transaction
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 3. 插入 tree_nodes（Snippets Scope）
    if let Err(e) = insert_snippets_tree_node(
        &tx,
        &node_id,
        parent_id.as_deref(),
        &title,
        0, // order_index，暂固定
        now,
    ) {
        return Err(e.to_string());
    }

    // 4. 插入 snippets
    if let Err(e) = insert_snippet(&tx, &snippet_id, &title, language.as_deref(), &content, now) {
        return Err(e.to_string());
    }

    // 5. 挂载 snippet 到 tree_node
    if let Err(e) = insert_node_snippet_resource(&tx, &node_id, &snippet_id, now) {
        return Err(e.to_string());
    }

    // 6. 提交 transaction
    if let Err(e) = tx.commit() {
        return Err(e.to_string());
    }

    Ok(())
}
