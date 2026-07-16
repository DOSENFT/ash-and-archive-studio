# SPEC-SH3 — THE SHELL ARCHITECTURE
### The Studio Shell: the Tauri world-layer engine, the asset manifest law, the route machine, the seat-surface contract, the accretion compositor, and the Atelier Pipeline
*v0.2 DRAFT · 2026-07-16 · Author: Fable 5 (Principal Experience Architect) · Gate 1 adversarial pass APPLIED (three fresh-context hostiles — fatigue advocate 15 findings · canon prosecutor 15 · taste auditor 12; **42 accepted, 0 rejected**; verbatim transcript + dispositions: `drafts/SH3-GATE1-TRANSCRIPT.md`) · Consumes: canon clause 8 · SPEC-SH1 v1.0 (sealed) · SPEC-SH2 v1.0 (sealed, ADR-SH2-G) · SPEC-001 v1.2 (`@ash-archive/core` — consumed via published API only, never modified) · Marcus rulings R1–R4 of 2026-07-16 + the Shot Record addendum (filed verbatim in the ADR-LOG per C-14). Where this document conflicts with sealed law, sealed law wins; every conflict found is resolved in §0 and logged in the ADR-LOG.*

> **What this document builds.** The interactive desktop environment in which Ash & Archive is actually used: a place, not a page — the sealed Cloister geography, rendered in the sealed Lanternlight register, navigated as one continuous eye-level walk, with real application surfaces seated inside each bay. The world exists only between seats; during work there is only the instrument, page brighter than world, zero idle motion; every flight skippable ≤120ms; the hundredth day faster than the first. The experience target is inhabiting a real nighttime building — monastic calm, never spectacle.

---

## 0. INHERITANCE AUDIT & THE EXTRACTION MANIFEST (read first)

### 0.1 Conflicts found & resolved

**C-1 · scroll-position-as-time is a landing-page input and is discarded at the door.** The ingested scroll-world technique binds camera time to scroll position. The Shell's inputs are SH1 §2.6's full navigation contract (click, keyboard, ⌘K sovereign and world-free, back/forward, deep links). In the Shell, a flight is a *played segment chain* under the four-state interruption machine (SH1 §2.4), never a scrubbed timeline. The blob-seek machinery survives because *landing snaps* and *tier-rate playback* still require frame-accurate seeking — the mechanism is kept, its input is replaced. (ADR-SH3-A.)

**C-2 · The skill's scene-count/journey model does not apply.** scroll-world thinks in N authored scenes and 2N-1 clips per build. The Shell's geography is sealed: 18 locked poses, ~40 clips, 72 directed routes (SH1 §2.2–2.3). The pipeline (§11) therefore takes SH1's route table as its *shotlist* — it never invents scenes.

**C-3 · The skill's isometric-diorama default is triple-banned** (canon clause 8 material law, SH2 §1.5 named prohibitions, SH1 ADR-SH1-A). Nothing of its art direction survives; the Canon Style Block v2 (SH2 §5.3-bis) is the only register.

**C-4 · Mobile/portrait machinery is out of scope.** The Studio is a desktop instrument (Tauri). The skill's phone hardening is not extracted; the *pattern* of seek-coalescing is kept where it is load-bearing on weak decoders (Class B, §6).

**C-5 · No dependency on the skill.** Extraction means **vendored, rewritten, canon-annotated library code inside this repo** — not an npm dependency, not a skill invocation at runtime. The skill's repo is a quarry, not a foundation stone. (ADR-SH3-A.)

### 0.2 The extraction manifest (what is kept, what is discarded — by name)

| Kept (production-proven) | Where it lands |
|---|---|
| **The seam rule** — connector endpoints are the ACTUAL RENDERED FRAMES of neighboring clips, never the source still ("every generation renders slightly differently") | §11.6 (the seam-anchor law, reconciled per Gate 1 C-3) + SH1 §2.2 already sealed it |
| **The seam gate** — CI comparison of boundary frames (ΔE76 < 2.0 per SH1; SSIM as the second detector for structural drift ΔE can miss) | §3.4 manifest CI + §11.6 |
| **Blob-seek engine** — fetch clip as `Blob`, play from in-memory object URL (always fully seekable; revocation is *provable* dormancy) | §2.3 clip player |
| **GOP/encoding discipline** — native resolution, crf ~20, `-g 8`, `-sc_threshold 0`, faststart, strip audio, light unsharp; never all-intra, never upscale | §3.5 encode law |
| **Device tiering + graceful fallback** — lighter encodes for weak decoders; poster-until-first-paint; degrade, never break | §6 (Class B) |
| **Resumable idempotent pipeline** — per-asset job files, individual re-roll (never restart the batch), detached generations, transient-failure discipline | §11.7 |
| **Cheap previz tier** — whole chain on the frame-locking draft model, approve, re-render finals | §11.5 |
| **The gotchas file** — NSFW false-positive playbook, one-model-per-chain law, `--end-image` capability as the model selection rule, calibrate-don't-guess costing | §11.8 (scar tissue seeds POSITIVE-LOCKS) |
| **Crossfade insurance** — frame-matched endpoints + a short crossfade; never the crossfade alone | §2.3; the drift-cut is the degenerate case |

| Discarded (by name) | Why |
|---|---|
| Scroll-scrub input model, `mountScrollWorld`, copy rail, section/eyebrow/CTA system | C-1 |
| Isometric clay-diorama art direction, knockout/floating islands, brand-kit interview | C-3 |
| Scene-count thinking, journey interview | C-2 |
| Mobile portrait chain, crop fallbacks, iOS hardening | C-4 |
| Dive-in/aerial-connector architecture (B) | Camera-direction reversal at seams = the rewind stutter; the Cloister walk is architecture A by sealed camera law (SH2 §1.1) |

---

## 1. GATE-ENFORCEABLE TESTS (these fail launches, not code reviews)

**The reference machine, named (Gate 1 F-12/C-13):** a 4-core baseline desktop, integrated GPU, Windows 11, WebView2 — the S1 spike's own class, held as a physical CI runner. When the runner is down, releases **block**; the gate is never skipped.

