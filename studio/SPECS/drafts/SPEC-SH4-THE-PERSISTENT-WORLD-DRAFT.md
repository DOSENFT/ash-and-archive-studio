# SPEC-SH4 — THE PERSISTENT WORLD (draft v0.1, 2026-07-18)

*Authored under Marcus's redesign order of 2026-07-18 ("Do not improve the existing
implementation. Redesign the entire system."). Status: DRAFT — awaiting fresh-context
adversarial verify → patch → the canon holder's seal, per the sealed spec pipeline.
Nothing in this document generates an asset or spends a credit before the §9 spend gate
is approved in writing.*

---

## §0 — The standing, and the three failures it answers

The order names three architectural failures in the traversal experience, and rules them
architectural, not polish:

1. **No continuity** — architecture changes arbitrarily; doors have no destination;
   the camera travels through disconnected generations, not one environment.
2. **No physical fidelity** — materials read as rendered, not built; they die under
   close inspection.
3. **No life** — the world is static; it exists only because the camera moves.

This spec locates each failure in sealed law, and amends that law by instrument:

| Failure | Root in sealed canon | Amendment (this spec) |
|---|---|---|
| Discontinuity | ADR-SH2-E: stills-first shipping target — each of the 18 poses generated **independently**, continuity enforced only at clip boundaries (ΔE seam check), never across the world | **ADR-SH4-A — The One World Law** (§1): the *chain* is the primary artifact; poses become frames **extracted from** the chain, never generated beside it |
| Dead materials | SH2 §5.2 style anchor is mood-language ("worn honey-grey stone"), not material-forensics language; no close-inspection standard exists | **ADR-SH4-C — Material Forensics** (§2): every surface must survive extreme close inspection; inspection-still protocol; STYLE-BLOCK-V3 |
| Dead world | SH1 §1 silence law: "zero motion of any kind, idle or responsive, except during a Rite"; §5.1 reversible-arc physics: flames painted steady; atelier leg prompts: "ACTION: none… Nothing else moves" | **ADR-SH4-B — The Living World Law** (§3): the world moves for itself, indifferent to the camera; silence is retained **only** for the seated page surface, where the airlock always kept it |

**What does not change.** LANTERNLIGHT stands whole: the 1983 practical-effects clause,
the Kodak emulsion, the warm band, the fixed hour, eye height, no people, no text, one
aperture, wear-is-love. Every POSITIVE-LOCK stands (LOCK-001…015, V1…V4) — §7 records
the two clarifications that need the canon holder's hand. The failure was never the
register. The failure was that the register was applied to **shots** instead of to
**a place**.

**Scope.** This spec governs **the World System**: the persistent world, its generation,
and its traversal. First shipping surface: the **Grand Tour** — the scroll-navigated
showcase where every module of the Studio is a physical destination. The in-app shell's
Passage layer (SH1) inherits these assets lawfully later; the shell's calm laws
(familiarity decay, drift-cut asymptote, ⌘K sovereignty) are untouched — residents of
the software still get 240ms; visitors to the world get the world.

---

## §1 — ADR-SH4-A: The One World Law

> *The viewer should always know — subconsciously — that they occupy one real place.*

**1.1 The world precedes every generation.** No prompt is written from imagination.
Every prompt is composed FROM the World Bible (`studio/PIPELINE/WORLD-BIBLE-V1.md`):
one canonical geography with a floor plan, a compass, a light plot, and a per-district
bible. A generation is a *view into* the model, never a fresh invention. A prompt that
cannot cite its district's bible section is invalid by construction (extends the SH3
§11.3 context gate).

**1.2 The chain is the geometry.** The world is captured as **one continuous forward
take**, generated sequentially: every leg's start frame is the previous leg's actual
last frame, extracted from the *encoded* clip (LOCK-014, LOCK-V4 — unchanged). The
consequence is constitutional: **spatial continuity is enforced by generation order.**
There is no seam at which the world can change, because no leg ever starts from a
fresh render.

