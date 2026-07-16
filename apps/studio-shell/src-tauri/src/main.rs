// The Studio Shell — Rust host (SPEC-SH3 §2.4). Scaffolded 2026-07-16, issue #10.
// Three duties, nothing else: (1) range-serve the asset tree on the `atelier:`
// protocol — no fetch ever leaves the machine; (2) own studio.sqlite (route_log +
// route_familiarity, SH1 §2.8 — shell state, never the event log); (3) expose the
// OS GPU/decoder counter sampler that G-SH3-1's dormancy rig reads.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod route_log;
mod sampler;

use std::{fs, path::PathBuf};
use tauri::Manager;

/// Resolve the installed asset tree (dev: the repo's studio/ASSETS; prod: the
/// app's resource dir — asset packs arrive via the ordinary app-update channel).
fn asset_root(app: &tauri::AppHandle) -> PathBuf {
    if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../studio/ASSETS")
    } else {
        app.path().resource_dir().expect("resource dir").join("ASSETS")
    }
}

/// `atelier://localhost/<path>` — disk range-serving. Byte-range support keeps
/// `video.seekable` honest for clip landing-snaps; blob sourcing in the webview
/// remains the playback path (revocation = provable dormancy).
fn serve_asset(
    app: &tauri::AppHandle,
    request: tauri::http::Request<Vec<u8>>,
) -> tauri::http::Response<Vec<u8>> {
    let root = asset_root(app);
    let path = request.uri().path().trim_start_matches('/');
    // Path discipline: no traversal, ever.
    if path.contains("..") {
        return tauri::http::Response::builder().status(403).body(Vec::new()).unwrap();
    }
    let full = root.join(path);
    let Ok(bytes) = fs::read(&full) else {
        // A missing asset "does not exist" (§3.2.4): the webview's fallback law
        // (drift-cut / page-card) owns the experience; the host just says 404.
        return tauri::http::Response::builder().status(404).body(Vec::new()).unwrap();
    };
    let mime = match full.extension().and_then(|e| e.to_str()) {
        Some("json") => "application/json",
        Some("png") => "image/png",
        Some("avif") => "image/avif",
        Some("mp4") => "video/mp4",
        Some("cube") => "application/octet-stream",
        _ => "application/octet-stream",
    };
    // Range requests: serve the slice; else the whole file.
    if let Some(range) = request.headers().get("range").and_then(|v| v.to_str().ok()) {
        if let Some((start, end)) = parse_range(range, bytes.len()) {
            let total = bytes.len();
            let body = bytes[start..=end].to_vec();
            return tauri::http::Response::builder()
                .status(206)
                .header("content-type", mime)
                .header("accept-ranges", "bytes")
                .header("content-range", format!("bytes {start}-{end}/{total}"))
                .body(body)
                .unwrap();
        }
    }
    tauri::http::Response::builder()
        .status(200)
        .header("content-type", mime)
        .header("accept-ranges", "bytes")
        .body(bytes)
        .unwrap()
}

fn parse_range(header: &str, len: usize) -> Option<(usize, usize)> {
    let spec = header.strip_prefix("bytes=")?;
    let (a, b) = spec.split_once('-')?;
    let start: usize = a.parse().ok()?;
    let end: usize = if b.is_empty() { len - 1 } else { b.parse().ok()? };
    (start <= end && end < len).then_some((start, end))
}

fn main() {
    tauri::Builder::default()
        .register_uri_scheme_protocol("atelier", |ctx, request| serve_asset(ctx.app_handle(), request))
        .invoke_handler(tauri::generate_handler![
            route_log::log_transit,
            route_log::route_familiarity,
            route_log::travel_table,
            route_log::clear_travel_log,
            sampler::sample_counters,
        ])
        .setup(|app| {
            route_log::init(&app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the Studio shell");
}
