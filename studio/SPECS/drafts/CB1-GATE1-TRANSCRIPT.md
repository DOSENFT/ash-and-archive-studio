# CB1 · GATE 1 TRANSCRIPT — three fresh-context hostile reviewers vs SPEC-CB1 v0.1
*2026-07-16 · Per precedent (SH1/SH3 Gate 1). Reviewers dispatched fresh-context (none saw the drafting), each against the sealed canon set + the v0.1 draft. Verdicts reproduced verbatim below; dispositions follow. Result: **28 findings, 28 accepted, 0 rejected** → draft v0.2.*

---

## REVIEWER 1 — THE TEN-HOUR FATIGUE ADVOCATE (verbatim)

**F-1 · CRITICAL · The ≤16ms echo is a gate assertion with no mechanism behind it — [full text as delivered]: CB1 declares (G-CB1-7, Named-Number Register) that keystroke echo "must never wait on compose" — but the design guarantees the opposite. compose() is synchronous by sealed law (C-2), the worker rival is explicitly killed (§10.1 R2), and the render remainder is budgeted at ≤60ms p50 (§8.1) — all on the one main thread the caret lives on. A keystroke arriving one millisecond after a fold delta waits behind up to ~75ms of compose+render before its glyph paints; at 90wpm against combat-cadence deltas these collisions are constant, and the ten-hour hand feels every one as jank. Nowhere does CB1 specify input-priority scheduling, recompose deferral while keys are buffered, or render time-slicing. Remedy: specify the mechanism, not the number — e.g., "a pending recompose/commit MUST yield to buffered input events; recompose for the active folio is scheduled after the input queue drains, echo painted first" — and make G-CB1-7's typing stream deliberately collide with delta arrival, not merely coexist at recorded cadence.**

**F-2 · CRITICAL · No focus/caret law across recompose — the spec never says a re-render cannot move the typing hand. [Quill is Return-stays-open (§3.3); DamageHealInput live on vitals; fold deltas from other actors recompose continuously; §3.2 asserts geometry stability, not focus; unfold/open state ownership unspecified.] Remedy: named law — "recompose MUST NOT move focus, collapse a focused Unfold/Quill, or discard uncommitted input text" — unfold/open state's home specified, plus fixture: type mid-Quill through the full stress replay, zero focus moves, zero lost characters.**

**F-3 · HIGH · Auto-turn can yank the page out from under active text entry. Remedy: "an auto directive received while a text input has focus and uncommitted content downgrades to offer" + rubric fixture.**

**F-4 · HIGH · Related-delta bursts have no coalescing law. Remedy: deltas to the same folio within one frame collapse to one recompose against the latest GameState; at most one uncommitted render per folio; burst fixture (N≥5 same-tick deltas ⇒ 1 paint per affected folio).**

**F-5 · HIGH · The interim veil scan is an unbudgeted O(session) cost on the per-delta path. Remedy: veil intervals computed once at mount from the window, updated incrementally on veil.raised/lifted deltas — O(1) per delta; redaction filter inside the ≤5ms clock in a gate.**

**F-6 · MEDIUM · Segment budgets never measured separately; LRU bound unnamed; soak stops six hours short. Remedy: per-segment dev-mode clocks asserted in G-CB1-1a; named LRU entry cap; one nightly 10-hour soak (30-min script looped).**

**F-7 · MEDIUM · Bind-absence and read-only ink lines have no lawful home in the two-slot margin. Remedy: enumerate both in fence 4; law: bench-minted ink lines render in dedicated page furniture (or explicitly yield to composed slots), never displacing a Folio.margin slot.**

**F-8 · MEDIUM · A silently dead fold subscription is a state the failure table does not know. Remedy: add the row — subscription gap detected (fold sequence discontinuity or shell-side liveness check) ⇒ resubscribe + fold re-read; on failure, read-only-line treatment with a stale-page line in register.**

### Summary
**PATCH; dies on F-1/F-2.**

---