**1.3 The doorway rule.** The camera never cuts to a new space. It passes through an
aperture **already visible in the current frame**. Operationally: leg *N*'s prompt must
name the aperture, that aperture must appear in leg *N−1*'s final frame (eyeball-gated
before leg *N* is submitted), and leg *N* describes the transit through it. If a
staircase ascends, the next leg ascends it. A door that appears and is not traversed
must still lead somewhere the Bible records (§1.5).

**1.4 The light compass.** One fixed hour (SH1 §1.2, unchanged) plus one fixed
bearing: **all daylight in the world enters from the west**, as low ember dusk. Every
district bible states its window walls in compass terms; every prompt carries the
district's light line verbatim. A frame whose light contradicts the compass fails
intake regardless of beauty.

**1.5 The Geometry Ledger.** Append-only, inside the World Bible. Every accepted frame
that *reveals* new geometry (what stands beyond an arch, how many bays a colonnade has,
which way a stair turns) gets its fact recorded within the same working session, and
every later prompt touching that space must cite the recorded fact, not re-imagine it.
This is the continuity supervisor's book — the same discipline a $250M production's
script supervisor keeps. Contradicting the Ledger is a FAIL with a mandatory lock
(Doctrine Law 7).

**1.6 Chain granularity.** LOCK-V1 stands: no single generated clip traverses a full
route, changes facing >30°, or displaces more than ≈3–5 m. Long journeys are chains of
short legs joined on extracted frames. A district is typically 2–3 legs; the Tour is a
chain of chains. This is not a compromise — short legs are *why* the warp artifacts
died and *how* the eyeball gate stays cheap.

---

## §2 — ADR-SH4-C: Material Forensics

