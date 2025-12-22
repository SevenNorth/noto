use chrono::Utc;
use rusqlite::params;
use serde::Serialize;
use tauri::AppHandle;
use uuid::Uuid;

use crate::db::connection::get_connection;
use crate::db::models::{
    delete_snippet, get_snippet, insert_node_snippet_resource, insert_snippet,
    insert_snippets_tree_node, update_snippet,
};

#[derive(Serialize)]
pub struct SnippetDetail {
    pub id: String,
    pub title: String,
    pub language: Option<String>,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 创建 snippet，并在 snippets scope 下创建对应 tree_node + node_resources
#[tauri::command(rename_all = "snake_case")]
pub fn create_snippet(
    _app: AppHandle,
    title: String,
    language: Option<String>,
    content: String,
    parent_id: Option<String>,
) -> Result<(), String> {
    let now = Utc::now().timestamp();

    let snippet_id = Uuid::new_v4().to_string();
    let node_id = Uuid::new_v4().to_string();

    // 1. 打开数据库连接
    let mut conn = get_connection().map_err(|e| e.to_string())?;

    // 2. 开启 transaction
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 3. 插入 tree_nodes（Snippets Scope）
    insert_snippets_tree_node(
        &tx,
        &node_id,
        parent_id.as_deref(),
        &title,
        0, // order_index，暂固定
        now,
    )
    .map_err(|e| e.to_string())?;

    // 4. 插入 snippets
    insert_snippet(&tx, &snippet_id, &title, language.as_deref(), &content, now)
        .map_err(|e| e.to_string())?;

    // 5. 挂载 snippet 到 tree_node
    insert_node_snippet_resource(&tx, &node_id, &snippet_id, now).map_err(|e| e.to_string())?;

    // 6. 提交 transaction
    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

/// 获取 snippet 详情（不涉及 tree）
#[tauri::command(rename_all = "snake_case")]
pub fn get_snippet_detail(snippet_id: String) -> Result<SnippetDetail, String> {
    let mut conn = get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let (id, title, language, content, created_at, updated_at) =
        get_snippet(&tx, &snippet_id).map_err(|e| e.to_string())?;

    // 对于只读查询，可以不必须 commit，但这里保持一致性
    tx.commit().map_err(|e| e.to_string())?;

    Ok(SnippetDetail {
        id,
        title,
        language,
        content,
        created_at,
        updated_at,
    })
}

/// 更新 snippet 的标题 / 语言 / 内容
#[tauri::command(rename_all = "snake_case")]
pub fn update_snippet_detail(
    snippet_id: String,
    title: String,
    language: Option<String>,
    content: String,
) -> Result<(), String> {
    let now = Utc::now().timestamp();

    let mut conn = get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 先检查是否存在
    {
        let mut stmt = tx
            .prepare("SELECT COUNT(1) FROM snippets WHERE id = ?")
            .map_err(|e| e.to_string())?;
        let count: i64 = stmt
            .query_row(params![&snippet_id], |r| r.get(0))
            .map_err(|e| e.to_string())?;
        if count == 0 {
            return Err("snippet not found".to_string());
        }
    }

    update_snippet(&tx, &snippet_id, &title, language.as_deref(), &content, now)
        .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

/// 删除 snippet：会删除 snippets 表中的记录、对应 node_resources 记录，但不自动删除 tree_node
///
/// 让前端通过 tree API 删除 tree_node，可以复用现有「有子节点/有资源」校验逻辑。
#[tauri::command(rename_all = "snake_case")]
pub fn delete_snippet_only(snippet_id: String) -> Result<(), String> {
    let mut conn = get_connection().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 删除 node_resources 中引用该 snippet 的记录
    {
        let mut stmt = tx
            .prepare(
                "DELETE FROM node_resources WHERE resource_id = ? AND resource_type = 'snippet'",
            )
            .map_err(|e| e.to_string())?;
        stmt.execute(params![&snippet_id])
            .map_err(|e| e.to_string())?;
    }

    // 删除 snippet 本体
    delete_snippet(&tx, &snippet_id).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}
