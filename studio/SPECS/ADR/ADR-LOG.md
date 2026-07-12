# ADR LOG — Ash & Archive Studio specification campaign
*Append-only. Every decision not dictated by canon is recorded here with context, options, the decision, and what would change it. Canon (`canon/`, `STUDIO-GENESIS/`, GENESIS) outranks every ADR; where two sealed canon docs contradict, the resolving ADR is logged here and both docs are annotated.*

---

## ADR-002-A · Auto-turn consent threshold `N`
- **Spec:** SPEC-002 §8.3. **Status:** Accepted. **Canon-affecting:** No (shell/UX only).
- **Context:** GENESIS 04-I says the book asks for auto-turn consent "after the same offer type is accepted several consecutive times." "Several" is unquantified.
- **Options:** N=2 (eager) · N=3 (recommended) · N=5 (conservative) · adaptive.
- **Decision:** N=3 default, shell-owned, user-overridable. The composer is unaffected — it reads the `autoturn.granted` fact either way.
- **Reverses if:** Phase-1 playtest shows 3 feels too eager/too slow; changing it touches no spec, only a shell constant.

## ADR-002-B · `prevOrder` (muscle-memory hand stability) is held in-runtime, not event-sourced
- **Spec:** SPEC-002 §7.2, §4. **Status:** Accepted. **Canon-affecting:** No.
- **Context:** The Action folio preserves prior hand order when rank ties, needing the previous hand's order. SPEC-001 §I-7 event-sources *canon-relevant* UI state.
- **Options:** (a) event-source hand order · (b) hold in `ComposerRuntime` memory.
- **Decision:** (b). Hand order is a render nicety, not canon-relevant; event-sourcing it would pollute the log and the sync surface. Deterministic fallback (§7.2.4, ascending riteRef ULID) applies when absent (e.g. cold resume) — no correctness loss, only a one-time reflow.
- **Reverses if:** cross-device hand-order continuity ever becomes a product requirement (it is not; the Table is single-device).

## ADR-002-C · `compose()` carries a 7th argument, `profile`
- **Spec:** SPEC-002 §1.1, §3. **Status:** Accepted. **Canon-affecting:** Yes — amends the GENESIS 08-VI design contract (logged, not silent).
- **Context:** GENESIS 08-VI states `compose(stance, gameState, entryGraph, riteSet, budgets, uiState) → Folio` (six args). The pure function cannot compose a folio without knowing which folios exist and their contracts — i.e. the `ComposerProfile`.
- **Options:** (a) smuggle `profile` inside `budgets`/`uiState` → rejected, dishonest typing · (b) make the runtime hold profile and pass folio-contracts piecemeal → rejected, leaks profile logic into the runtime (violates §4 "logic-free runtime") · (c) add `profile: ComposerProfile` as the 7th arg and amend the GENESIS contract.
- **Decision:** (c). The GENESIS 08-VI signature is amended to seven args. This is a *design-contract* amendment, not a SPEC-001 change; GENESIS 08-VI prose to be annotated at its next revision.
- **Reverses if:** a profile registry keyed by `stance` proved cleaner — but that just hides the same dependency; not worth the indirection.

