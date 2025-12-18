use std::fs;
use std::path::PathBuf;

/// 创建一个新的 Note Markdown 文件
///
/// 返回：
/// - Ok(PathBuf)：创建成功后的文件完整路径
/// - Err(std::io::Error)：文件系统错误
pub fn create_note_file(
    app_data_dir: &PathBuf,
    note_id: &str,
    title: &str,
) -> Result<PathBuf, std::io::Error> {
    // app_data_dir/notes
    let notes_dir = app_data_dir.join("notes");

    // app_data_dir/notes/<note_id>.md
    let file_path = notes_dir.join(format!("{}.md", note_id));

    let content = format!("# {}\n\n", title);

    fs::write(&file_path, content)?;

    Ok(file_path)
}

/// 删除 Note 文件（用于失败回滚）
///
/// ⚠️
/// - 忽略删除失败
/// - 仅用于补偿逻辑
pub fn delete_note_file(path: &PathBuf) {
    let _ = fs::remove_file(path);
}
