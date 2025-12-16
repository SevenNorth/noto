use std::fs;
use tauri::{AppHandle, Manager};

pub fn init_dirs(app: &AppHandle) -> tauri::Result<()> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    let dirs = ["notes", "attachments/images", "attachments/files", "cache"];

    for dir in dirs {
        let mut path = app_dir.clone();
        path.push(dir);
        fs::create_dir_all(path)?;
    }

    Ok(())
}
