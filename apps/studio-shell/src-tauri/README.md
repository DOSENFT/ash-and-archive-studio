# src-tauri — the Rust host (SPEC-SH3 §2.4) — SCAFFOLD PENDING TOOLCHAIN
*Recorded, not silent (2026-07-16): no Rust toolchain (`cargo`) exists on the build
machine, so the Tauri host is deferred. The webview layer (`../src`) runs standalone
under Vite against WebView2's own engine — the exact proxy the S1 spike measured
(+0.2ms drift-cut delta). Nothing in the webview layer assumes the host's absence.*

The host, when the toolchain lands:
1. `cargo install tauri-cli` → `cargo tauri init` in this directory.
2. Asset range-serving on a localhost-scoped custom protocol (no fetch leaves the machine).
3. `studio.sqlite`: route_log + route_familiarity (SH1 §2.8) — supersedes the slice's
   localStorage familiarity store.
4. The OS-level GPU/decoder counter sampler + decoder-handle create/destroy hooks
   that G-SH3-1's CI assertion reads (§9.1 — the dormancy rig's instrument).
5. The reference CI runner (4-core baseline, integrated GPU, Windows 11, WebView2)
   must be provisioned before the SH3-α gate run (SH3 doubt register #2).
