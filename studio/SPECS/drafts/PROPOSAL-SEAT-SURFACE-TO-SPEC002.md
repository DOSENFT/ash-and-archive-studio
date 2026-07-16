# PROPOSAL — THE SEAT-SURFACE CONTRACT, offered to the SPEC-002 workstream
*2026-07-16 · From the SH3 shell workstream · Status: PROPOSAL (never an edict — SPEC-SH3 §5.1; boundary law: integration questions travel as proposals in both directions). Normative artifact: `packages/atelier/src/seat-surface.d.ts`. Evidence: `apps/studio-shell/src/folios/ThrowawayFolio_DELETE_BY_DESIGN.ts` + its dev contract monitor, SH3 Gate 1 transcript, the running SH3-α slice.*

## 1. What this is
The complete handshake by which the Studio Shell seats an instrument in a bay: four types (`SeatSurface`, `SeatContext`, `SeatedInstrument`, `Arrival`), ~40 lines. Everything the composer will ever need from the world layer arrives through `SeatContext`; everything the shell needs back is three methods and two promises. The Foundation appears nowhere in it — the contract is composer-shaped but core-free, exactly per SH1 §4.1's dependency law.

## 2. What the experiment proved (the ThrowawayFolio's findings, demonstrated in the running slice)
- **The airlock is expressible as a single promise.** `ctx.pageMotionPermitted` resolving at WorldStage teardown is sufficient — the fixture's 880ms probe motion is mechanically refused before resolution and runs lawfully after; no instrument needs to know *why* motion is forbidden, only *whether*. The constitutional law (clause 8) compiles down to one `await`.
- **Interactive-at-frame-0 costs nothing.** A statically-composed pane can honestly return `ready: Promise.resolve()`; the drift-cut overlays it with `pointer-events: none` and input flows to a live page beneath the landing's visual tail. SH1 F-1's non-blocking law needed no cleverness at the instrument side — the shell carries all of it.
- **Departure is one method.** `snapToEnd(): Promise<void>` + the shell's 120ms race covers every case the fixture could produce: motion in flight (snapped via `Animation.finish()`), no motion (immediate resolve), and a misbehaving slow resolve (abandoned at 120ms — input stays sovereign).
- **Focus routing belongs to the shell.** `focusFirst()` called after teardown (not at mount) means the instrument never fights the palette, the landing tail, or a mid-flight reroute for focus. The fixture's bench input receives replayed-into-destination keystrokes intact.
- **The announcement channel works as a context capability**, not an instrument responsibility: `ctx.announce('The Chronicle. Seated.')` — once, politely, into the shell's single live region. No instrument owns an aria-live region of its own.

## 3. What was falsified along the way (recorded so the composer doesn't re-learn it)
- **`snapToEnd(): void` (v0.1) was falsified before implementation** (Gate 1 F-2/C-12): a void return forces either a flat 120ms tax on every departure or an invented side channel. The promise is load-bearing.
- **An unbounded `ready` was falsified** (Gate 1 F-1): without the 2,000ms deadline, one slow instrument wedges the airlock and forbids page motion forever. Deadline semantics: the shell proceeds to teardown regardless; the page-card vignette holds until the instrument paints; the overrun is logged. **An instrument slower than 2s to interactivity is already in breach of the product's own resume law.**
- **"9 bays" was falsified** (Gate 1 C-8): the Sanctum is a seat, not a bay. `SeatId = BayId | 'sanctum'` — the composer should expect to seat an instrument at the garth exactly as at a bench.
- **Nothing in the v0.2 contract was falsified by the build.** The fixture implemented it verbatim, no workarounds, no private channels. That is the strongest evidence this document carries.

## 4. What we propose becomes constitutional at SPEC-002's next revision
1. The four types as written in `seat-surface.d.ts`, including the deadline and 120ms race semantics in their doc comments.
2. **Mount-complete-and-static:** when `arrival !== 'cold'`, the folio composes complete with arrival motion suppressed (the Table's law, generalized). The composer's stagger-reveals and scribe's-hand motions key off `arrival === 'cold'` (no Passage occurred) only.
3. **The airlock promise as the only motion gate.** No composer surface ever inspects WorldStage state, timers, or route machinery — `pageMotionPermitted` is the entire visibility the page has into the world, by design.
4. **Failure = page-card:** a thrown `mount()` or `ready` overrun renders the shell's page-card vignette + a local route-log row. Instruments never render their own error theater.

## 5. What remains intentionally provisional (the composer's side of the table)
- **`SeatContext` payload for a real folio.** The fixture needed no data; `compose()` needs its seven arguments (SPEC-002 §1.1). Whether the shell passes a ready `Folio`, or the composer runtime lives above the seat and the shell hosts only its output element, is SPEC-002's call — the contract deliberately says `mount(host, ctx)` and nothing about what the instrument does inside `host`.
- **`worldId` as a string** is a placeholder for whatever vault-identity handle core's API exposes; type to be tightened by whoever owns that surface.
- **Reduced-ceremony signaling.** `reducedMotion: boolean` suffices for the fixture; a real folio may need the fuller page-ceremony state (second-ceremony demotion, banked-vs-full seal). Propose extending `SeatContext` then, not now — no speculative fields.
- **The 2,000ms `ready` deadline number** is named (SPEC-001's resume budget applied to a pane) but should be re-examined once a real composed folio's cold path is measurable.

## 6. Acceptance offered
The shell workstream will hold `seat-surface.d.ts` frozen until SPEC-002's owners respond. Counter-proposals are welcome as diffs against the `.d.ts`; the ThrowawayFolio remains in-tree until a real folio seats, so any revision can be re-proven against the same fixture before the fixture dies.
