# 03 — ARCHITECTURE, UX & ROADMAP
### The desktop-first technical blueprint, the Studio shell, and the build order

---

## PART ONE — TECHNICAL ARCHITECTURE

The Studio extends — never replaces — the Codex's proven architecture (GENESIS 08). One TypeScript core, three shells:

```
┌────────────────────────────────────────────────────────────────┐
│ SHELLS                                                          │
│  Desktop (Tauri) — the full Studio, the professional workstation│
│  Mobile (Capacitor) — The Codex + capture + reading             │
│  Web (published portals only) — the Press's output, never canon │
├────────────────────────────────────────────────────────────────┤
│ MODULE SHELLS (Wings)   Codex · Forge · Campaign · Stage ·      │
│                         Chronicle · Academy · Press · Charter   │
├────────────────────────────────────────────────────────────────┤
│ THE DRAMATURG           staging · five voices · routing         │
├────────────────────────────────────────────────────────────────┤
│ RITE SETS               5e/2024 first · pure rules modules      │
├────────────────────────────────────────────────────────────────┤
│ THE ASH                 append-only events · snapshots · folds  │
├────────────────────────────────────────────────────────────────┤
│ THE ARCHIVE             Entry graph · versions · canon · links  │
├────────────────────────────────────────────────────────────────┤
│ THE VAULT               native SQLite (desktop) / SQLite-WASM   │
│                         (mobile) · file-legible export/import   │
└────────────────────────────────────────────────────────────────┘
```

**Platform decisions:**
- **Desktop = Tauri** (Rust shell, native SQLite, real file system, OS-grade performance). This is what "desktop-first professional application" means concretely: sub-100ms search over 100k+ Entries, native windowing, multi-pane layouts, no browser chrome, no web-app ceiling. The competitive investigation identified desktop-grade performance as an unclaimed market position — every major competitor is a web app that crawls at scale.
- **Mobile = Capacitor** carrying the Codex (per Codex GENESIS 08, unchanged) plus the Quill (capture anywhere) and the Chronicle (read anywhere).
- **The web exists only as output.** The landing page markets; the Press publishes portals. Canon never lives on a server.

**Local-first with optional sync.** The Vault is the source of truth on the user's machine (the ownership covenant is absolute). A sync service (encrypted, event-log-based — the data has been sync-shaped since Phase 0) connects a user's desktop and mobile in v1.0 as *single-user, multi-device* sync — the honest, tractable version. Multi-*user* sync (Rooms, team authoring) is v2.0, gated on the conflict-resolution design the Codex council demanded (Contradiction Bench arbitration).

**Auth & accounts:** none required to use the Studio locally (the instrument works offline forever). An account exists for: sync, the Press's hosted portals, and licensing. This is both a trust posture and an architecture simplification.

**Backend (minimal by design):** a thin service layer — auth/licensing, encrypted sync relay, portal hosting/CDN, metered AI proxy. No world logic server-side, ever. Deployment: standard managed infra; the cost profile stays lean because canon computation is client-side.

**Desktop/mobile split (the ruling):**

| Belongs on desktop | Belongs on mobile | Syncs |
|---|---|---|
| World Forge, Campaign Studio, Charter Room, the Press, Academy curriculum, multi-pane research | The Table (play is mobile/tablet), the Quill, Warmups, the Binding (couch-friendly), Chronicle reading, drills | Everything — one Archive, one Ash, per user |

## PART TWO — THE STUDIO SHELL (UX)

The recovered **Director's Sanctum** was the right instinct and is hereby matured into the Studio shell — rebuilt on the Ledger System (the dashboard's glassmorphism is retired per canon law; its *patterns* are kept):

- **The Sanctum** (home): the director's booth. Session proximity drives composition (the recovered distant → approaching → imminent → today behavior — kept, it was excellent): far from game night the Sanctum leans Forge and Campaign; the day of, it leans prep and the Table's doorway. Panels: Session Nexus, Campaign Hub, World Pulse (the ash rendered), the Academy ribbon, Toy Dock.
- **Rooms, not tabs:** each module opens as a room with its own Desk/Table/Ledger stances where applicable. Navigation is the shelf + the palette; the six-verb grammar holds everywhere.
- **The command palette (⌘K)** — recovered pattern, promoted to law: every Entry, room, and action reachable by name in two keystrokes. Desktop is keyboard-first.
- **Multi-pane desktop layouts:** the true spread generalized — Forge folio beside Relationship Web beside Charter docket; panes are folios, the gutter is real, layouts save per room.
- **The Ledger System governs all of it** (Codex GENESIS 03 verbatim: obsidian/ink/gold, Crimson Pro, four motion registers, rubrication, provenance ink, the Named-Choice Doctrine). The Studio must read as the same artifact as the Codex — one book, many rooms.

## PART THREE — THE ROADMAP

Gate discipline inherited from the Codex: phases end at measurable gates, each independently shippable — the standing defense against the half-built-project failure mode.

**MVP — "the Codex + the Forge floor" (proves the Studio thesis)**
= Codex GENESIS Phases 0–3 (Foundation → Table → Ledger → Desk) *executed inside the Tauri Studio shell from day one* (the Sanctum, the palette, the shelf), plus the World Forge's core (substrate folios, Toybox at world scale, Charter Room v1, the Readiness Gate).
*Gate:* one real GM builds a world to PASS, preps from it, plays from it, binds it — the loop closed once, by a stranger, without the founder in the room.

**v1.0 — "the professional loop"**
+ Campaign Studio · the Dramaturg (all five voices, constitutional audit) · the Academy (prescription engine) · single-user multi-device sync · Relationship Web · Ember/Forge/Archive tiers live.
*Gate:* the Codex Phase-5 transfer study passes; ≥100 paying Forge-tier users retain 3 months; the founder runs his own campaign entirely inside it and would fight anyone who took it away.

**v2.0 — "the creator platform"**
+ the Press (portals, drip-feeds, print composition) · the Stage performance mode + revenue integrations · Atelier tier · multiplayer authoring with Contradiction-Bench conflict resolution.
*Gate:* ten creators earning real subscription/Patreon revenue *through* the Studio; the $200 tier justified by receipts, not positioning.

**Beyond:** Rite sets past 5e (system-agnostic promise cashed) · Collaborative Story Rooms · Voice Studio audio · the ecosystem map from the canon, in dependency order.

**Immediate next actions (unchanged from the Codex roadmap, now with Studio context):**
1. Phase 0.5 spikes — with **Tauri** as the desktop proving target alongside the Capacitor mobile PoC.
2. Phase 0 Foundation — built as `@ash-archive/core`, consumed by both shells.
3. The Sanctum shell rebuilt on Ledger System tokens (retiring the mock-data dashboard's visual debt while keeping its interaction patterns).

## Risks (Studio-level, beyond the Codex register)

| Risk | Mitigation |
|---|---|
| Scope theology at ecosystem scale — nine rooms is a decade | The dependency spine + gates; MVP is two rooms; every phase ships value alone |
| Desktop-first vs. web-era expectations | The wedge audience (pro GMs, authors) already lives in desktop tools (Scrivener, Foundry, Obsidian); the landing page + portals keep a web front door |
| $200 tier credibility before v2.0 receipts | Don't sell Atelier until the Press and Stage earn it; tiers launch bottom-up |
| One founder, many rooms | Each room's spec is complete enough to delegate (this document set is written for that); build order never opens two rooms at once |
