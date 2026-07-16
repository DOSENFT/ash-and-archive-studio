// studio.sqlite — SH1 §2.8 verbatim: local-only, user-inspectable, ring-buffered.
// Shell state, never the event log (ADR-002-B). Writes are fire-and-forget from
// the webview (SH3 §4.4: ≤1ms main-thread; the IPC call is already async).
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

pub struct Db(pub Mutex<Connection>);

const DDL: &str = "
CREATE TABLE IF NOT EXISTS route_log (
  id INTEGER PRIMARY KEY,
  routeKey TEXT NOT NULL,
  familiarityTier INTEGER NOT NULL,
  plannedMs INTEGER, actualMs INTEGER,
  skipped INTEGER NOT NULL DEFAULT 0, skippedAtMs INTEGER,
  ttfiMs INTEGER,
  degradeClass TEXT, fallbackUsed INTEGER NOT NULL DEFAULT 0, fallbackReason TEXT,
  at TEXT NOT NULL              -- wallTime, display only (never feeds folds)
);
CREATE TABLE IF NOT EXISTS route_familiarity (
  routeKey TEXT PRIMARY KEY,
  f REAL NOT NULL DEFAULT 0,
  pinnedTier INTEGER
);
";
const RING: i64 = 2000; // last 2,000 transits; older rows fold into aggregates

pub fn init(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&dir)?;
    let conn = Connection::open(dir.join("studio.sqlite"))?;
    conn.execute_batch(DDL)?;
    app.manage(Db(Mutex::new(conn)));
    Ok(())
}

#[tauri::command]
pub fn log_transit(
    db: tauri::State<Db>,
    route_key: String, tier: i64, planned_ms: Option<i64>, actual_ms: Option<i64>,
    skipped: bool, skipped_at_ms: Option<i64>, ttfi_ms: Option<i64>,
    degrade_class: String, fallback_used: bool, fallback_reason: Option<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO route_log (routeKey, familiarityTier, plannedMs, actualMs, skipped, skippedAtMs, ttfiMs, degradeClass, fallbackUsed, fallbackReason, at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10, datetime('now'))",
        rusqlite::params![route_key, tier, planned_ms, actual_ms, skipped, skipped_at_ms, ttfi_ms, degrade_class, fallback_used, fallback_reason],
    ).map_err(|e| e.to_string())?;
    // Ring buffer: aggregate-then-trim is a TODO carried to the first host build —
    // trimming alone until the aggregate fold lands (recorded, not silent).
    conn.execute(
        "DELETE FROM route_log WHERE id <= (SELECT MAX(id) FROM route_log) - ?1",
        [RING],
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO route_familiarity (routeKey, f) VALUES (?1, 1)
         ON CONFLICT(routeKey) DO UPDATE SET f = f + 1",
        [&route_key],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn route_familiarity(db: tauri::State<Db>, route_key: String) -> Result<f64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.query_row("SELECT f FROM route_familiarity WHERE routeKey = ?1", [&route_key], |r| r.get(0))
        .or(Ok(0.0))
}

/// "Your travel, measured" — the settings table, plain rows (SH1 §2.8).
#[tauri::command]
pub fn travel_table(db: tauri::State<Db>) -> Result<Vec<serde_json::Value>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT routeKey, familiarityTier, actualMs, skipped, ttfiMs, at FROM route_log ORDER BY id DESC LIMIT 200")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |r| {
            Ok(serde_json::json!({
                "routeKey": r.get::<_, String>(0)?, "tier": r.get::<_, i64>(1)?,
                "actualMs": r.get::<_, Option<i64>>(2)?, "skipped": r.get::<_, bool>(3)?,
                "ttfiMs": r.get::<_, Option<i64>>(4)?, "at": r.get::<_, String>(5)?,
            }))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

/// Clears the LOG only — familiarity persists unless the user also clears it
/// ("the hands are the user's to keep or reset", SH1 §2.8).
#[tauri::command]
pub fn clear_travel_log(db: tauri::State<Db>) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM route_log", []).map_err(|e| e.to_string())?;
    Ok(())
}
