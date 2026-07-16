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
