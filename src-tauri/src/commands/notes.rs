use std::fs;
use tauri::AppHandle;
use uuid::Uuid;

#[tauri::command]
pub fn create_note(app: AppHandle, title: String) -> Result<String, String> {
    let note_id = Uuid::new_v4().to_string();

    let mut path = tauri::api::path::app_data_dir(&app.config()).unwrap();
    path.push("notes");
    path.push(format!("{}.md", note_id));

    fs::write(&path, format!("# {}\n", title)).map_err(|e| e.to_string())?;

    // TODO: insert into DB

    Ok(note_id)
}
