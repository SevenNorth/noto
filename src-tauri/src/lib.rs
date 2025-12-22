mod app;
mod commands;
mod db;
mod fs;

use commands::{
    create_note, create_snippet, create_tree_node, delete_snippet_only, delete_tree_node,
    get_note, get_snippet_detail, list_tree_nodes, list_tree_nodes_tree, update_note_content,
    update_note_title, update_snippet_detail, update_tree_node,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            // ⭐ 关键：应用启动初始化
            app::init(&handle)?;
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_note,
            create_snippet,
            get_snippet_detail,
            update_snippet_detail,
            delete_snippet_only,
            create_tree_node,
            update_tree_node,
            delete_tree_node,
            list_tree_nodes,
            list_tree_nodes_tree,
            get_note,
            update_note_content,
            update_note_title
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
