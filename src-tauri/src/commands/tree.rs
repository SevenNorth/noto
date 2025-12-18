use chrono::Utc;
use serde::Serialize;
use uuid::Uuid;

use crate::db::connection::get_connection;
use crate::db::models as db_models;
use rusqlite::params;

#[derive(Serialize)]
pub struct TreeNode {
    pub id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub scope: String,
    pub order_index: i64,
    pub description_note_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[tauri::command]
pub fn create_tree_node(
    name: String,
    scope: String,
    parent_id: Option<String>,
    order_index: Option<i64>,
) -> Result<String, String> {
    let now = Utc::now().timestamp();
    let node_id = Uuid::new_v4().to_string();

    // 验证 parent 是否存在（如果提供）
    let mut conn = get_connection().map_err(|e| e.to_string())?;
    if let Some(ref pid) = parent_id {
        {
            let mut stmt = conn
                .prepare("SELECT COUNT(1) FROM tree_nodes WHERE id = ?")
                .map_err(|e| e.to_string())?;
            let count: i64 = stmt
                .query_row(params![pid], |r| r.get(0))
                .map_err(|e| e.to_string())?;
            if count == 0 {
                return Err("parent node not found".to_string());
            }
        }
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let order = order_index.unwrap_or(0);
    db_models::insert_tree_node(
        &tx,
        &node_id,
        parent_id.as_deref(),
        &name,
        &scope,
        order,
        now,
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(node_id)
}

#[tauri::command]
pub fn update_tree_node(
    node_id: String,
    name: String,
    parent_id: Option<String>,
    order_index: Option<i64>,
) -> Result<(), String> {
    let now = Utc::now().timestamp();

    let mut conn = get_connection().map_err(|e| e.to_string())?;
    // 验证节点存在
    {
        let mut stmt = conn
            .prepare("SELECT COUNT(1) FROM tree_nodes WHERE id = ?")
            .map_err(|e| e.to_string())?;
        let count: i64 = stmt
            .query_row(params![&node_id], |r| r.get(0))
            .map_err(|e| e.to_string())?;
        if count == 0 {
            return Err("node not found".to_string());
        }
    }

    // 如果提供 parent，验证 parent 存在且不等于自身
    if let Some(ref pid) = parent_id {
        if pid == &node_id {
            return Err("parent cannot be the node itself".to_string());
        }
        {
            let mut stmt2 = conn
                .prepare("SELECT COUNT(1) FROM tree_nodes WHERE id = ?")
                .map_err(|e| e.to_string())?;
            let count2: i64 = stmt2
                .query_row(params![pid], |r| r.get(0))
                .map_err(|e| e.to_string())?;
            if count2 == 0 {
                return Err("parent node not found".to_string());
            }
        }
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let order = order_index.unwrap_or(0);

    db_models::update_tree_node(&tx, &node_id, parent_id.as_deref(), &name, order, now)
        .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_tree_node(node_id: String) -> Result<(), String> {
    let mut conn = get_connection().map_err(|e| e.to_string())?;

    // 检查是否有子节点
    {
        let mut stmt = conn
            .prepare("SELECT COUNT(1) FROM tree_nodes WHERE parent_id = ?")
            .map_err(|e| e.to_string())?;
        let child_count: i64 = stmt
            .query_row(params![&node_id], |r| r.get(0))
            .map_err(|e| e.to_string())?;
        if child_count > 0 {
            return Err("node has child nodes, delete them first".to_string());
        }
    }

    // 检查是否有挂载资源
    {
        let mut stmt2 = conn
            .prepare("SELECT COUNT(1) FROM node_resources WHERE node_id = ?")
            .map_err(|e| e.to_string())?;
        let res_count: i64 = stmt2
            .query_row(params![&node_id], |r| r.get(0))
            .map_err(|e| e.to_string())?;
        if res_count > 0 {
            return Err("node has resources mounted, remove them first".to_string());
        }
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    db_models::delete_tree_node(&tx, &node_id).map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn list_tree_nodes(scope: Option<String>) -> Result<Vec<TreeNode>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let mut nodes: Vec<TreeNode> = Vec::new();

    if let Some(s) = scope {
        let mut stmt = conn
            .prepare(
                "SELECT id, parent_id, name, scope, order_index, description_note_id, created_at, updated_at FROM tree_nodes WHERE scope = ? ORDER BY parent_id, order_index",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![s], |r| {
                Ok(TreeNode {
                    id: r.get(0)?,
                    parent_id: r.get(1)?,
                    name: r.get(2)?,
                    scope: r.get(3)?,
                    order_index: r.get(4)?,
                    description_note_id: r.get(5)?,
                    created_at: r.get(6)?,
                    updated_at: r.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            nodes.push(row.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn
            .prepare(
                "SELECT id, parent_id, name, scope, order_index, description_note_id, created_at, updated_at FROM tree_nodes ORDER BY parent_id, order_index",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |r| {
                Ok(TreeNode {
                    id: r.get(0)?,
                    parent_id: r.get(1)?,
                    name: r.get(2)?,
                    scope: r.get(3)?,
                    order_index: r.get(4)?,
                    description_note_id: r.get(5)?,
                    created_at: r.get(6)?,
                    updated_at: r.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            nodes.push(row.map_err(|e| e.to_string())?);
        }
    }

    Ok(nodes)
}