## ADR-002-D · SPEC-001 §15 gains paint-path latency budgets (EXECUTED)
- **Spec:** SPEC-002 §3.2, §11.4; SPEC-001 §15 v1.1. **Status:** Accepted & **executed** (SPEC-001 amended to v1.1). **Canon-affecting:** Yes — additive, non-breaking.
- **Context:** The composer's 80ms budget depends on `archive.query`/`links` and the four `RiteSet` functions, but SPEC-001 v1.0 §15 budgeted none of them (the verifier's C2 — SPEC-002 had *cited* budgets that did not exist). SEAM-R1×002 (interrupts ≤3ms) is the same gap for `interrupts()`.
- **Decision:** Amend SPEC-001 §15 (done, v1.1) to add: `query`/`links` p99 ≤3ms; `legality`/`derive` ≤1ms; `interrupts` ≤3ms (via SPEC-R1's compiled trigger index); `compositionHints` ≤2ms. Additive — no existing budget changes. SPEC-002's citations now reference real budgets.
- **Reverses if:** the stress fixture proves a budget unmeetable on reference hardware — then the composer's fitter tightens (fewer live elements) rather than the budget loosening; the ≤80ms envelope is the fixed constraint.

## ADR-AI1-006 · Where versioned Dramaturg prompt assets live (RESOLVES a canon contradiction)
- **Spec:** SPEC-AI1 (draft) §; raised by the AI crew. **Status:** Accepted (resolves contradiction). **Canon-affecting:** clarifies GENESIS 07-V; no SPEC-001 change.
- **The contradiction:** GENESIS 07-V says prompts-as-data "ship as versioned assets **in the Archive itself**, user-inspectable at the Desk (the Dramaturg's own charter is readable in the Charter Room)." SPEC-001 §2.2 froze the eleven Entry kinds for v1 and §14.4 forbids minting a kind at runtime. A prompt cannot be an Entry without violating SPEC-001.
- **Options:** (a) mint a `prompt` Entry kind → **rejected**, direct §14.4 violation · (b) governance-signed new kind → heavyweight, and v1 kinds are founder-frozen · (c) **prompts as versioned config assets in the Vault** (not Entries), surfaced *read-only* in the Charter Room and included in export.
- **Decision:** (c). "In the Archive" is honored as "in the world's Vault/bundle," not "as an Entry kind." Prompt assets are versioned files under a `prompts/` namespace in the Vault (parallel to `attachments/` in the export layout, SPEC-001 §9.1), each carrying `{voice, version, hash}`; the Charter Room renders them read-only ("the Dramaturg's charter, readable" — GENESIS 07-V satisfied); they travel in export (ownership covenant satisfied). No Entry kind is minted; SPEC-001 §2.2/§14.4 satisfied. **Both canon docs' intent is preserved.**
- **Annotation required:** SPEC-AI1 §(prompts) and, at seal, a one-line pointer note in the SPEC-001 §9 export layout (prompts/ namespace) — additive, non-breaking.
- **Reverses if:** a future major version un-freezes the kind registry and a `prompt` kind proves cleaner (revisit at v2).

---

## RESOLVED by Marcus (2026-07-12 rulings)

- **ADR-R1-005 · SRD license → YES, SRD 5.1.** Marcus confirmed. The Rite content boundary is the 5e SRD 5.1; SPEC-R1's licensing-tracking-per-entry targets it. *(Legal ratified; engineering proceeds.)*
- **SPEC-B1 vendor ADRs (000–008) → DEFERRED by Marcus.** "Don't decide vendors before a running Foundation — premature commitment." The backend stays provider-agnostic; the local product builds fully without any vendor chosen. These reopen when the Foundation runs. **Not blocking.**
- **SPEC-B1 G-11 · the covenant ruling → LOCAL BIND IS NEVER GATED.** Marcus: "read and export never lock; the person's created world is never held hostage." Ruling: **read, export, AND local Binding of one's own ash are covenant-protected rights** — a lapsed subscriber can still author canon in their own local world. Premium gates apply only to *networked* features (sync, hosted portals, cloud AI). SPEC-B1's licensing invariant LI-1 is extended accordingly (read + export + local Bind never lock). Aligns with SPEC-001 I-1/§6.

## EXECUTED (SPEC-001 v1.1 amendment, 2026-07-12)

- **ADR-R1-003 · `E-17xx` ceded** to registered Rite sets — SPEC-001 §11 amended (v1.1). ✅
- **SEAM-R1×002 · `interrupts()` ≤3ms budget ratified** — SPEC-001 §15 amended (v1.1), see ADR-002-D. ✅ SPEC-002 and SPEC-R1 now agree.
- **ADR-AI1-006 · `prompts/` export namespace** added to SPEC-001 §9.1 (v1.1). ✅

## STILL OPEN — resolved at batch verification of B1/R1/AI1

| ID | Spec | Question | Lean |
|---|---|---|---|
| ADR-R1-002 | SPEC-R1 | Conditionality: effect-atoms + a constrained Predicate Expression Language vs code-plugins | **atoms+PEL** (code-plugins break SPEC-001 §5.6 cross-runtime purity/I-8) |
| ADR-AI1-001/002 | SPEC-AI1 | Model tiers per voice | **Defer to Phase-3.5 spike** (benchmark on constitutional-audit pass, not model size) |
| ADR-B1-004 | SPEC-B1 | KMS + E2E crypto primitives + recovery model | resolve at batch-verify against the deferred-vendor ruling (design the *shape*, not the vendor) |

*Batch verification of the three drafts is dispatched; their verifier verdicts + these opens resolve next.*