| Gate | Measure | Threshold |
|---|---|---|
| **G-SH3-1 Dormancy by measurement** | OS-level GPU adapter + decoder counters attributable to the shell process during the §9.1 rig (10 min seated work incl. ≥30 hovers whose dwells deliberately straddle the 150ms preflight trigger) — G-SH1-6 carried into the real Tauri build, the S1 spike's named caveat closed | Zero video elements, zero decoders, zero GL contexts outside sanctioned preflight windows; **the preflight carve-out restated from sealed G-SH1-6:** preflight may allocate (≤4ms main-thread per intent event, decode off-thread) and must release per §2.2's abandonment law; GPU attributable-delta vs the hard-cut control ≤ 2% mean utilization (a bound, not "indistinguishable" — Gate 1 C-13); event-based decoder-handle create/destroy hooks recorded alongside 1Hz sampling, because a handle allocated and freed between samples must still be seen *(Gate 1 T-10)*. **CI-asserted per release** |
| **G-SH3-2 TTFI vs hard-cut** | Input-inclusive TTFI (G-SH1-1's clock: navigation input event → first processed meaningful input) — **the full sealed population measure, all tiers, beta cohort (G-SH1-1 verbatim), plus the tier-3/drift-cut slice** *(Gate 1 F-4: the draft had silently narrowed a sealed gate to tier 3)* | ON ≤ control at p50, ≤ +50ms p95 (population); tier-3 slice ≤ +0ms p50 |
| **G-SH3-3 Seam gate** | Every manifest clip's boundary frames vs locked pose stills AND adjacent-clip seams, mean ΔE76 + SSIM | ΔE76 < 2.0 (sealed) and **SSIM ≥ 0.985 — provisional, named (Gate 1 T-4/C-13):** chosen as the strictest round threshold the S2 spike's codec-loss floor (symmetric 1.05/1.06 ΔE, visually lossless) comfortably clears while catching the structural drift (melted geometry, doubled edges) ΔE-mean averages away; **calibrated against the first ten production seams and re-pinned by ADR before β ships** |
| **G-SH3-4 Budget holds** | 80ms folio paint · ≤2s cold resume · <100ms palette, with the layer installed and a full manifest — **clocks defined in §9.4, not negotiable at measurement time** *(Gate 1 F-8)* | All three green; world layer contributes 0ms to the critical path |
| **G-SH3-5 The UNCURATED law** (Marcus R2) | Manifest lint in CI + runtime check | An asset flagged `UNCURATED` in a non-dev build ⇒ **CI fails the build**; dev builds render the specified mark (§3.2.2) whenever one is on screen; no code path promotes UNCURATED → shipping except replacing the entry with an intake-PASS record |
| **G-SH3-6 Zero-code asset swap** | Replace an UNCURATED slot with its intake-PASS asset (same poseId/routeKey, new hash) | Shell behavior identical with zero code change, demonstrated live via §3.3's dev-mode manifest reload — no relaunch per asset *(Gate 1 F-11)* |
| **G-SH3-7 The airlock probe** | Frame-capture 20 landings + 20 departures (SH1 rubric 15) | Zero frames of registered page motion while WorldStage mounted; departures mid-page-motion snap ≤120ms |
| **G-SH3-8 Pipeline no-self-ratify** | Audit `studio/PIPELINE/`'s write surface | The pipeline can write only `intake-queue/` entries and UNCURATED manifest slots; **PASS is written by a separate intake instrument under the canon holder's hand (§11.5 step 6)**; no PASS-writing code path exists in the pipeline package *(Gate 1 C-6)* |
| **G-SH3-9 Route-ceiling lint** *(Gate 1 C-2)* | CI composes every expressible route from the manifest's `durationMs` fields at tier-0 rate | No composed Passage > 2,200ms experienced; no Rite > 4,000ms; the constitutional ceilings are checked at manifest time, not discovered at rubric time |

---

## 2. THE WORLD-LAYER ENGINE — `@ash-archive/atelier`

### 2.1 Placement & jurisdiction

```
studio-repo/
├── packages/core/            ← ANOTHER WORKSTREAM. Consumed via its published API. Never modified.
├── packages/atelier/         ← this spec: the world-layer engine (TS, framework-light)
│   ├── src/stage/            ← <WorldStage>: still compositor + clip player + lifecycle
│   ├── src/routes/           ← pose ledger, route compiler, decay machine, route log
│   ├── src/manifest/         ← manifest loader, hash verification, UNCURATED enforcement
│   ├── src/accretion/        ← anchor-slot compositor (runs in atelier-worker)
│   └── src/seat/             ← the seat-surface contract (§5)
├── apps/studio-shell/        ← the Tauri app: Rust host (asset range-serving, studio.sqlite,
│   │                            OS counters for G-SH3-1) + the webview shell
│   └── src/folios/ThrowawayFolio_DELETE_BY_DESIGN.tsx   ← R3's placeholder pane, named as ruled
└── studio/PIPELINE/          ← §11: the Atelier Pipeline (shot records, locks, scripts)
```

The atelier consumes nothing from core; it is a peer of the (future) composer; the Foundation never knows it exists (SH1 §4.1). The existing web presence at repo root is untouched — the landing page is a later, trivial derivative and is not built here.

### 2.2 Lifecycle (the sealed state machine, implemented)

`dormant → preflight → flight → seated → dormant`, **plus the `rite` state** *(Gate 1 C-1: SH1 §4.1 seals WorldStage as mounted "ONLY in flying/rite states"; the draft had dropped the ceremony map)* — entered only from `seated`, only for the closed SH1 §3 enumeration, exiting back to `seated` teardown:

- **dormant:** `<WorldStage>` unmounted — absent from the tree. Zero `<video>` elements, object URLs revoked, worker idle, still LRU (≤32MB, stills only) the sole residency. Dormancy begins at teardown completion.
- **preflight** (hover ≥150ms on a navigation affordance, palette list focus, or ring-adjacency prediction): decode destination poster still off-thread; if a flight exists at this tier, open its first clip to first-frame-ready. Budget ≤24MB decode, ≤80ms main-thread **as a sum of ≤4ms sliced tasks, never one contiguous block** *(Gate 1 F-14)*. **The abandonment law** *(Gate 1 F-3)*: preflight allocations release on intent-exit (hover ends, palette closes without selection) plus a 2s grace for immediate re-hover — never parked under a typing hand; SH1 §4.3's 60s unwarmed drop governs predicted posters only, never open decoders.
- **flight:** the compiled segment chain on the single `<video>`. Boundary frames pre-decoded so seams never buffer. Any input → landing snap ≤120ms with keystroke replay.
- **rite:** the sealed ceremony playback (SH1 §3.2's closed list — the Waking, readiness-PASS, rung, first publication, the Binding's exhale, Closing the Volume), same interruption machine, skippable at any frame, second-in-sitting demotion honored.
- **seated:** destination UI focused and interactive FIRST; teardown at idle priority, yielding to input, complete ≤500ms after interactivity, never before it.
- **Memory ceilings (sealed):** 120MB flight / 32MB seated-transitional / 0 dormant.

### 2.3 The two renderers

- **Still compositor** (canvas2d): base pose still × the world's grade (§3.2.6) + accretion overlays (§8) + the drift-cut. **The drift-cut at tier 3 / stills-only is a non-blocking visual overlay above an already-live page** (SH1 F-1 law): destination folio mounts complete, focused, interactive at frame 0; the 240ms crossfade with 12px directional drift plays *above* it; input delivered directly, no queued hold, no replay.
- **Clip player**: exactly one `<video>`, blob-sourced, `playbackRate` per familiarity tier, `currentTime` used only for landing snaps — never scroll-driven (§0.1 C-1). Frame-matched seams + a few-frame crossfade as insurance, never as the mechanism.

### 2.4 The Rust host

Serves assets from disk with range support on a localhost-scoped custom protocol; no fetch leaves the machine (zero-telemetry covenant verbatim). Owns `studio.sqlite` (route log + familiarity, SH1 §2.8). Exposes the OS-level GPU/decoder counter sampler **and the decoder-handle create/destroy event hooks** G-SH3-1 reads. Asset packs via the ordinary app-update channel.

---

## 3. THE ASSET MANIFEST — the single source of world truth

### 3.1 Schema (`studio/ASSETS/MANIFEST.json`, content-addressed, CI-linted)

```jsonc
{
  "manifestVersion": 1,
  "register": "lanternlight-v1",            // the SH2 seal id, minted in the ADR-LOG (ADR-SH2-G)
  "poses": [{
    "poseId": "bench.chronicle",             // one of the 18, closed enum from SH1 §2.2
    "still": { "hash": "sha256:…", "file": "stills/bench.chronicle.avif",
               "curation": "UNCURATED" | { "intake": "PASS", "date": "…", "curator": "marcus",
                                            "checklist": "SH2-HARVEST-INTAKE@v1" },
               "shotId": "SR-0012" },
    "anchorSlots": [{ "slotId": "chronicle.shelf", "rect": [x,y,w,h] }]
                   // interior/bench poses only (Gate 1 C-9): SH1 §5.2 puts slots in room-interior
                   // stills; SH2 §5.4 seals lintels as garth-facing, own bay unseen — the lint
                   // rejects a slot on any lintel/garth/shelf pose
  }],
  "clips": [{
    "clipId": "ARC(3,4)",                    // closed grammar: EXIT|ENTER|ARC|SPOKE|APPROACH
    "file": "clips/arc_3_4.mp4", "hash": "sha256:…",
    "durationMs": 500,                        // Gate 1 C-2: the ceiling is checked here, in CI
    "fromPose": "lintel.codex", "toPose": "lintel.stage",
    "seam": { "deltaE_first": 0.11, "deltaE_last": 0.14, "ssim_first": 0.997, "ssim_last": 0.996 },
    "curation": …, "shotId": "SR-0031", "reversible": true
  }],
  "rites": [{                                 // Gate 1 C-1: the ceremony map's asset home
    "riteId": "binding.exhale",               // closed enum = SH1 §3.2's crossed + bound lists,
                                              // exactly: approach | waking | readiness.first |
                                              // rung.attained | press.first | binding.exhale |
                                              // volume.close  (the marked tier has no world assets)
    "file": "rites/binding_exhale.mp4", "hash": "sha256:…", "durationMs": 2400,
    "fromPose": "bench.chronicle", "toPose": "bench.chronicle",
    "curation": …, "shotId": "SR-0044"
  }],
  "accretion": [{                             // Gate 1 C-5: sprite sheets under the same law
    "channelId": "chronicle.spines",          // closed enum = SH1 §5.3's v1 channel table
    "sheet": "accretion/chronicle_spines.avif", "hash": "sha256:…",
    "slots": ["chronicle.shelf"],
    "curation": …, "shotId": "SR-0051",
    "provenanceDims": ["event:binding.sealed", "mode"]   // schema dimensions only — rubric 17's ledger
  }],
  "grades": {                                 // Gate 1 C-4: the world-tint mechanism
    "kind": "lut", "count": 6,                // the six sanctioned grades (SH2 §1.2 band, ΔE-8 steps)
    "files": [{ "gradeId": "dawn-grey", "file": "grades/dawn_grey.cube", "hash": "sha256:…" }, …]
    // stills ship as ONE neutral master each (SH2 §5.1); the compositor applies the world's
    // grade, derived deterministically per SH1 §5.4 (world ULID + gravity-ruling count → grade
    // index); A-2/A-4 are CI-measured on all six graded outputs of every still, per sealed SH2
  },
  "approach": { …, "reclaimable": true },
  "provenance": "PROVENANCE.json"
}
```

### 3.2 The manifest laws

1. **Stills are the floor.** A manifest with zero clips and zero rites is complete and shippable (SH1-α): every route lands as the drift-cut; every rite falls back to its marked equivalent (SH1 §4.5's fallback logic extended to the rite tier — a missing rite asset renders the marked accretion delta and nothing else, never an error).
2. **The UNCURATED law (Marcus R2, mechanical):** `curation: "UNCURATED"` is valid *only* in a dev build. **`devMode` is a compile-time build variant, never a runtime toggle** *(Gate 1 C-7)* — the CI lint and the runtime check verify the same constant. **The mark, specified** *(Gate 1 T-3/F-10)*: a page-material chip in the shell's chrome layer — page jurisdiction, never composited into the world frame (SH2 §1.1's no-text law is not breached because the mark never enters world pixels); IBM Plex Mono caption size, ink on page ground, fixed bottom-left, static — no pulse, no fade, no animation; zero-cost when the manifest is clean or the build is non-dev; and curation propagates: an UNCURATED accretion sheet inside a PASS still still raises it.
3. **Closed grammars closed in the schema:** `poseId`, `clipId`, `riteId`, `channelId` are enums generated from sealed SH1 — the manifest *cannot express* a 19th pose, a clip class outside the grammar, an eighth rite, or an unenumerated accretion channel. Adding the Campaign Studio bay (P1) is a schema-version event.
4. **Hash or nothing:** a hash mismatch at load = the asset does not exist (→ §6), silently logged locally, re-queued for repair.
5. **The ceilings are linted (G-SH3-9):** every composed route at tier-0 rate vs 2,200ms; every rite vs its SH1 §3 budget (crossed ≤1,600ms, binding.exhale ≤2,400ms, volume.close ≤4,000ms, approach ≤4,000ms).
6. **`register` pin:** the manifest declares the SH2 seal id (`lanternlight-v1`, minted in ADR-SH2-G's log entry — Gate 1 C-15); a register change stales the whole manifest by construction.

### 3.3 Load behavior
Manifest parsed at first world-layer initialization (lazily, post-interactivity). Hash verification incremental (verify-on-first-use + background sweep at idle priority, **yielding to input exactly as teardown does** — Gate 1 F-15). **Dev builds watch the manifest file and hot-reload it** *(Gate 1 F-11)* — the swap property (G-SH3-6) is demonstrated without relaunch; shipping builds read once.

### 3.4 Manifest CI (`atelier-lint`)
Schema validity · closed enums · UNCURATED-outside-dev · slot-placement vs pose family (§3.1) · seam numbers present and under law for every clip and rite (recorded from `check_seam.py`, never asserted) · route/rite ceiling composition (G-SH3-9) · PROVENANCE.json chain for every row incl. accretion `provenanceDims` (schema dimensions only — ADR-SH1-A) · POSES.json pose-frame hashes.

### 3.5 Encode law (extraction, adapted)
`-an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart`, native resolution, never upscaled, light unsharp; AVIF stills at 2× largest supported viewport. **Retime-at-encode is lawful and recorded** *(Gate 1 C-2/T-5)*: generation tools emit ≥5s takes; the encode step retimes/trims to the route table's sealed durations (ARC ~0.5s etc.), and `durationMs` records the *shipped* duration the lint checks. Class-B alternates (tighter GOP) generated only if the Class-B probe population justifies them.

---

## 4. THE ROUTE MACHINE

### 4.1 Bindings (SH1 §2.6, implemented)
| Input | Implementation |
|---|---|
| ⌘K palette | Renders above and independent of everything; opens over any state incl. mid-flight/mid-rite; selection lands seated via drift-cut at most; exempt from any queued hold. Never mounts inside WorldStage's tree |
| Room icons / shelf | `navigate(routeKey)` at current tier |
| `Ctrl+PgUp/PgDn` | Ring walk ±1 (Turn at building scale) |
| Back / forward | Reverse route, one tier faster than its familiarity |
| Deep links / OS re-open | Land seated directly; optional 240ms drift from last room; cold resume never flies |

### 4.2 The route compiler
`Route(a→b)` composed per SH1 §2.2 from the manifest's *available* clips; any missing segment collapses the whole route to drift-cut (a route flies whole or cuts — never partial). Familiarity tiers 0–3 per SH1 §2.5 with reverse half-credit, spoke generalization, pin-to-tier-3, and the global "swift from the start" choice. Counters in `studio.sqlite`.

### 4.3 The interruption machine
`queued → flying → landing → seated` per SH1 §2.4 with the Gate-1-SH1 hardenings: `queued` gates only WorldStage's first frame; palette navigations skip `queued`; the triggering input replayed into the destination (buffered at the router, delivered after mount, ≤120ms total). **The cancelled disposition** *(Gate 1 F-6)*: navigating mid-flight cancels and re-routes from the nearest locked pose; a destination instrument already mounting for the cancelled route receives `unmount()` **at idle priority, never contending with the new landing's mount or the ≤120ms skip guarantee**; `mount()` remains once-per-landing — a cancelled landing is a landing that ends in `unmount`, not a second `mount`.

### 4.4 The route log
SH1 §2.8's schema verbatim in `studio.sqlite`: local-only, user-inspectable, exportable, clearable, ring-buffered at 2,000 transits with aggregate folding. **Persistence is fire-and-forget off the navigation path** *(Gate 1 F-5)*: writes are queued to the Rust host asynchronously, never block landing or input delivery, main-thread cost ≤1ms per transit; §9.2's TTFI protocol runs with logging enabled so the tax cannot hide.

---

## 5. THE SEAT-SURFACE CONTRACT (how a bay hands off to an instrument)

### 5.1 The contract (the interface proposal to the SPEC-002 workstream — R3)

```ts
type BayId = 'forge'|'charter'|'codex'|'stage'|'chronicle'|'academy'|'press'|'lodge';  // 8 bays (SH1 §2.1)
type SeatId = BayId | 'sanctum';   // the garth-center pose is the Sanctum's bench (clause 8);
                                   // the Sanctum seats an instrument like any bay — Gate 1 C-8:
                                   // the Sanctum is not a bay and the enum does not pretend it is

interface SeatSurface {
  // The shell calls this exactly once per landing (a cancelled landing ends in unmount — §4.3).
  mount(host: HTMLElement, ctx: SeatContext): SeatedInstrument;
}
interface SeatContext {
  worldId: string; seatId: SeatId;
  arrival: 'passage' | 'drift-cut' | 'cold' | 'deep-link';
  reducedMotion: boolean;
  announce(text: string): void;                 // the live-region channel ("The Chronicle. Seated.")
  pageMotionPermitted: Promise<void>;           // resolves at WorldStage unmount — the airlock's
                                                // signal IS the contract (Gate 1 C-12/F-2): no
                                                // registered page motion before it resolves
}
interface SeatedInstrument {
  readonly ready: Promise<void>;                // resolves when interactive (starts the teardown clock)
  focusFirst(): void;                           // the shell owns focus routing
  snapToEnd(): Promise<void>;                   // complete any in-flight page motion NOW; the shell
                                                // awaits min(this, 120ms) before WorldStage's first frame
  unmount(): void;
}
```

**Bounds and failure (Gate 1 F-1 — the contract's hardest law):** `ready` carries a **2,000ms deadline**: if unresolved, the shell proceeds to teardown anyway (dormancy is never hostage to an instrument), keeps the page-card vignette painted until the instrument paints, and logs the overrun locally. If `mount()` throws or the instrument dies, the seat renders the page-card vignette (§6) with a route-log row — the contract's failure state is a clause, not a doubt. `snapToEnd` is awaited at most 120ms; a slower resolve is abandoned (the airlock does not wait on a misbehaving page — input is sovereign).

**The airlock, mechanically:** the shell mounts the instrument *complete and static* (arrival motion suppressed when `arrival !== 'cold'`); no registered page motion (anything with a duration and an easing) begins until `pageMotionPermitted` resolves at teardown completion; instantaneous input echo (caret, character paint, focus ring) is exempt and expected.

### 5.2 The placeholder folio (R3, ratified)
`ThrowawayFolio_DELETE_BY_DESIGN` — a pane implementing `SeatSurface` with: a focusable text input (proves keystroke replay + focus routing), and **one 880ms airlock-probe motion — a flat token-grey bar sweep, deliberately inert; it exists to be interrupted, not watched** — exercising `snapToEnd` at the page's longest legal register, *named here as a simulated Binding-seal duration-class fixture so the 880ms ceremony register is invoked lawfully and on purpose* *(Gate 1 T-6/C-10: "decorative" struck; a fixture inherits taste law or teaches the codebase that dev builds are lawless)*. Ledger-token surfaces only; an on-screen contract monitor in dev mode logging every airlock event with timestamps. No composer logic, no core queries, no persistence. Deleted the day a real folio seats; `seat-surface.d.ts` is the artifact that survives, handed to the SPEC-002 workstream as a proposal, never an edict.

---

## 6. FAILURE MODES & THE DEGRADATION LADDER (a broken flight may not exist)

| Failure | Behavior |
|---|---|
| Clip/rite missing / hash-stale / decode error / first frame not ready in 150ms | Instant 240ms drift-cut from stills (rites: the marked equivalent). Silent; logged locally; re-queued |
| Still missing / hash-stale | The page-card vignette: room name in ink on page material, card resting on obsidian (obsidian never carries text) |
| Instrument mount failure / `ready` overrun | Page-card vignette + route-log row (§5.1) |
| Manifest missing/corrupt | World-layer-off (crossfade navigation); full parity; a quiet settings note, no error theater |
| Disk pressure / user prunes | Still-only or off; navigation never hostage to art |

Class A full clips · Class B (500ms decode probe, **run post-interactivity only, never on the cold-launch critical path** — Gate 1 F-15) stills + drift-cuts, clips never decoded · Class C (reduced-motion / plain-page / opt-out) 200ms crossfades, effectively always dormant. Class measured once, user-visible, user-overridable. "Extinguish the world layer": one toggle, instant, total parity, accretion still recorded, no mourning copy.

---

## 7. ACCESS (keyboard-complete, WCAG 2.2 AA)

Every room, route, and skip reachable without a pointer · flights and rites `aria-hidden`; focus management is the real navigation; landing announces destination and stance once, politely · `prefers-reduced-motion` ⇒ Class C, zero capability difference · travel silent always; opt-in single dry paper tick on landing · tremor mode: skip accepts dwell; no timing-sensitive input anywhere.

---

## 8. THE ACCRETION LAYER

The atelier-worker composites the manifest's `accretion` sheets into declared `anchorSlots` over base stills, cached by `(worldId, accretionHash)`; channels exactly as sealed (SH1 §5.3's closed v1 table); inputs event-log facts and countable archive state only, aggregated only along schema dimensions (ADR-SH1-A), output shape mass-and-wear-never-markers (C-8). Deterministic: same event log ⇒ byte-identical composite. Static forever.

**Travel never waits on accretion** *(Gate 1 F-9)*: if a composite is stale or still building when a navigation needs it, the shell serves the previous composite (or the base still) immediately and swaps on *next* travel — staleness is always preferred to delay; there is no code path by which the worker can add latency to a flight or a drift-cut.

Consumption from core: `archive.query`/`metrics` via the published API only. Any need the API cannot express becomes an interface proposal, never an edit.

---

## 9. THE PERFORMANCE TEST PLAN (dormancy by measurement, not assertion)

1. **The dormancy rig (G-SH3-1):** scripted 10-minute seated session (typing, searching, ≥30 hovers **with dwells deliberately straddling 150ms** — sub-trigger flicks, held hovers that fire preflight then abandon, held hovers into navigation) on the named reference machine; Rust host samples GPU utilization at 1Hz **and records decoder-handle create/destroy events continuously** (the 1Hz half covers sustained residency; the event half covers sub-second sins — Gate 1 T-10). Assertions: zero handles outside sanctioned preflight windows; every preflight handle released per §2.2's abandonment law; GPU delta ≤ 2% vs control. CI per release; runner down ⇒ release blocks.
2. **TTFI protocol (G-SH3-2):** the S1 method carried to production: ≥120 scripted navigations per mode + ≥40 real-input trials per tier class (counts inherited from the S1 spike's own design — that is their naming), drift-cut vs hard-cut control, input-inclusive clock, **route logging enabled** (F-5); population + tier-3 slice reported.
3. **Preflight budget:** trace-based: ≤4ms per intent event AND longest-task ≤4ms across all preflight work (the 80ms is a sum, never a block); decode thread-attributed off-main.
4. **Budget clocks, defined (G-SH3-4, Gate 1 F-8):** folio paint = navigation-complete event → destination folio's first painted frame, ≤80ms · cold resume = process launch → cursor blinking in Codex search, ≤2s · palette = keydown(⌘K) → first painted, focused input, <100ms. Measured with layer installed, full manifest.
5. **Soak, two forms** *(Gate 1 F-13)*: (a) 1,000 scripted random navigations (mixed tiers, interrupts, reroutes); zero stalls, zero swallowed keystrokes, memory returns to dormant baseline after each seat; (b) **the long day: a scripted 4-hour mixed session** (seated work + periodic navigation + hovers + one rite) with memory, handle, and object-URL counts sampled throughout, asserted flat — slow leaks are invisible at ten minutes.

---

## 10. METHOD — RIVALS, ADRs, RUBRIC, STAGING

### 10.1 Rivals for the engine embedding (developed to fail honestly)
- **R1 · Live compositor process:** kills G-SH3-1's provability (a resident process is never dormant); IPC taxes the 120ms skip law. Dies.
- **R2 · WebGL/three.js hybrid:** live 3D by the back door — ADR-SH1-C killed it; a GL context is residency. Dies.
- **R3 · OS-native video layer:** per-OS divergence unauditable against frame-level airlock law; compositing UI above native surfaces is where dropped frames live. Dies.
- **VICTOR · Single-webview DOM engine** — one `<video>` + canvas2d in the page's own webview, mounted only in flight/rite. Every law enforceable in one compositor with one clock, provable by DOM absence. The S1 spike measured this shape: +0.2ms.

### 10.2 ADRs (appended to ADR-LOG at seal)
- **ADR-SH3-A · Vendored extraction, no runtime dependency** on scroll-world; scrub input model discarded; blob/seam/GOP/pipeline discipline kept as annotated library code with provenance headers naming the fork commit.
- **ADR-SH3-B · The pipeline runs as a repo CLI** (`studio/PIPELINE/atelier.mjs`), not a slash-skill: deterministic, diffable, CI-runnable; a thin skill wrapper may *invoke* it later (the CLI is the law, the skill is a doorbell). *(Marcus delegated this call — R4, ADR-LOG 2026-07-16.)*
- **ADR-SH3-C · The UNCURATED flag lives in the manifest**, not filenames/directories — one source of truth for lint, watermark, and swap property.
- **ADR-SH3-D · The shot record is the unit of generation** (the Shot Record addendum, filed verbatim in the ADR-LOG): no prompt exists outside a shot record; records are repo-stored, diffable, reviewed before any credit burns.
- **ADR-SH3-E · `apps/studio-shell` is a new workspace in this repo**; the root web presence remains the separate, later derivative.
- **ADR-SH3-F · Retime-at-encode** *(minted at Gate 1, C-2/T-5)*: generation tools emit ≥5s takes; sealed route-table durations are produced at encode; `durationMs` records shipped truth; G-SH3-9 lints it. The alternative — demanding 0.5s generations — fights every current tool's minimum and was rejected.
- **ADR-SH3-G · The intake instrument is a separate tool** *(minted at Gate 1, C-6)*: `studio/PIPELINE/intake.mjs`, run only by the canon holder, is the sole writer of `PASS`/`FAIL` curation objects and intake-side shot-record fields; the pipeline package contains no such writer; shot-record fields are partitioned pipeline-writable vs intake-writable in the schema.

### 10.3 The adversarial rubric (fresh-context; any fail blocks)
1. Delete every clip and rite from the manifest: all 72 routes land as drift-cuts, all rites as marked equivalents, zero errors.
2. Corrupt one hash: the asset ceases to exist; fallback per §6; local repair log written.
3. Ship-lint a manifest with one UNCURATED asset (try all four sections): CI fails; dev build shows the specified mark within the asset's first painted frame.
4. Swap an UNCURATED slot for intake-PASS: zero code diff, no relaunch, behavior identical.
5. Mash keys mid-flight ×50 AND mash *reroutes* ×50 (navigate mid-flight repeatedly): interactive ≤120ms, typed text intact, cancelled instruments unmounted at idle priority, every time.
6. The dormancy rig (§9.1) passes on the named machine.
7. Placeholder folio: trigger the 880ms probe motion, navigate mid-motion: snap ≤120ms, zero overlap frames (contract monitor as evidence). Wedge test: an instrument whose `ready` never resolves — teardown proceeds at 2,000ms, dormancy reached, vignette painted.
8. ⌘K from every state incl. mid-rite: <100ms, never dressed by the world.
9. Screen-reader session: every seat reached and announced once; flights and rites inaudible.
10. Reduced-motion session: nothing exceeds 200ms; zero capability loss.
11. Pipeline audit: attempt to make the pipeline write PASS — no code path exists (G-SH3-8); the intake instrument refuses to run without the canon holder's operator flag.
12. Shot-record audit: 5 shipped assets; each traces to a record whose elements are canonical reference IDs; no element identity in free prose.
13. POSITIVE-LOCKS audit: every FAIL take has a lock or a recorded founder waiver.
14. Route-ceiling lint (G-SH3-9) run against a deliberately over-long clip: build fails.
15. Grade determinism: two profiles, same world ULID + ruling count ⇒ byte-identical graded stills; A-2/A-4 green on all six grades.
16. The SH1 rubric (items 1–17) re-run against the built shell, unchanged.

### 10.4 Staging
- **SH3-α · The walkable vertical slice (the seal's implementation target):** Gate (shelf pose + Approach) → Ambulatory (garth + ring navigation, drift-cut everywhere) → one seated bay (the Chronicle) with `ThrowawayFolio_DELETE_BY_DESIGN` live; real harvest assets flagged UNCURATED; G-SH3-2/4/7 green; dormancy rig green; the zero-code swap demonstrated live with whatever intake-PASS assets exist.
- **SH3-β · Flights:** clip slots fill as harvest passes intake; decay machine activates per-route automatically (the manifest is the switch). G-SH3-3's SSIM threshold re-pinned by ADR from the first ten production seams before β ships.
- **SH3-γ · Accretion channels** per SH1 §6.4's staging.
- **SH3-δ · The Rites** *(restored per Gate 1 C-1)*: rite assets per SH1 §3.2's closed list, ceilings linted, second-in-sitting demotion verified.
- **The Atelier Pipeline (§11) is built in the α phase — the slice is its first customer (R4).**

---

## 11. THE ATELIER PIPELINE — the asset factory as permanent capability (Marcus R4 + the Shot Record addendum)

> The scroll-world workflow discipline, extracted and rebuilt canon-aware. Not a one-night heroic: a supervised, resumable, spend-gated instrument the canon holder can point at a new bay, an accretion set, or (later, elsewhere) the landing page. **It proposes; the intake gate disposes; the canon holder curates.**

### 11.1 What it never does (constitutional)
- Never asks a style question. The interview's art-direction step is **replaced by sealed SH2**: the Canon Style Block v2 closes every prompt verbatim; Prop One and gate-frame references attach automatically; the negative canon rides wherever the tool takes negatives.
- Never invents a scene. SH1's route table + pose ledger + rite list + accretion channel table **is the shotlist**.
- Never spends without approval: generation-count estimate × calibrated per-unit cost **before any credit burns** (calibrate with one still + one video against workspace balance, extrapolate, warn ≥70% — extraction law). Approval at the shot-record level.
- Never self-ratifies: outputs are exactly (a) `intake-queue/` entries and (b) UNCURATED manifest slots. PASS is written only by the separate intake instrument (ADR-SH3-G). G-SH3-8 audits.
- Never touches `packages/core`, the event log, or any user content. Inputs are canon documents and authored references only.

### 11.2 The Shot Record (addendum (a) — the unit of generation)

Every generated asset originates as one typed, repo-stored, diffable object in `studio/PIPELINE/shots/`:

```jsonc
{
  "shotId": "SR-0031",
  "routeOrScene": "ARC(3,4)",                  // route-table key, pose id, rite id, or channel id
  "intent": "The ambulatory walk from the Codex lintel to the Stage lintel, nothing happening.",
  "generationSeconds": 5,                       // what the tool renders (tool minimum)
  "shippedDurationMs": 500,                     // what the encode retimes to — SH1 §2.2's law
                                                // (ADR-SH3-F; Gate 1 C-2/T-5: the draft's single
                                                // "duration: 5" breached the ceiling arithmetic)
  "elements": ["PROP-ONE@sha256:…", "POSE:lintel.codex@sha256:…", "POSE:lintel.stage@sha256:…"],
                                                // exact canonical reference IDs — never prose
  "prompt": "…one complete standalone generation prompt (call-sheet skeleton, §11.4)…",
  "continuityNotes": "N lanterns pass; fixed-hour shadows; reversible-arc physics (steady flames)",
  "status": "draft | approved | generating | harvested | intake-queued",
                                                // pipeline-writable states end at intake-queued;
                                                // "PASS" / "FAIL(check-ids)" live in a separate
                                                // intake-owned field written only by intake.mjs
                                                // (ADR-SH3-G — the pipeline cannot spell PASS)
  "intake": null | { "verdict": "PASS" | "FAIL", "checkIds": [], "date": "…", "curator": "marcus" },
  "takes": [{ "takeId": 1, "tool": "higgsfield:seedance_2_0", "date": "…", "result": "…",
              "failure": "…", "lockMinted": "LOCK-014?" }]
}
```

The manifest (§3) is thereby **the ledger of shot records whose outputs passed HARVEST-INTAKE** — every manifest row (poses, clips, rites, accretion) carries its `shotId` backlink; rubric 12 walks the chain.

### 11.3 Context gating & the identity firewall (addendum (b), (c))

- **Prompt-writing is context-gated:** the pipeline refuses to compose a prompt until it has loaded the authoritative record set — sealed SH2 (style law) · the canonical element registry (`studio/PIPELINE/ELEMENTS.json`: Prop One and the prop canon, pose frames, banked neighbor frames, hash-addressed) · SH1's route table (the shotlist) · the append-only `POSITIVE-LOCKS.md`. **A prompt written without these inputs is invalid by construction** — the composer function takes them as required arguments; there is no default.
- **The identity firewall:** elements are canon. The pipeline never invents, substitutes, or re-describes an element's identity in prose — *behavior is directed; identity is referenced* (Law 5). A shot needing an unregistered element, or a decision that would change a shot, **halts and surfaces to the canon holder** — never guesses. The halt is a first-class status; the `status` command (§11.5) surfaces every halt at a glance *(Gate 1 F-7: a detached run must not halt silently at 1am)*.

### 11.4 The Higgsfield Cinematography Doctrine (canonized — addendum (e); the canon holder's own instrument, 2026-07-16)

**The eight laws:**
1. **One prompt, one shot, one camera thought.** Never two moves; a second move needs a trigger and a settle point.
2. **Frame one is a finished photograph, including what is absent.** For A&A: a chain's first frame is a banked, intake-PASSed pose still; every subsequent clip's frame one is the previous clip's actual rendered last frame (§11.6 — the two anchors are one law at different links of the chain).
3. **Order events causally, then lock them with counts.** Restate every count and every "never" in the locks.
4. **Direct physics, not adjectives.** Weight, momentum, sequence of effects — each named with its behavior.
5. **Identity lives in references; prompts direct only behavior.** Scope every reference.
6. **Specify the terminal state as firmly as the first frame.** The last frame of clip N is the first frame of clip N+1 — the seam is an endpoint contract, so both endpoints are photographs.
7. **Locks are scar tissue.** Every rejected take's failure mode becomes a permanent lock in the template.
8. **Style section stays short.** Style is carried by the reference images and the Canon Style Block v2, never re-litigated per shot.

**The call-sheet skeleton (every flight prompt, in this order):**
`SCENE CONTEXT → ACTIVE REFERENCES → LOCATION MAP → FIRST FRAME → CAMERA → ACTION → PHYSICS → LIGHTING → AUDIO → STYLE → POSITIVE LOCKS`

**The A&A monastic flight template** (the register is minimal cinema — the template's job is largely to *forbid* event beats, because a model left undirected fills silence with drama). *Gate 1 amendments applied in-line: the night bird and footsteps convicted (T-1 — the template's own poetry exceeding its discipline); "true darkness" convicted against SH2 §1.2's lifted blacks (T-2); flames made indifferent to the walker (T-8 — the world never responds to your passage); eye height parameterized against SH2 §5.4's three sealed heights (T-7).*

> SCENE CONTEXT: One continuous shot. A slow, level walk at night through [ROUTE]. Nothing happens. No one appears. The world is asleep; only the walker's viewpoint moves.
> ACTIVE REFERENCES: <<<start-frame>>> — 100% match, the first frame verbatim. <<<end-frame>>> — 100% match, the final frame verbatim. <<<prop-one>>> — the brass-and-horn reliquary lantern; every lantern in frame is this design exactly.
> LOCATION MAP: [the corridor's geography: arches left onto the dark garth, lanterns on stone shelves right at intervals, worn flagstones, timber beams low overhead, the far corner as destination.]
> FIRST FRAME: exactly the start reference — eye height {POSE_EYE_HEIGHT per SH2 §5.4: 155cm bench / 160cm shelf / 165cm lintel & garth}, level, facing [bearing]. No figures, no motion except flame.
> CAMERA: a single steady dolly forward at slow walking pace, 1.2 m/s, perfectly level, no handheld shake, no bob, no rotation except [one gentle natural turn at the corner, settling to face [bearing]]. The camera never rises, never swoops, never accelerates.
> ACTION: none. The only motion in the world: flame-light flickers faintly and indifferently — the flames were moving before the walker arrived and continue after; nothing in the world responds to the walker's passage. Shadows slide correspondingly along stone. Nothing else moves.
> PHYSICS: candle flame sways only from still air, never gutters; light falloff obeys inverse square — pools of amber alternating with deep warm shadow, lifted soft blacks, never pure black; stone and timber utterly static; no wind, no dust motes drifting through beams unless already present in frame one.
> LIGHTING: sole sources are the lanterns in frame; environment always dimmer than flame; fixed low shadow angle, the same canonical hour; gentle film halation around each flame.
> AUDIO: none. The corridor is silent — no footsteps, no wildlife, no wind, no music. Silence is a motion direction: nothing in the world is moving enough to make a sound.
> STYLE: [Canon Style Block v2, appended verbatim.]
> POSITIVE LOCKS: one continuous shot, no cuts. NO people, figures, animals, or faces anywhere, ever. No doors open, nothing falls, no light changes state, no weather. Exactly [N] lanterns pass through frame, all identical to <<<prop-one>>>. The camera remains at eye height for the entire duration and ends at rest. The final frame matches <<<end-frame>>> exactly — the walk settles, no flourish, no push past the mark, no fade. Monastic calm; a walk, never a flyover.

*(Reversible ARC clips take SH2 U-11's substitution: zero flame motion — flames painted steady. The AUDIO section exists because leaving a model's audio channel undirected changes its motion behavior; generated sound is stripped at encode (`-an`) and travel is silent by sealed law regardless. The 1.2 m/s figure is generation guidance for a legible walking pace at 1.0×; the shipped duration is retimed at encode (ADR-SH3-F) and playbackRate applies tiers — speed is not a contract of the asset.)*

### 11.5 The workflow (extraction, rebuilt)

`plan → estimate → approve → generate → verify → queue`

1. **Plan:** operator names the target (route(s), pose(s), rite(s), accretion channel); pipeline emits draft shot records from the shotlist + registry (context-gated, §11.3).
2. **Estimate (spend gate):** generation counts × calibrated unit costs; previz tier offered for large runs (frame-locking draft model first, approve the journey, re-render finals); estimate + shot records go to the canon holder together.
3. **Approve:** human approval at the record level; approval hash recorded in the record.
4. **Generate:** submission programmatic via the **Higgsfield MCP** (addendum (d), as filed in the ADR-LOG), detached, polled, resumable; per-shot job files; individual re-roll, never batch restart; NSFW playbook in the extraction's order (re-roll → strip trigger words → alternate frame-locking provider with the SAME endpoint frames → surface to canon holder). **Manual GUI paste survives only as a documented fallback** (`studio/PIPELINE/FALLBACK.md`), producing the same take rows by hand.
5. **Verify (the anchor gate):** endpoint frames vs locked poses (`check_seam.py`, ΔE76 + SSIM into the record); adjacent-clip seams; **every machine-measurable SH2 acceptance check pre-run here — A-2 highlight ceiling, A-4 warm-band histogram, A-5 eye-height geometry, A-6 text/figure detector — results attached to the intake-queue entry, so the canon holder's attention is spent only on human judgments** *(Gate 1 F-7)*; encode per §3.5 (retime to shipped duration); poster extraction.
6. **Queue:** `intake-queue/` entry + UNCURATED manifest slot written. **Full stop.** The canon holder runs the intake instrument (`intake.mjs`, ADR-SH3-G — the sole PASS writer); PASS replaces the curation object; FAIL mints its lock (Law 7) and the record cycles.

**The `status` command** *(Gate 1 F-7)*: one invocation surfaces, at a glance — halts awaiting the canon holder, generation jobs in flight/failed, credit balance vs estimate, intake-queue depth, and every FAIL without a lock. A detached run can never halt silently.

### 11.6 The seam-anchor law (reconciled — Gate 1 C-3) & style-locked batching
The two anchor rules are one law at different links: **the first clip of any chain anchors to a banked, intake-PASSed pose still** (Law 2 — frame one is a finished photograph); **every subsequent link anchors to the ACTUAL RENDERED FRAME of its neighbor** (the extraction's hard rule — "every generation renders slightly differently"; using the pose still mid-chain is the seam-pop failure mode, and the founding lock stands: *endpoint frames from renders, never stills, at every mid-chain link*). Both ends of every clip are then verified against the locked pose frames by the ΔE/SSIM gate — the pose still remains the *reference truth* even where it is not the *generation input*. The pipeline refuses to generate any clip whose `fromPose`/`toPose` stills are not intake-PASS (the anchor gate), and refuses any mid-chain generation whose neighbor render is absent. One video model per chain (the sanctioned single-clip NSFW exception recorded in the take row). Batches are style-locked: identical Canon Style Block v2, same reference hashes for shared elements.

### 11.7 Idempotent resumability
Every step writes its state into the shot record; re-running is always safe (done work skipped by hash, not memory); a crashed run resumes from records. `not_enough_credits` mid-run is recoverable by design: finished takes survive, resume after top-up.

### 11.8 POSITIVE-LOCKS.md (append-only scar tissue)
Seeded from the extraction's gotchas + the pilot's paid failures *(Gate 1 T-9: scar tissue already bought and not written down will be bought again)*: *no swoop · no camera rise above eye height · **no camera descent below eye height** · no glass lanterns / hurricane silhouettes / glass chimneys · no letters or pseudo-text · no people, figures, hands, shadows-of-people · no drinking horns · no electric lighting or mounted lamps · **no digital sharpness** · **no volumetric light, god rays, or haze** · **no cold or blue grading** · **no shadow-angle drift within a clip (the fixed hour holds mid-flight)** · no end-frame flourish or push past the mark · no fade-out · one model per chain · endpoint frames from renders, never stills, at every mid-chain link · no upscaling.* Every future FAIL adds a lock with its take reference. Locks are never removed — only waived per-shot by the canon holder, in writing, in the record.

---

## NAMED-NUMBER REGISTER (Gate 1 T-11 — every number this spec minted, and its naming)
- **SSIM ≥ 0.985** — named at G-SH3-3; provisional, re-pinned by ADR from the first ten production seams.
- **`ready` deadline 2,000ms** — SPEC-001's cold-resume budget applied to a single instrument: a pane slower than the whole app's resume law is already broken; teardown must not wait longer than the product's own patience.
- **Preflight abandonment grace 2s** — one deliberate re-hover survives; a parked decoder does not; below the 5s clip-length floor so an abandoned decoder never outlives the clip it opened.
- **Route-log write ≤1ms main-thread** — one-quarter of the preflight event budget; the instrument may never cost more than the intent it records.
- **GPU delta ≤2%** — twice the S1 spike's observed noise floor on the reference class; a bound, not a hope.
- **§9.2 trial counts (≥120/≥40)** — inherited from the S1 spike's own passed design.
- **1Hz sampling** — sufficient only for *sustained* residency, which is why the event hooks exist alongside it (T-10); neither instrument alone is the assertion.
- **4-hour long-day soak** — half a working day: long enough for per-transit leaks (~hundreds of navigations) to become visible slopes, short enough to run nightly.

## OPEN QUESTIONS FOR THE VERIFIER (author's doubt register, post-Gate-1)
1. ~~SeatSurface error states~~ — cured at §5.1 (Gate 1 F-1/C-12).
2. The reference CI runner is now named as a machine *class* (§1); the concrete box must still be provisioned and its counters validated against the S1 methodology before SH3-α's gate run — an operational dependency, not a spec gap, but it can slip the slice.
3. ~~1.2 m/s vs playbackRate~~ — resolved: ADR-SH3-F (retime-at-encode); speed is generation guidance, never an asset contract.
4. The rite tier's fallback ("marked equivalent") is specified behaviorally but the marked accretion deltas for each rite need their channel mappings confirmed against SH1 §5.3 at implementation — flag for the verifier.

---

*Gate 1 applied in full (42/42; transcript `drafts/SH3-GATE1-TRANSCRIPT.md`). Canon-affecting items: none — this spec consumes sealed law and mints shell/pipeline ADRs (SH3-A…G). Companion edits queued at seal: ladder row; ADR-LOG append (ADRs + the Shot Record addendum filed verbatim + the `lanternlight-v1` register id minted); `seat-surface.d.ts` handed to the SPEC-002 workstream as an interface proposal. Awaiting Marcus: seal ruling on this draft.*
