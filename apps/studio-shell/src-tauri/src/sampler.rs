// The dormancy instrument (G-SH3-1 / sealed G-SH1-6) — design + first cut.
// Two halves, per Gate 1 T-10 (neither alone is the assertion):
//   1Hz sampling  → sustained residency (GPU engine utilization for this PID)
//   event hooks   → sub-second sins (decoder handle create/destroy)
// On Windows the utilization half reads the `GPU Engine(pid_*)` performance
// counters (the same source Task Manager uses); the decoder-handle half counts
// Media Foundation / D3D11 video device handles owned by the process. The CI rig
// (ci/dormancy-rig/) drives a scripted session and asserts:
//   zero handles outside sanctioned preflight windows · every preflight handle
//   released per §2.2's abandonment law · GPU delta ≤ 2% vs the hard-cut control.
use serde::Serialize;

#[derive(Serialize)]
pub struct CounterSample {
    pub at_ms: f64,
    /// Sum of this process's GPU engine utilization counters, percent.
    pub gpu_utilization_pct: f64,
    /// Open video-decoder handles attributable to this process.
    pub decoder_handles: u32,
    /// True until the counter plumbing lands — honest about being a stub.
    pub stub: bool,
}

/// First cut: shape + IPC contract are real; the counter plumbing (PDH query for
/// `\GPU Engine(pid_<pid>_*)\Utilization Percentage`, MF handle census) lands with
/// the first cargo build — it needs a linker to iterate against (issue #10).
/// The rig treats `stub: true` as AN AUTOMATIC FAIL, so this cannot quietly pass CI.
#[tauri::command]
pub fn sample_counters() -> CounterSample {
    CounterSample {
        at_ms: 0.0,
        gpu_utilization_pct: -1.0,
        decoder_handles: u32::MAX,
        stub: true,
    }
}
