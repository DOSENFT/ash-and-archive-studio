// The world vault's disk home (SPEC-001 §4.1 via the webview's WASM binding).
// The webview runs the Foundation over WASM SQLite and hands the serialized
// database here for durable storage — one file per world plus studio.sqlite,
// exactly the §4.1 layout, living in the user's app-data where they can see it.
// Atomic write (tmp + rename): a killed process never truncates a world.
// Payloads travel as base64 strings over IPC (worlds are small in v1; a raw-body
// channel is the recorded upgrade path when they are not).
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use std::fs;
use tauri::Manager;

fn vault_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("vault");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// File-name discipline: the binding writes `studio.sqlite` and `<ulid>.aa.sqlite`
/// only; anything else (or any path separator) is refused.
fn checked_name(name: &str) -> Result<&str, String> {
    let ok_chars = name.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-' || c == '_');
    if !ok_chars || name.contains("..") || name.is_empty() {
        return Err(format!("refused vault file name: {name}"));
    }
    Ok(name)
}

#[tauri::command]
pub fn vault_save(app: tauri::AppHandle, name: String, bytes_b64: String) -> Result<(), String> {
    let name = checked_name(&name)?;
    let bytes = B64.decode(bytes_b64).map_err(|e| e.to_string())?;
    let dir = vault_dir(&app)?;
    let path = dir.join(name);
    let tmp = dir.join(format!("{name}.tmp"));
    fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn vault_load(app: tauri::AppHandle, name: String) -> Result<Option<String>, String> {
    let name = checked_name(&name)?;
    let path = vault_dir(&app)?.join(name);
    if !path.exists() {
        return Ok(None);
    }
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    Ok(Some(B64.encode(bytes)))
}

#[tauri::command]
pub fn vault_list(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let dir = vault_dir(&app)?;
    let mut names = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if let Some(name) = entry.file_name().to_str() {
            if !name.ends_with(".tmp") {
                names.push(name.to_string());
            }
        }
    }
    names.sort();
    Ok(names)
}
