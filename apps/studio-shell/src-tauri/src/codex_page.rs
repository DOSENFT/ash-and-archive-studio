// The first working instrument: the Codex desk's page, saved to disk as a
// human-readable file (the ownership covenant in one function). Atomic write
// (tmp + rename) so a killed process never truncates the user's words.
use std::fs;
use tauri::Manager;

fn page_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("codex");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("first-page.md"))
}

#[tauri::command]
pub fn codex_save(app: tauri::AppHandle, text: String) -> Result<(), String> {
    let path = page_path(&app)?;
    let tmp = path.with_extension("md.tmp");
    fs::write(&tmp, text).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn codex_load(app: tauri::AppHandle) -> Result<String, String> {
    let path = page_path(&app)?;
    if !path.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}
