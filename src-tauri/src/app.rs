use once_cell::sync::OnceCell;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

static DB_PATH: OnceCell<PathBuf> = OnceCell::new();

pub fn init(app: &AppHandle) -> anyhow::Result<()> {
    // 1️⃣ 初始化目录
    crate::fs::init_dirs(app)?;
    // 2️⃣ 初始化数据库
    crate::db::init_db(app)?;

    // 3️⃣ 保存 db_path
    let db_path = app.path().app_data_dir()?.join("db.sqlite");

    DB_PATH
        .set(db_path)
        .map_err(|_| anyhow::anyhow!("DB_PATH already initialized"))?;

    Ok(())
}

pub fn db_path() -> &'static PathBuf {
    DB_PATH.get().expect("DB_PATH not initialized")
}
