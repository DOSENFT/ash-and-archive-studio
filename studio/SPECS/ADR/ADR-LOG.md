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

## ADR-AI1-006 · Where versioned Dramaturg prompt assets live (RESOLVES a canon contradiction)
- **Spec:** SPEC-AI1 (draft) §; raised by the AI crew. **Status:** Accepted (resolves contradiction). **Canon-affecting:** clarifies GENESIS 07-V; no SPEC-001 change.
- **The contradiction:** GENESIS 07-V says prompts-as-data "ship as versioned assets **in the Archive itself**, user-inspectable at the Desk (the Dramaturg's own charter is readable in the Charter Room)." SPEC-001 §2.2 froze the eleven Entry kinds for v1 and §14.4 forbids minting a kind at runtime. A prompt cannot be an Entry without violating SPEC-001.
- **Options:** (a) mint a `prompt` Entry kind → **rejected**, direct §14.4 violation · (b) governance-signed new kind → heavyweight, and v1 kinds are founder-frozen · (c) **prompts as versioned config assets in the Vault** (not Entries), surfaced *read-only* in the Charter Room and included in export.
- **Decision:** (c). "In the Archive" is honored as "in the world's Vault/bundle," not "as an Entry kind." Prompt assets are versioned files under a `prompts/` namespace in the Vault (parallel to `attachments/` in the export layout, SPEC-001 §9.1), each carrying `{voice, version, hash}`; the Charter Room renders them read-only ("the Dramaturg's charter, readable" — GENESIS 07-V satisfied); they travel in export (ownership covenant satisfied). No Entry kind is minted; SPEC-001 §2.2/§14.4 satisfied. **Both canon docs' intent is preserved.**
- **Annotation required:** SPEC-AI1 §(prompts) and, at seal, a one-line pointer note in the SPEC-001 §9 export layout (prompts/ namespace) — additive, non-breaking.
- **Reverses if:** a future major version un-freezes the kind registry and a `prompt` kind proves cleaner (revisit at v2).

---

## PENDING — raised by crews, to be resolved at batch verification (B1/R1/AI1)

| ID | Spec | Question | Lean |
|---|---|---|---|
| ADR-R1-002 | SPEC-R1 | Conditionality mechanism: effect-atoms + a constrained Predicate Expression Language, vs code-plugins | **atoms+PEL** (code-plugins rejected — breaks SPEC-001 §5.6 cross-runtime purity/I-8) |
| ADR-R1-003 | SPEC-R1 / SPEC-001 | Error-code range `E-17xx` for rite content — SPEC-001 §11 owns the code space | **Amend SPEC-001 §11** to cede E-17xx to registered rite-sets (additive, non-breaking) |
| SEAM-R1×002 | SPEC-R1 ↔ SPEC-002 | `interrupts()` has no budget in SPEC-001 §15; SPEC-002 §9.2/§11.4 calls it on the paint path; R1 apportions ≤3ms via a compiled `triggerIndex` | **Compatible — ratify the ≤3ms interrupts budget** into SPEC-001 §15 (additive); R1's triggerIndex is the mechanism SPEC-002 relies on |
| ADR-R1-005 | SPEC-R1 | SRD licensing (SRD 5.1 CC-BY-4.0) | **Marcus's legal call — not an engineering decision** (flag, do not decide) |
| ADR-AI1-001/002 | SPEC-AI1 | Model tiers per voice | **Defer to Phase-3.5 spike** (benchmark on constitutional-audit pass, not model size) |

*These are resolved (or escalated to Marcus, per ADR-R1-005) when the batch verifier passes over B1/R1/AI1. SEAM-R1×002 and ADR-R1-003 imply a small, additive, governed amendment to SPEC-001 §11/§15 — logged now, executed at seal so SPEC-001's own version bumps once, cleanly.*
