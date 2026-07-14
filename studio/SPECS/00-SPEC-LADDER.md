# THE SPECIFICATION LADDER
### Campaign tracker · Ash & Archive Studio · engineering-spec build-out
*Opened 2026-07-11 · the index of every subsystem spec, its status, its Builder Friction Index, and its verification state.*

> **The pipeline.** Fable 5 authors sealed, zero-invention engineering specs; a Builder agent implements mechanically. Every spec either derives from canon (`canon/`, `studio/STUDIO-GENESIS/`, `products/the-codex/GENESIS/`) or raises an **ADR** (`ADR/ADR-LOG.md`) — never a silent decision. Every spec passes a **fresh-context adversarial verifier** (hunting contradictions, missing states, implementation ambiguity, hidden invention) before it is sealed as canon. Each spec closes with a **Builder Friction Index (0–100)** and a gap register.

## The ladder

| Spec | Subsystem | Owner | Status | BFI | Verified |
|---|---|---|---|---|---|
| **SPEC-001** | Foundation (`@ash-archive/core`) | prior campaign | ✅ **Sealed canon — v1.2** (v1.1 budgets/E-17xx/prompts; v1.2 readiness-visibility, ReadinessReport shape, E-1003 timing, E-1104) | ~97 | ✅ (repo audit + 2 amendment cycles) |
| **SPEC-002** | Folio composer (`@ash-archive/composer`) | Fable 5 | ✅ **Sealed canon — v1.1** (+§6.3 ADR-003-C annotation) | 95 | ✅ PATCH→resolved (17/17) |
| **SPEC-003** | World Forge (P0) | Fable 5 | ✅ **Sealed canon — v1.1** | 90 | ✅ PATCH→resolved (63→90; drove SPEC-001 v1.2) |
| **SPEC-004** | Codex-Ledger + Academy (P1) | *next* | ⬜ Queued — final module rung | — | — |
| **SPEC-005** | Campaign Studio (P1) | *pending* | ⬜ Queued | — | — |
| **SPEC-006** | Charter Room + Stage surfaces (P1; owns the Charter Room per SPEC-003 §3) | *pending* | ⬜ Queued | — | — |
| **SPEC-B1** | Production backend | crew | ✅ **Sealed canon — v1.1** (`SPEC-B1-BACKEND.md`; covenant ruling propagated; covenant-floor state defined) | 80 | ✅ PATCH→resolved |
| **SPEC-R1** | 5e Rite-set content schema & pipeline | crew | ✅ **Sealed canon — v1.1** (`SPEC-R1-RITE-CONTENT.md`; v1.1 budgets adopted; 3 sub-schemas sealed) | 72 | ✅ PATCH→resolved |
| **SPEC-AI1** | Dramaturg running config | crew | ✅ **Sealed canon — v1.1** (`SPEC-AI1-DRAMATURG-CONFIG.md`; Vault-file prompts; +T-LEVER-1/T-NAMING-1) | ~85* | ✅ PATCH→resolved |

*\*AI1's crew reported friction-remaining 15 (inverted convention); normalized: ~85 on this ladder's 100=frictionless scale. Its remaining friction is solely the legitimate Phase-3.5 model-tier deferral + the backend proxy seam. R1's 72 is capped by golden-pass enum-membership deferral (the correct forcing function); B1's 80 by vendor ADRs Marcus ratified as deferred.*

**Critical path (sequenced):** SPEC-002 (composer) → SPEC-003 (World Forge). The composer gates the Codex — the first shippable room — so it seals first. The independent domains (B1, R1, AI1) run in parallel and do not gate the critical path.

**Out of scope for this campaign** (explicit, per the commission): the **design-production layer** (the `@ash-archive/ledger-ui` component library's exhaustive render specs, actual screens, motion production). That is a separate final campaign *after* behavior is sealed. Element *shapes* are sealed in SPEC-002 §2/§16; their *rendering* is deferred there (gap G-1).

## Verification protocol

1. A spec draft (crew output → `drafts/`, or Fable-authored → canonical path marked *verifying*) is not **sealed canon** until a fresh-context adversarial verifier subagent — one that has NOT seen the drafting — reads it against its named canon dependencies and returns a verdict + defect list.
2. Verifier verdicts: **SEAL** (no material defects) · **PATCH** (defects listed; author fixes; re-verify the patch only) · **REWORK** (structural failure; back to authoring).
3. Contradictions between two sealed canon docs are resolved by **ADR**, logged, then both docs annotated. (The AI crew found the first such case — see ADR-AI1-006 below, resolved.)
4. **Cadence:** verify SPEC-002 immediately (critical path); batch-verify B1/R1/AI1 once all three drafts are in. Re-run the ladder audit after each seal.

## Escalations for Marcus — ✅ RESOLVED (2026-07-12)
1. ✅ **SRD licensing** → **YES, SRD 5.1** (Marcus). Content boundary set.
2. ✅ **Vendors** → **DEFERRED** (Marcus: "premature before a running Foundation"). Backend stays provider-agnostic; local product builds without vendors chosen.
3. ✅ **Covenant ruling** → **local Bind is NEVER gated** (Marcus: "the person's created world is never held hostage"). Read + export + local Binding of one's own ash are covenant-protected; premium gates apply only to networked features. SPEC-B1 LI-1 extended.

## Cadence log
- **2026-07-11:** Campaign opened. SPEC-002 authored (BFI 93) — critical path. Crews B1/R1/AI1 dispatched in parallel. All three returned same day: B1 BFI 62, R1 BFI 34, AI1 BFI 22 (low BFIs are honest deferrals — model selection → Phase-3.5, SRD content → golden pass, vendors → ADR). ADRs 002-A/002-B logged; ADR-AI1-006 resolved (prompts as out-of-Archive Vault assets). Cross-spec seams identified: SEAM-R1×002 (interrupts budget) + ADR-R1-003 (E-17xx) → one additive SPEC-001 §11/§15 amendment at seal. SPEC-002 adversarial verifier dispatched.
- **2026-07-12:** SPEC-002 verifier: PATCH (93→80, 2C/5H/5M/5L) → all 17 patched, **sealed v1.1, BFI 95**. SPEC-001 → v1.1 (paint-path budgets, E-17xx, prompts/). Marcus rulings landed (SRD 5.1 ✅ · vendors deferred · covenant: local Bind never gated). Batch verifiers dispatched. SPEC-003 authored (self 88).
- **2026-07-14:** Batch verdicts: **all PATCH, zero REWORK** — B1 (covenant violation caught), R1 (stale budgets), AI1 (rejected-option prompts). Patch crews sealed all three: **B1 80 · R1 72 · AI1 ~85**. SPEC-003 verifier: PATCH (88→63; C1 ownership split, C3 Lever timing) → patched + **sealed v1.1, BFI 90**; drove **SPEC-001 v1.2** (ADR-003-E) + SPEC-002 §6.3 annotation (ADR-003-C). ADR-003-A–E logged. **Seven specs sealed; zero unverified debt in `drafts/` (verdict file retained as record).**
- **Next:** SPEC-004 (Codex-Ledger + Academy) → SPEC-005 (Campaign Studio) → SPEC-006 (Charter Room + Stage) — the final module rungs, same author→verify→patch→seal cycle, one at a time per Marcus's no-debt rule.