## REVIEWER 2 — THE CANON PROSECUTOR (verbatim)

**C-1 · HIGH · The 80ms delta-path decomposition sums to 84ms and double-counts delivery. Remedy: restate against G-CB1-1a's clock start — delivery outside the clock, assembly ≤1ms, render = 80−15−1 = 64 — or lower the remainder. (Keep totals ≤80 and coherent with the clock.)**

**C-2 · HIGH · The mount path spends the seat-paint budget twice (60 precompose + 5 + 60 render = 125ms in an 80ms gate). Remedy: active folio composed and painted first; neighbors precomposed post-`ready`; mount-path budget named explicitly.**

**C-3 · HIGH · The bench appends pencil.dismissed outside its own closed allowlist. Remedy: add pencil.dismissed to the BenchEventType allowlist; recount 12→13 in the register.**

**C-4 · MEDIUM · G-CB1-2 contradicts the one-fixture law (L-scale is a second fixture) and the session lifecycle state at each gate is unstated. Remedy: name the L-scale resume fixture as a second fixture; state session open/closed per gate.**

**C-5 · MEDIUM · Interim veil scan contradicts "assembly copies, it never computes." Remedy: same as F-5 (incremental veil-interval index) with the interim shape stated.**

**C-6 · MEDIUM · A11y hard-depends on unaccepted amendment CB1-AM-2 with no declined-behavior. Remedy: name behavior-when-declined for CB1-AM-1 AND CB1-AM-2 (e.g. auto-turn announcements suppressed, visible label only, logged as blocked requirement).**

**C-7 · MEDIUM · C-CB1-3's search field placed at the Table with no ADR. Remedy: mint ADR-CB1-E AND gate the field's visibility to desk-time (no live session) so the Table stays clean. (Both.)**

**C-8 · MEDIUM · §9.4 annexes constitutional status the proposal never offered. Remedy: the version note cites Marcus's seal ref alone as the amendments' authority.**

**C-9 · LOW · inscription.struck in the allowlist is a dead second door. Remedy: strike it from the allowlist (Strike goes through bench.ash.strike only); adjust the count (with C-3: 12 −1 +1 = 12... recount carefully and state the final number).**

**C-10 · LOW · ×50 unminted; G-CB1-4 misattributes to "SH3 rubric 15" instead of G-SH3-7. Remedy: mint and name 50; correct the citation.**

**C-11 · LOW · "THE BINDING AWAITS — FOUNDATION STEP 4" puts repo internals on the user's page; quarantine breached. Remedy: string becomes THE BINDING AWAITS (in copy.provisional.ts); step number to the route log. (Merged with T-2.)**

### Summary
**PATCH; gravest are the arithmetic convictions C-1/C-2 and C-3.**

---

## REVIEWER 3 — THE TASTE AUDITOR (verbatim)

**T-1 · CRITICAL · The "combat-end exhale" is an unlicensed ceremony (880ms against GENESIS 03-VI's strict list). Remedy: strike the exhale to Transition 520ms (do NOT file the ADR — the strict list holds; note the demotion in the register table with its naming sentence).**

**T-2 · HIGH · The absent Bind speaks in the builder's voice and nags per-session. Remedy: caption THE BINDING AWAITS alone (mono, --ink-muted); Unfold on the muted ring yields the one full explanation; margin line fires once per world, first seating only, and is legislated as page furniture exempt from maxMarginSlots (align with F-7's law).**

**T-3 · HIGH · bench-lint proves less than its sentence claims. Remedy: extend the lint (no box-shadow, no border-radius, spacing ∈ {8,16,32} only, no opacity literals outside 0.85–1.0 and the 15% page-cast) AND narrow the fence sentence to what the lint now actually proves.**

**T-4 · HIGH · The search field is unauthored. Remedy: new §3.7 — Plex Sans, its ink, its focus register (or named stillness), its empty-results line in copy.provisional.ts; visibility desk-time only per C-7.**

