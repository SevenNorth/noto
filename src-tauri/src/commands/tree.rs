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
    pub node_type: String,
    pub scope: String,
    pub order_index: i64,
    pub description_note_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_tree_node(
    name: String,
    node_type: String,
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
        &node_type,
        &scope,
        order,
        now,
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok(node_id)
}

#[tauri::command(rename_all = "snake_case")]
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

#[tauri::command(rename_all = "snake_case")]
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

#[derive(serde::Serialize)]
pub struct TreeResponseNode {
    pub id: String,
    pub label: String,
    pub node_type: String,
    pub children: Option<Vec<TreeResponseNode>>,
}

#[tauri::command(rename_all = "snake_case")]
pub fn list_tree_nodes(scope: Option<String>) -> Result<Vec<TreeNode>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let mut nodes: Vec<TreeNode> = Vec::new();

    if let Some(s) = scope {
        let mut stmt = conn
            .prepare(
                "SELECT id, parent_id, name, node_type, scope, order_index, description_note_id, created_at, updated_at FROM tree_nodes WHERE scope = ? ORDER BY parent_id, order_index",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![s], |r| {
                Ok(TreeNode {
                    id: r.get(0)?,
                    parent_id: r.get(1)?,
                    name: r.get(2)?,
                    node_type: r.get(3)?,
                    scope: r.get(4)?,
                    order_index: r.get(5)?,
                    description_note_id: r.get(6)?,
                    created_at: r.get(7)?,
                    updated_at: r.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            nodes.push(row.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn
            .prepare(
                "SELECT id, parent_id, name, node_type, scope, order_index, description_note_id, created_at, updated_at FROM tree_nodes ORDER BY parent_id, order_index",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |r| {
                Ok(TreeNode {
                    id: r.get(0)?,
                    parent_id: r.get(1)?,
                    name: r.get(2)?,
                    node_type: r.get(3)?,
                    scope: r.get(4)?,
                    order_index: r.get(5)?,
                    description_note_id: r.get(6)?,
                    created_at: r.get(7)?,
                    updated_at: r.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            nodes.push(row.map_err(|e| e.to_string())?);
        }
    }

    Ok(nodes)
}

#[tauri::command(rename_all = "snake_case")]
pub fn list_tree_nodes_tree(scope: Option<String>) -> Result<Vec<TreeResponseNode>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    // 读取扁平节点
    let mut rows: Vec<(String, Option<String>, String, String, i64)> = Vec::new();
    if let Some(s) = scope {
        let mut stmt = conn
            .prepare("SELECT id, parent_id, name, node_type, order_index FROM tree_nodes WHERE scope = ?")
            .map_err(|e| e.to_string())?;
        let mapped = stmt
            .query_map(params![s], |r| {
                Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
            })
            .map_err(|e| e.to_string())?;
        for row in mapped {
            rows.push(row.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn
            .prepare("SELECT id, parent_id, name, node_type, order_index FROM tree_nodes")
            .map_err(|e| e.to_string())?;
        let mapped = stmt
            .query_map([], |r| {
                Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
            })
            .map_err(|e| e.to_string())?;
        for row in mapped {
            rows.push(row.map_err(|e| e.to_string())?);
        }
    }

    use std::collections::HashMap;

    // 构建 id -> (name, parent, node_type, order)
    let mut meta: HashMap<String, (Option<String>, String, String, i64)> = HashMap::new();
    for (id, parent, name, node_type, order) in rows.iter() {
        meta.insert(
            id.clone(),
            (parent.clone(), name.clone(), node_type.clone(), *order),
        );
    }

    // parent -> children ids
    let mut children_map: HashMap<Option<String>, Vec<String>> = HashMap::new();
    for (id, parent, _name, _node_type, _order) in rows.iter() {
        children_map
            .entry(parent.clone())
            .or_default()
            .push(id.clone());
    }

    // sort children by order_index
    for (_parent, child_ids) in children_map.iter_mut() {
        child_ids.sort_by_key(|cid| meta.get(cid).map(|t| t.3).unwrap_or(0));
    }

    // build nodes recursively with cycle protection
    fn build(
        id: &String,
        meta: &HashMap<String, (Option<String>, String, String, i64)>,
        children_map: &HashMap<Option<String>, Vec<String>>,
        visiting: &mut std::collections::HashSet<String>,
    ) -> TreeResponseNode {
        if visiting.contains(id) {
            // cycle detected — stop the recursion
            return TreeResponseNode {
                id: id.clone(),
                label: meta.get(id).map(|t| t.1.clone()).unwrap_or_default(),
                node_type: meta.get(id).map(|t| t.2.clone()).unwrap_or_default(),
                children: None,
            };
        }
        visiting.insert(id.clone());

        let label = meta.get(id).map(|t| t.1.clone()).unwrap_or_default();
        let node_type = meta.get(id).map(|t| t.2.clone()).unwrap_or_default();
        let child_ids = children_map.get(&Some(id.clone()));
        let mut children_vec: Vec<TreeResponseNode> = Vec::new();
        if let Some(child_ids) = child_ids {
            for cid in child_ids {
                children_vec.push(build(cid, meta, children_map, visiting));
            }
        }

        visiting.remove(id);

        TreeResponseNode {
            id: id.clone(),
            label,
            node_type,
            children: if children_vec.is_empty() {
                None
            } else {
                Some(children_vec)
            },
        }
    }

    // roots are children_map[None]
    let mut roots: Vec<TreeResponseNode> = Vec::new();
    if let Some(root_ids) = children_map.get(&None) {
        let mut visiting = std::collections::HashSet::new();
        for rid in root_ids {
            roots.push(build(rid, &meta, &children_map, &mut visiting));
        }
    } else {
        // No explicit roots: treat nodes without parent or invalid parent as roots
        let mut root_candidates: Vec<String> = Vec::new();
        for (id, (parent, _name, _node_type, _order)) in meta.iter() {
            if parent.is_none() || !meta.contains_key(parent.as_ref().unwrap()) {
                root_candidates.push(id.clone());
            }
        }
        let mut visiting = std::collections::HashSet::new();
        root_candidates.sort_by_key(|id| meta.get(id).map(|t| t.3).unwrap_or(0));
        for rid in root_candidates {
            roots.push(build(&rid, &meta, &children_map, &mut visiting));
        }
    }

    Ok(roots)
}
