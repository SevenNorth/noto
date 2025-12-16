mod connection;
mod migrate;

use tauri::AppHandle;

pub fn init_db(app: &AppHandle) -> tauri::Result<()> {
    let conn = connection::open(app).expect("failed to open database");

    migrate::run(&conn).expect("database migration failed");

    Ok(())
}