**T-5 · MEDIUM · HP crossfade takes Micro without a conviction. Remedy: keep 120ms Micro WITH the naming sentence ("a vital that arrives 280ms late reads as the instrument doubting the blow; the distress marks accumulate at State").**

**T-6 · MEDIUM · Copy jurisdiction mixed; "EXPORT FIRST." scolds. Remedy: clause — "every bench-visible string lives in copy.provisional.ts; strings quoted in this spec fix content, not final wording"; read-only line becomes: "This world is read-only while the record awaits repair. Reading, turning, and export remain yours."**

**T-7 · MEDIUM · The consent ask has no words; the helm glyph has no seat. Remedy: author the ask into copy.provisional.ts ("The book has offered this turn three times and you have taken it three times. Shall it turn itself?" — in ink, once, dismiss forever available); helm glyph named slot-exempt page furniture with one sentence of justification.**

**T-8 · LOW · Register misses ×50, 40px edge zone, 1Hz. Remedy: add all three with naming sentences (cite 40px to its SH3 source if it exists there; otherwise name it fresh).**

**T-9 · LOW · §3.5's closing aphorism performs. Remedy: delete the parenthetical.**

### Summary
**PATCH; dies on T-1.**

---

## DISPOSITIONS (author, applied in v0.2 — 28/28 accepted, 0 rejected)

