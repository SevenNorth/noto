use rusqlite::Connection;

pub fn run(conn: &Connection) -> anyhow::Result<()> {
    // 确保外键启用
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    // 执行 schema
    conn.execute_batch(include_str!("../../schema.sql"))?;

    Ok(())
}
