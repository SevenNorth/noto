use rusqlite::Connection;
use tauri::{AppHandle, Manager};

pub fn open(app: &AppHandle) -> anyhow::Result<Connection> {
    let mut path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");

    path.push("db.sqlite");

    Ok(Connection::open(path)?)
}