**2.1 The bar.** Every material must survive extreme close inspection. Wood shows
compressed fibers, tool marks, oil absorption, decades of scratches, reflectance that
shifts across worn corners. Stone shows fractured mineral structure, erosion, chipped
arrises, dust lying differently where feet pass. Brass shows oxidation gradients,
burnishing where hands repeat, physically accurate specular response. Leather
compresses, wrinkles, stretches, catches light differently across its wear. Nothing
flat, nothing generic, nothing procedural-looking. Every surface communicates age,
craftsmanship, and history. (The order's language, adopted verbatim as law.)

**2.2 STYLE-BLOCK-V3.** The stills register gains a material-forensics paragraph and an
environmental-density paragraph (`studio/PIPELINE/STYLE-BLOCK-V3.txt`). Per LOCK-V3,
style language lives in **stills and the post-grade only**; video prompts carry motion,
physics, and the texture-preservation preamble ("the world does not re-render; only the
viewpoint moves").

**2.3 The inspection-still protocol.** Before a district's legs are generated, its
**focal object and two signature materials** are each captured as a close inspection
still (macro framing, same register). These join the element registry as hash-referenced
prop canon and ride every leg of that district as references. This is how a tabletop's
grain stays the same tabletop across three legs — object identity (A-13) extended from
props to *surfaces*.

**2.4 Native resolution, honest sharpening.** LOCK-015 stands — encode what the tool
returns, never upscale. Fidelity is bought at generation (top image tier for anchors and
inspection stills, 2K) and protected at encode (crf 20, light unsharp), never faked.

**2.5 Environmental density.** Every district bible carries a detail inventory —
evidence of work interrupted moments ago: bookmarks in books, cooling wax, half-finished
maps, open drawers, shavings, filings, pinned notes. The prompt names 6–10 from the
inventory per frame (rotating, never all at once — clutter is not density). The
inhabited-never-occupied law (ADR-SH2-C) is unchanged: the maker just left; the maker
never appears.

---

## §3 — ADR-SH4-B: The Living World Law

**3.1 The inversion.** The traversal layer's silence law is repealed. In its place:
**nothing in the world is perfectly still.** Dust drifts in the light. Flames breathe.
Smoke curls. Chains settle. Herbs sway. Paper corners lift in drafts. Pendulums swing.
Clockwork turns. Water drips into basins. Embers glow and fade. Each district owns a
named **motion ecosystem** (World Bible, per-district) — its own weather of small
movements.

**3.2 The indifference principle.** The world's motion was happening before the camera
arrived and continues after it leaves. Nothing reacts to the viewer. Nothing performs.
The camera *discovers* activity; it never causes it. (This is the lawful heir of the
atelier's old "flames indifferent to the walker" clause — widened from flames to the
whole ecosystem.)

**3.3 Where silence survives.** The airlock (SH1 §1) already divides world layer from
page layer. Seated at a folio, doing the work, the page is still — the bench silence
law is untouched for the software's working surfaces. The *world behind and around* the
work breathes. Marcus's calm bar ("calmer and faster, never spectacle") governs the
instrument; the Living World governs the place the instrument lives in.

**3.4 Motion and the seam.** Under architecture-A chaining, ambient motion cannot pop
at a seam — the next leg continues from the exact frame, whatever mid-motion state it
holds. Two disciplines keep it honest: (a) the last second of every leg settles to a
steady forward drift (the motion-handoff contract) while ambient motion continues; (b)
high-amplitude motions (a swinging chain, a pendulum) are kept mid-frame, not at frame
edge, in the handoff second. Scroll runs both directions; ambient motion in reverse is
accepted convention (the Apple pages share it) and is not a defect.

**3.5 Reversible arcs are dead.** SH1 §5.1's "no visible flame motion in any reversible
arc" is obsolete inside the Tour: the Tour has no reversible clips, only the one chain
scrubbed forward and back. (The shell's arc library, if ever built, keeps its own law.)

---

## §4 — The Camera Law

**4.1 The instrument.** A stabilized Technocrane, not a walking head, not a drone. No
jitter, no bob, no game-camera float. Acceleration physically plausible; every stop has
weight; every turn anticipates what the viewer should notice next. The audience never
becomes aware of the camera.

**4.2 Eye-height clarification (needs the canon holder's hand — §7).** LOCK-001/002
("never above/below eye height") is clarified, not waived: eye height is measured from
**the tread beneath the walker**. Ascending the Atelier stair, the camera rises with the
stair, holding 1.55–1.70 m above the local floor. Descending to the Vault, likewise.
The camera still never swoops, never orbits, never looks down its nose at the world.

**4.3 Grammar per district.** Each district bible names its mid-leg move from the
scene's own logic (slow half-orbit of a focal object ≤30° facing change; lateral track
along a work line; push-in to a craft moment that eases back). The final ~1 s of every
leg settles into the steady forward drift; the next leg begins by continuing it. A leg
whose last frame does not read as a frame of a gentle forward glide is re-rolled
**before** the next leg is generated — the eyeball gate is per-leg and blocking.

**4.4 Pacing lives in the scrub, not only the clip.** Per-district `scroll` and
`linger` in the engine config: the camera settles mid-district exactly while the copy
peaks, then quickens toward the aperture. Hero districts (Codex finale, World Builder)
get long dwell; transit gets brisk.

---

## §5 — The Navigation Law (scroll as spatial interface)

**5.1 Scroll is how the user walks.** Not a scroll animation — a traversal. The Tour
is the product's map: every module is a **district**, physically distinct, connected
through one architectural language. The scroll teaches the product by moving through
it.

**5.2 The district roster** (the order's ten, verbatim, plus two structural beats):

| # | Beat | District (place) | Module canon mapping |
|---|---|---|---|
| 0 | Approach | The moor, the west face, the Gatehouse | (Approach still lineage) |
| 1 | Orientation | **The Great Hall** | Sanctum / shell home |
| 2 | **World Builder** | The Foundry (west wing, ground) | World Forge (SPEC-003) |
| 3 | **Map Atelier** | The Cartographer's Loft (above the Foundry) | Folio Composer surfaces |
| 4 | **Creature Archive** | The Bestiary Gallery (north-west gallery) | Codex bestiary |
| 5 | **Narrative Timeline** | The Long Gallery (the spine corridor itself) | Chronicle |
| 6 | **Relic Vault** | The Undercroft (beneath the Long Gallery) | Ledger / Archive |
| 7 | **Sound Hall** | The Resonance Chapel (north) | Stage sound |
| 8 | **Encounter Forge** | The Drill Hall (east) | Stage / combat |
| 9 | **Campaign Engine** | The Chart Room (east wing) | Campaign Studio |
| 10 | **Character Sanctum** | The Vestry Rotunda (south-east) | Codex characters |
| 11 | **The Codex** | The Scriptorium (finale + CTA) | The Codex product |

Naming note for the canon holder: the order's district names are adopted as the Tour's
public names; the module-canon names remain the specs' internal names. If any pairing
reads wrong, rule on it at seal — the geography survives any renaming.

**5.3 The engine.** The proven scrub engine stands (blob-seek, seam crossfade,
extracted-frame posters, reduced-motion stills fallback, phone hardening). Additions are
config, not code: per-district `scroll`/`linger`, the route rail rendered as the floor
plan (the map fills in as you walk it), and the `data-sw-seo` mirror carrying every
district's copy as real markup. Reduced-motion visitors receive the anchor stills with
crossfades — the world at rest, never a frozen video.

**5.4 The world extends beyond the frame.** Every composition obeys it: apertures at
the working third opening onto *recorded* geography (§1.5), never onto glow or void;
sightlines through doorways show the true neighbor district; nothing terminates into
empty space. The user should believe the camera could stop, turn around, and keep
exploring — because the Ledger says what it would find.

---

## §6 — Generation Architecture v2

**6.1 The sequence (per approved tier, §9):**

1. **World Bible ratified** — floor plan, compass, light plot, district bibles (already
   drafted; the canon holder's read is the gate).
2. **Anchor still** — one interior master (the Great Hall), conditioned on the approved
   lanternlight renders already in `ASSETS/` (the 13-scene sprint is not wasted; it is
   the register's reference stock). Iterated to the canon holder's approval. Hard gate.
3. **Inspection stills** — per-district focal object + signature materials (§2.3),
   entered into ELEMENTS.json with hashes.
4. **Previz chain** — the whole Tour on the cheap frame-locking tier
   (`seedance_2_0_mini`), sequential, eyeball-gated per leg, assembled into the real
   page, reviewed by Marcus **before any full-tier credit**. Journey order, doorway
   logic, camera grammar, copy pacing — all validated at draft cost.
5. **Final chain** — same legs re-rendered on the full tier (`seedance_2_0`, fallback
   `kling3_0` per LOCK-013's single-clip NSFW exception), sequential, per-leg eyeball
   gate, SSIM seam gate ≥0.95 at every joint (a joint below 0.95 means a wrong endpoint
   frame — redo, not QA note).
6. **Encode + posters** — native res, crf 20, `-g 8`, faststart; posters extracted from
   encoded clips; lanternlight post-grade applied before encode (LOCK-V3).
7. **Intake** — every leg and still through the A-checks plus the new C-checks (§8);
   curation remains the canon holder's hand alone (G-SH3-8 unchanged).
8. **Assembly + QA** — engine config, SEO mirror, browser seam QA, reduced-motion,
   phone tier per the chosen mobile option.

**6.2 Sequentiality is the price of continuity.** The chain cannot parallelize — leg
*N* needs leg *N−1*'s encoded frame. At 3–8 min per generation plus the eyeball gate,
a 30-leg chain is a multi-day pipeline. The previz pass exists so that time is spent
twice only on legs that already earned it.

**6.3 Re-roll doctrine.** Budget ~30% on interiors (NSFW false-positives; expressive-
move handoff misses). The ladder per stuck leg: re-roll → strip trigger words →
`kling3_0` with same endpoints (recorded per LOCK-013) → flag to the canon holder.
Every FAIL mints its lock (Doctrine Law 7, unchanged).

---

## §7 — Relationship to sealed canon (the honest list)

**Stands untouched:** LANTERNLIGHT whole (SH2 §0–§1.3) · fixed hour · warm band ·
no people, no text, wear-is-love · intake discipline, A-1…A-14, curation by the canon
holder's hand only · provenance law · LOCK-003…015, LOCK-V2…V4 · the shell's calm laws
(SH1 §2.4–2.8) · KEEP-COMMAND-THIN is unaffected (this all lives in the studio repo).

**Amended by this spec (each needs the seal):**
- **ADR-SH2-E** (stills-first): superseded *for the Tour surface* by ADR-SH4-A. Stills
  remain the reduced-motion artwork and the shell's lawful floor.
- **SH1 §1 silence law**: scope narrowed to the page surface (ADR-SH4-B); the traversal
  layer breathes.
- **SH1 §5.1 reversible-arc physics**: not applicable to the Tour (no reversible clips).
- **LOCK-001/002**: clarified to local-floor eye height (§4.2) — needs the canon
  holder's written hand per the POSITIVE-LOCKS waiver process.
- **The 18-pose shotlist (SH1 §2.2)**: for the Tour, poses are *extracted* chain frames,
  not generated stills. The shell's pose library, when built, extracts from the same
  chain — one world, two surfaces.

**Explicitly rejected as out of register (unchanged):** Unreal/game-engine *look*,
orbit and isometric views, volumetric shafts, HDR gloss. "AAA game environment" is
adopted as a **discipline standard** (persistent geometry, material LOD, ambient
simulation), never as a look.

---

## §8 — New acceptance checks (join A-1…A-14 at intake)

| # | Check | Method |
|---|---|---|
| C-1 | **Aperture continuity** | Every aperture traversed in leg *N* is visible in leg *N−1*'s final frame; every visible aperture's destination exists in the Geometry Ledger |
| C-2 | **Light compass** | West-light law holds in every frame; window walls match the district bible's compass line |
| C-3 | **Ledger conformance** | No frame contradicts a recorded geometry fact; new reveals recorded same-session |
| C-4 | **Living presence** | ≥3 ecosystem motions from the district's bible visible per leg; zero "frozen frame" seconds; motion indifferent to camera |
| C-5 | **Camera weight** | No jitter/bob/float; plausible acceleration; final second reads as steady forward drift; stops have weight |
| C-6 | **Forensic close-read** | A cropped 200% inspection of two surfaces per leg survives (grain, wear, oxidation legible, no mush) |
| C-7 | **Seam SSIM** | ≥0.95 at every chain joint (machine gate, runs before browser QA) |

---

## §9 — Budget tiers and the spend gate

*Numbers are generation counts, not dollars; video dominates. Sequential chain: expect
3–8 min/gen + gate time. Nothing generates before Marcus approves a tier in writing.*

| Tier | Scope | Legs (est.) | Video gens (previz + final + ~30% re-roll) | Image gens |
|---|---|---|---|---|
| **1 — The West Wing** *(recommended first)* | Approach → Great Hall → World Builder → Map Atelier (the staircase proof) → jump-cut epilogue to the Scriptorium CTA | ~9 | ~9 + 9 + 6 ≈ **24** | ~10 (anchor, inspection stills) |
| **2 — The Ground Floor** | Tier 1 + Bestiary → Long Gallery → Vault → Scriptorium as true finale | ~16 | ~16 + 16 + 10 ≈ **42** | ~16 |
| **3 — The Whole Archive** | All 12 beats, the complete Tour | ~28–30 | ~30 + 30 + 18 ≈ **78** | ~24 |

**Why Tier 1 first:** the doctrine is unproven. Tier 1 proves every hard thing —
doorway rule, staircase continuity (the single most falsifiable claim in the order),
living ecosystems, forensic fidelity, the previz→final translation — on one wing,
before the whole building is bought. If Tier 1's wing does not feel like one real
place, the remaining spend is saved and the locks minted tell us why.

**Gate text:** approval names the tier, the video model, and the mobile tier
(crop-safe / mobile encodes / hero reframe / portrait chain), and is recorded as the
approval hash the atelier already requires (no spend path without it — G-SH3-8
lineage).

---

*Companion instruments: `studio/PIPELINE/WORLD-BIBLE-V1.md` (the geography this spec
makes law) · `studio/PIPELINE/STYLE-BLOCK-V3.txt` (stills register) ·
`studio/PIPELINE/PROMPTS-V2.md` (leg + still templates). Draft ends.*