| Finding | Disposition | Where applied |
|---|---|---|
| F-1 | ACCEPTED — the input-priority law written as mechanism (§8.4): pending recompose/commit yields to buffered input; active-folio recompose scheduled after the input queue drains, echo painted first; G-CB1-7's typing stream now deliberately collides with delta arrival; the 16ms register entry cites the law, not hope | §8.4, G-CB1-7, Named-Number Register |
| F-2 | ACCEPTED — the focus law named: recompose MUST NOT move focus, collapse a focused Unfold/Quill, or discard uncommitted input text; unfold/open state's home specified (bench-local `uiState.openElements`, keyed on sealed `Element.id`); mid-Quill stress-replay fixture added | §3.2, §8.4, rubric 15 |
| F-3 | ACCEPTED — auto directive during focused text entry with uncommitted content downgrades to offer, as law; rubric fixture added | §4.3, rubric 15 |
| F-4 | ACCEPTED — coalescing law: same-folio deltas within one frame collapse to one recompose against the latest GameState; at most one uncommitted render per folio; burst fixture (N≥5 same-tick ⇒ 1 paint per affected folio) | §8.2, rubric 16, Named-Number Register |
| F-5 / C-5 | ACCEPTED (merged) — veil-interval index built once at mount, updated O(1) on `veil.raised`/`veil.lifted` deltas; "assembly copies, never computes" preserved (the index update is the delta's own bookkeeping); redaction filter runs inside the assembly clock asserted per-segment in G-CB1-1a | §2.6, §0.5, G-CB1-1a, GAP-1 |
| F-6 | ACCEPTED — per-segment dev-mode clocks asserted in G-CB1-1a; LRU cap named (24 entries, naming sentence in the register); nightly 10-hour soak added (the 30-minute script looped ×20) | G-CB1-1a, §8.3, Named-Number Register |
| F-7 / T-2 (furniture half) | ACCEPTED (merged) — bench-minted ink lines (Bind-absence line, read-only line) enumerated in fence 4 and legislated as page furniture exempt from `maxMarginSlots`, never displacing a `Folio.margin` slot | §3.1 fence 4, §4.5, §6 |
| F-8 | ACCEPTED — failure-table row added: subscription gap (fold sequence discontinuity or shell liveness check) ⇒ resubscribe + fold re-read; on failure, read-only-line treatment plus a stale-page ink line in the margin register | §6 |
| C-1 | ACCEPTED — §8.1 restated against G-CB1-1a's clock start: delivery (≤4ms p99) outside the clock; assembly ≤1ms; render remainder = 80−15−1 = 64ms p50; every downstream citation of 5/60 corrected | §8.1, §2.5, Named-Number Register |
| C-2 | ACCEPTED — mount path re-ordered: active folio composed and painted first (1+15+64 = 80ms to `ready`, budget named); neighbors precomposed post-`ready` (≤45ms, off the gate) | §2.5, Named-Number Register |
| C-3 / C-9 | ACCEPTED (counted together) — `pencil.dismissed` added; `inscription.struck` struck (Strike flows through `bench.ash.strike` only); final count recounted and stated once: **12** (12 −1 +1), correct everywhere | §2.4, Named-Number Register |
| C-4 | ACCEPTED — the L-scale resume vault named as the second fixture (G-CB1-2 only); session lifecycle state stated per gate | §1 |
| C-6 | ACCEPTED — behavior-when-declined named for both amendments: AM-1 declined ⇒ data-silence kept as CB1-local law, wiring unchanged, logged as blocked requirement; AM-2 declined ⇒ auto-turn announcements suppressed, visible label alone carries the burden, logged as blocked WCAG requirement | §0.4, §7.3 |
| C-7 / T-4 | ACCEPTED (merged) — ADR-CB1-E minted (search field seated at the Codex bay, desk-time visibility only); new §3.7 authors the field: Plex Sans, `--ink-body` on page ground, named stillness on focus, empty-results line in `copy.provisional.ts` | §0.4, §3.7, §10.2, ADR-CB1-E |
| C-8 | ACCEPTED — §9.4 version note cites Marcus's seal ref alone as the amendments' authority; the constitutional-status annexation deleted | §9.4 |
| C-10 | ACCEPTED — ×50 minted with naming sentence; G-CB1-4 and the register now cite G-SH3-7 | G-CB1-4, rubric 4, Named-Number Register |
| C-11 / T-2 (voice half) | ACCEPTED (merged) — caption is THE BINDING AWAITS alone (mono, `--ink-muted`, in `copy.provisional.ts`); the step number moves to the route log; Unfold on the muted ring yields the one full explanation; the margin line fires once per world, first seating only, as slot-exempt page furniture per F-7's law | §4.5, §3.6 |
| T-1 | ACCEPTED — the exhale demoted to Transition 520ms; no ADR filed (the strict ceremony list holds); demotion noted in the register table with its naming sentence; "two ceremonies" language corrected throughout | §3.4, §3.3, §0.2, §10.4 |
| T-3 | ACCEPTED — bench-lint extended (no box-shadow, no border-radius, spacing ∈ {8,16,32} only, no opacity literals outside 0.85–1.0 and the 15% page-cast); fence 2's sentence narrowed to what the lint proves | §3.1 fence 2 |
| T-5 | ACCEPTED — 120ms Micro kept with the conviction written into the register table verbatim | §3.4, Named-Number Register |
| T-6 | ACCEPTED — the copy-jurisdiction clause added; the read-only line reworded as demanded (the scold deleted) | §3.6, §6 |
| T-7 | ACCEPTED — the consent ask authored verbatim into `copy.provisional.ts` (in ink, asked once, dismiss-forever available); helm glyph named slot-exempt page furniture with its one-sentence justification | §4.3 |
| T-8 | ACCEPTED — ×50 (with C-10), the 40px edge zone (no SH3 source exists; named fresh), and 1Hz (cited to SH3's named why-1Hz) all added to the register with naming sentences | Named-Number Register |
| T-9 | ACCEPTED — the parenthetical deleted | §3.5 |

**Verdict roll-up:** fatigue PATCH (dies on F-1/F-2) · prosecutor PATCH (gravest C-1/C-2/C-3) · taste PATCH (dies on T-1). All three die-on findings are cured by mechanism, not assertion: the input-priority law (§8.4) and focus law (§3.2/§8.4) replace the bare 16ms number; the budget arithmetic now sums to 80 against the named clock on both paths; the exhale is out of the ceremony register without an ADR. v0.2 stands for Marcus's seal ruling.
