pub mod connection;
pub mod migrate;
pub mod models;

pub fn init_db() -> tauri::Result<()> {
    let conn = connection::get_connection().expect("failed to open database");

    migrate::run(&conn).expect("database migration failed");

    Ok(())
}
