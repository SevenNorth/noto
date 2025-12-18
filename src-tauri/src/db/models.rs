use rusqlite::{params, Transaction};

/// 插入一条 note 记录
///
/// ⚠️ 注意：
/// - 不创建 transaction
/// - 不处理文件系统
/// - 由上层保证一致性
pub fn insert_note(
    tx: &Transaction,
    note_id: &str,
    title: &str,
    content_path: &str,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO notes (
            id,
            title,
            content_path,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        "#,
        params![note_id, title, content_path, now, now],
    )?;

    Ok(())
}

/// 插入一个 tree_node（Notes Scope）
///
/// 约定：
/// - scope 固定为 'notes'
pub fn insert_notes_tree_node(
    tx: &Transaction,
    node_id: &str,
    parent_id: Option<&str>,
    name: &str,
    order_index: i64,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO tree_nodes (
            id,
            parent_id,
            name,
            scope,
            order_index,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, 'notes', ?, ?, ?)
        "#,
        params![node_id, parent_id, name, order_index, now, now],
    )?;

    Ok(())
}

/// 将一个 Note 挂载到 Tree Node
pub fn insert_node_note_resource(
    tx: &Transaction,
    node_id: &str,
    note_id: &str,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO node_resources (
            node_id,
            resource_id,
            resource_type,
            created_at
        )
        VALUES (?, ?, 'note', ?)
        "#,
        params![node_id, note_id, now],
    )?;

    Ok(())
}

/// 插入一条 snippet 记录
///
/// 约定：
/// - content 为完整代码文本
/// - language 可为空
pub fn insert_snippet(
    tx: &Transaction,
    snippet_id: &str,
    title: &str,
    language: Option<&str>,
    content: &str,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO snippets (
            id,
            title,
            language,
            content,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
        params![snippet_id, title, language, content, now, now],
    )?;

    Ok(())
}

/// 插入一个 tree_node（Snippets Scope）
///
/// 约定：
/// - scope 固定为 'snippets'
pub fn insert_snippets_tree_node(
    tx: &Transaction,
    node_id: &str,
    parent_id: Option<&str>,
    name: &str,
    order_index: i64,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO tree_nodes (
            id,
            parent_id,
            name,
            scope,
            order_index,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, 'snippets', ?, ?, ?)
        "#,
        params![node_id, parent_id, name, order_index, now, now],
    )?;

    Ok(())
}

/// 将一个 Snippet 挂载到 Tree Node
pub fn insert_node_snippet_resource(
    tx: &Transaction,
    node_id: &str,
    snippet_id: &str,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO node_resources (
            node_id,
            resource_id,
            resource_type,
            created_at
        )
        VALUES (?, ?, 'snippet', ?)
        "#,
        params![node_id, snippet_id, now],
    )?;

    Ok(())
}

/// 插入一个通用 tree_node
pub fn insert_tree_node(
    tx: &Transaction,
    node_id: &str,
    parent_id: Option<&str>,
    name: &str,
    scope: &str,
    order_index: i64,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        INSERT INTO tree_nodes (
            id,
            parent_id,
            name,
            scope,
            order_index,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        params![node_id, parent_id, name, scope, order_index, now, now],
    )?;

    Ok(())
}

/// 更新一个 tree_node 的基本字段（parent/name/order）
pub fn update_tree_node(
    tx: &Transaction,
    node_id: &str,
    parent_id: Option<&str>,
    name: &str,
    order_index: i64,
    now: i64,
) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        UPDATE tree_nodes
        SET parent_id = ?, name = ?, order_index = ?, updated_at = ?
        WHERE id = ?
        "#,
        params![parent_id, name, order_index, now, node_id],
    )?;

    Ok(())
}

/// 删除一个 tree_node（注意需要先检查是否存在子节点或挂载资源）
pub fn delete_tree_node(tx: &Transaction, node_id: &str) -> rusqlite::Result<()> {
    tx.execute(
        r#"
        DELETE FROM tree_nodes WHERE id = ?
        "#,
        params![node_id],
    )?;

    Ok(())
}
