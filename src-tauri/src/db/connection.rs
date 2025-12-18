use rusqlite::Connection;

pub fn get_connection() -> anyhow::Result<Connection> {
    let db_path = crate::app::db_path();
    Ok(Connection::open(db_path)?)
}
