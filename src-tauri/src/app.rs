use tauri::{AppHandle, Result};

pub fn init(app: &AppHandle) -> Result<()> {
    crate::fs::init_dirs(app)?;
    crate::db::init_db(app)?;
    Ok(())
}
