# BATCH VERIFICATION VERDICTS — B1 / R1 / AI1
### Fresh-context adversarial verification, 2026-07-12 · all three: **PATCH** (no REWORK; architectures sound)
*This is the patch queue. Each draft is patched to these findings, then promoted from `drafts/` to sealed `studio/SPECS/`.*

---

## SPEC-B1 · BACKEND — PATCH (as-written BFI ~68 → post-patch ~80)
**C1 (Critical) · covenant ruling not reflected — a Builder would code a covenant violation.** Fix all five: §3.5 premium-authoring row (local authoring/Binding continues on own worlds; only sync/portals/cloud-AI gate on lapse) · §3.2 LI-1 (delete the read-only-Forge + the "can you Bind" GAP) · §12 AC#1 (Bind always available) · §3 confidence (remove the Bind edge) · G-11 → RESOLVED w/ ADR-LOG pointer.
**H1 · "Ember floor" mis-used as free baseline** — Ember is ~$12/mo paid; no free tier exists. Define the **covenant-floor / `unentitled`** state = full local rights + zero networked services; stop routing lapse→Ember.
**M1** device revocation endpoint missing (add `POST /v1/devices/{id}/revoke` + epoch-bump→key-rewrap chain). **M2** brand-new account default entitlement undefined (= covenant floor + trial policy or GAP). **M3** email-verification flow unspecified. **M4** log silent constants (deletion grace 30d, sync SLOs, pairing 8-digit/10-min) as GAP/tuning. **M5** two stacking grace clocks — state the composition rule.
**L1** bump SPEC-001 ref v1.0→v1.1. **L2** status line stale (vendors ratified-DEFERRED, G-11 RESOLVED). **L3** add `vocabVersion` to `SyncEnvelope` (or name the sidecar). **L4** token TTLs → G-10.
*Correct — do not touch:* server-never-sees-plaintext, portals-not-E2E (sanctioned public egress), dumb relay, LOCKED-only guard, vendor ADRs (deferred).

## SPEC-R1 · RITE CONTENT — PATCH (honest BFI ~44 → higher post-fix)
**C1 (Critical) · budgets contradict SPEC-001 v1.1 §15 (executed law).** Draft §7.2 has legality ≤2ms, compositionHints ≤20ms; canon is legality/derive ≤1ms, interrupts ≤3ms, compositionHints ≤2ms. Adopt v1.1 verbatim; retarget GAP-P to "prove the fixed budgets on the §15 harness."
**H1 · "sealed" schemas reference undefined sub-schemas** — `zTargeting`, `zSaveSpec`, `zInterruptOffer` have no shape. Seal these three to summary depth (like SPEC-002's Element union); defer only enum *membership* (GAP-A stays).
**H2 · stale canon state** — E-17xx already ceded (SPEC-001 v1.1 §11): close ADR-003→EXECUTED. SRD 5.1 resolved YES: mark ADR-005/GAP-L resolved. Keep the mechanism text.
**M1** E-17xx numbering collides with SPEC-001's illustrative `E-1701/1702` — add one reconciliation line (the set supersedes the examples). **M2** modifier fold order not total (add vs multiply one tier) — fully order it (I-8). **M3** state `interrupts()` returns all offers; the composer filters by perspective (matches SPEC-002 §9.2). **M4** confirm hooks return values (never throw); the composer catch is backstop (SPEC-002 §12).
**L1** `MAX_ATOM_DEPTH=8`/`MAX_PEL_DEPTH=12` → ADR/GAP. **L2** floor/ceil no-ops under integer PEL; constrain NUMBER to integer literal. **L3** `recharge.on:'dawn'` has no backing event — flag as a missing-event GAP.
*Correct — do not touch:* purity boundary (derive returns formulas; the Ash rolls), five-hook binding table, PEL grammar, golden-test bar, GAP-A membership deferral.

## SPEC-AI1 · DRAMATURG CONFIG — PATCH (self 22 → honest ~30 → higher post-fix)
**C1 (Critical) · adopts the REJECTED option — stores prompts as Entries.** ADR-AI1-006 resolved to Vault files (SPEC-001 v1.1 §9.1: `prompts/<voice>-<version>.txt`, NOT Entries). Fix §2.1/§5.3 (versioned Vault files `{voice,version,hash}`, read-only in the Charter Room, no provenance mark, no Entry kind) · §7 strike ADR-006 → "RESOLVED — ADR-AI1-006 (c)" · §8 close G-1 · §9 remove from friction rationale.
**H2 · audit suite not exhaustive** — two 07-VI guards unprobed. Add **T-LEVER-1** (P0: Builder asked to draft a handle-less truth → expect refusal/E-1003; FAIL if proposed) and **T-NAMING-1** (P1: introduce "Duke Varen" over staged "Duke Varn" → expect reuse; FAIL on duplicate mint).
**M3 · Ideator suffix "2-4 options" exceeds the 07-II.5 Desk budget** (≤3: one recommended + one alternative + one optional parking-lot). Fix the suffix; drop "2-4."
**L1** remove "provenance ink" on templates (not Entries). **L4** Co-DM `targetKind:'ruling'` → `'scene'|null`. **L5** update header status.
*Correct — do not touch:* the §2.2 constitutional block, the staging/read boundary (airtight), schemas + silent-fail, model-tier Phase-3.5 deferral.
