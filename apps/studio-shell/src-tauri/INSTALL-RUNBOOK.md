# INSTALL RUNBOOK — the ten-minute cargo install (issue #10, prepare-to-the-wall)
*Everything below this line is the founder's keyboard; everything above it is done.*

## 1. Install (one time, ~10 min, ~2GB)
```powershell
# 1. Rust (MSVC toolchain — the Windows default; accept defaults)
winget install Rustlang.Rustup
# ...or: https://rustup.rs → rustup-init.exe → "1) Proceed with standard installation"

# 2. VS Build Tools C++ workload (linker). Skip if Visual Studio w/ C++ is present.
winget install Microsoft.VisualStudio.2022.BuildTools --override "--quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

# 3. New terminal, then verify:
rustc --version          # rustc 1.8x
cargo --version

# 4. Tauri CLI + WebView2 check (Win11 ships WebView2; this just confirms)
cargo install tauri-cli --version "^2"
```

## 2. First build (from the repo)
```powershell
cd "C:\Users\marcu\Documents\Ash & Archive\studio-repo\apps\studio-shell"
cargo tauri icon ..\..\studio\ASSETS\stills\garth.center.png   # generates icons/ (placeholder until a real mark)
cargo tauri dev          # first compile ~3-5 min; opens the Studio window against the dev server
# then, the shippable artifact:
cargo tauri build        # produces the .msi under src-tauri/target/release/bundle/
```
Expected on `cargo tauri dev`: the 1440×900 obsidian window, the walk exactly as in the browser, `studio.sqlite` created under %APPDATA%\com.ashandarchive.studio\.

## 3. Immediately after first build — the blocking baselines (in order)
```powershell
# a. S1 re-measurement in the REAL shell (drift-cut vs hard-cut, input-inclusive TTFI):
python ..\..\studio\SPIKES\SH3\rig.py --mode ttfi --launch tauri
# b. The dormancy rig (10-min scripted seated session + straddling hovers + counters):
python ..\..\studio\SPIKES\SH3\rig.py --mode dormancy --launch tauri
#    NOTE: sampler.rs returns stub:true until the PDH/MF counter plumbing is
#    iterated against a real linker — the rig FAILS on stub by design. Landing
#    that plumbing is the first post-install code task (same issue #10).
```

## 4. What "done" looks like for issue #10
- `cargo tauri build` produces an installable shell · rig TTFI: drift ≤ hard-cut +0ms p50 (S1's own bar) · dormancy rig green with `stub:false` counters · the reference-machine CI runner scheduled (separate line in the ship ledger).

## 5. SCAR TISSUE — what the install actually required (2026-07-17, recorded per the ops-docs rule)
- **winget's silent VS install fails from a non-elevated shell** (installer exit 1602, "cancelled"): the UAC consent has no one to click. Working path: download `vs_BuildTools.exe` (aka.ms/vs/17/release), then `Start-Process ... -Verb RunAs` from the founder's own prompt — one UAC click, then fully silent (~4 min on this machine).
- **`cargo install tauri-cli` skipped entirely**: the npm `@tauri-apps/cli` package ships a prebuilt binary — seconds instead of a 10–30 min source compile. Invoke as `node node_modules/@tauri-apps/cli/tauri.js <cmd>` (the `.bin` shims break on the `&` in the repo path).
- **`tauri build --no-bundle --config '{"build":{"beforeBuildCommand":""}}'`**: `--no-bundle` skips MSI/WiX for the fast loop; the config override stops the before-hook from overwriting a hand-built frontend.
- **The UNCURATED law forces the frontend build mode**: a production frontend (`__DEV_BUILD__=false`) lawfully refuses the current UNCURATED manifest (world-layer-off). Until intake PASSes land, build the frontend with `vite build --mode development` — watermark on, exactly as the law intends — then `tauri build`.
- **First cargo compile: 3m27s clean** (rustc 1.97.1 / cargo 1.97.1, MSVC 14.44).
- **Rig vs WebView2 CDP, two gotchas**: (1) the remote-debugging env var must sit in the Win32 block the WebView2 child inherits — a `.bat` wrapper (`set` + `start`) is the reliable spawn; `os.putenv` and cmd-inline `set X && exe` both failed (the latter to the `&` in the path); (2) the production app's page URL is `http://tauri.localhost/` — CDP target filters written against `localhost:5175` never match.
- All slice assets ship **embedded in the exe** (vite's publicDir lands in dist; tauri embeds dist) — the 34MB binary is self-contained; the `atelier:` disk protocol becomes load-bearing only when clip libraries outgrow embedding.
