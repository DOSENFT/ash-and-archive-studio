# THE SHIP LEDGER — every named blocker between here and the first shipping gate
*Opened 2026-07-16 by Marcus's order. One glance answers "how far from done." Append-only rows; a row closes only with evidence (a green gate run, a seal, a curator verdict). No row may be removed — only closed.*

**The bar (restated once, from the canon holder):** software that makes a professional's ten-hour day calmer and faster; reviewers say "of course"; superior by discipline, never spectacle.

| # | Blocker | Owner | Precondition / closes when | Status |
|---|---|---|---|---|
| 1 | **Tauri Rust host built** (asset protocol, studio.sqlite, packaged shell) | shell workstream | cargo install (Marcus's keyboard, tonight — runbook ready) → `cargo tauri build` green | 🟡 scaffolded to the wall (issue #10) |
| 2 | **GPU-counter plumbing** (`sampler.rs` PDH/MF — `stub:false`) | shell workstream | needs #1's linker to iterate against | 🔴 stub (rig auto-fails on stub, by design) |
| 3 | **G-SH3-1 dormancy rig green in the real shell** | shell workstream | #1 + #2; rig pre-written (`studio/SPIKES/SH3/rig.py`) | 🔴 blocked on #1 |
| 4 | **G-SH3-2 TTFI re-measured in the real shell** (S1's bar: +0ms p50) | shell workstream | #1; rig pre-written | 🔴 blocked on #1 |
| 5 | **Reference CI runner provisioned** (4-core/iGPU/Win11 class; releases block when down) | Marcus (hardware) + shell | machine named, counters validated vs S1 method | 🔴 not scheduled |
| 6 | **Intake-PASSed asset floor** (SH1-α: 18 poses… shipping floor = at minimum the walk's set: shelf, garth, approach + seated bays in use) | Marcus (curator, sole PASS hand) | sprint deliverables received (`--receive` ready) + checklist runs | 🟡 6 queued, 0 PASSed; sprint DELIVERING — 6 bay stills + flight exemplar registered w/ gen IDs (SR-0019..0025), receive-wired |
| 7 | **Composer v1 — the real seated instrument** (replaces ThrowawayFolio) | Fable 5 (spec) → builder | SPEC-CB1: skeleton → hostiles → **Marcus seal** → build → seats via the frozen contract | 🟡 skeleton drafted |
| 8 | **Core §19 complete through step 6 (Binding)** — the Codex bench is empty without archive+binding | core workstream | steps 3 (in flight) → 4 (§6 Binding) → 5 (§7 Charter) at minimum for a working Codex | 🟡 step 3 building |
| 9 | **Marcus's experience gates** (Wonder Pass + Purist Pass verdicts folded into SH3-α hardening) | Marcus | walk-through findings returned + hardening applied | 🔴 walk pending (tonight) |
| 10 | **SPEC-SH3 seal confirmed** (conditional seal stands; C-1/C-2/C-3 + T-1 transcript read) | Marcus | his read; amend-by-instrument if needed | 🟡 conditionally sealed |
| 11 | **UNCURATED zero-count in the shipping manifest** (G-SH3-5's whole point) | Marcus + pipeline | every shipped slot carries an intake-PASS record; ship-lint green with no --dev | 🔴 5 UNCURATED in dev manifest |
| 12 | **The SH1 rubric (17 items) + SH3 rubric (16 items) run against the built shell** | fresh-context verifier | #1–#4 first; any fail blocks | 🔴 not run |
| 13 | **Ship-mode CI wiring** (lint + rigs as the release pipeline, releases block on runner-down) | shell workstream | #1–#5; scripts exist, CI harness not yet wired to a pipeline | 🔴 open |
| 14 | **Accretion γ + Rites δ** — *not* first-gate blockers (SH1-α is the sealed shipping floor); listed so nobody upgrades them silently | shell workstream | post-first-gate staging per SH3 §10.4 | ⬜ deliberately out of first gate |

**Debts carried honestly:** route_log ring-buffer aggregate-fold TODO (route_log.rs, marked) · `sampler.rs` stub (row 2) · placeholder stills in bench.chronicle/bench.forge slots (author-flagged in their shot records; replaced by sprint + intake) · Approach icon placeholder until the maker's mark exists (`cargo tauri icon` step).
