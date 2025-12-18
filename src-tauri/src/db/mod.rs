pub mod connection;
pub mod migrate;
pub mod models;

use tauri::AppHandle;

pub fn init_db(app: &AppHandle) -> tauri::Result<()> {
    let conn = connection::get_connection().expect("failed to open database");

    migrate::run(&conn).expect("database migration failed");

    Ok(())
}
