# PROMPTS v2 — the persistent-world templates (SPEC-SH4 companion)
*Per LOCK-V3: all style language lives in STILLS prompts (STYLE-BLOCK-V3) and the
post-grade. VIDEO prompts carry motion, physics, camera, and the texture-preservation
preamble only. Every slot in square brackets is filled FROM the World Bible — a slot
filled from imagination is a defect (SH4 §1.1).*

---

## 1 — Anchor / district still (image tier, 2K)

```
[DISTRICT ARCHITECTURE — the bible's architecture + apertures lines, verbatim,
including what stands visible through each aperture per the Geometry Ledger]
[LIGHT — the district's light line: key work-light + west-dusk second voice]
[DETAILS — 6–10 items from the district's inventory, rotated per frame]
[JUST-LEFT GESTURE — one, from the bible]
Camera at eye height ([1.55–1.70m per pose class]) above the local floor, level
horizon, deep focus, one aperture at the working third, light source off-center.

{STYLE-BLOCK-V3}
```

References attached: the chain's previous accepted frame(s) of this space + PROP-ONE
+ the district's inspection stills. Never a fresh imagination of a space the Ledger
already knows.

## 2 — Inspection still (image tier, 2K, macro)

```
Extreme close study of [FOCAL OBJECT / SIGNATURE MATERIAL — bible line], filling the
frame, shallow plane of sharp focus on [the wear signature: strike-marks / oxidation
gradient / grain / burnish], the surrounding workshop soft behind.
{STYLE-BLOCK-V3}
```

Accepted inspection stills enter ELEMENTS.json with hashes and ride every leg of
their district as references (SH4 §2.3).

## 3 — Chain leg (video tier; ≈3–5 m, ≤30° facing change — LOCK-V1)

```
SCENE CONTEXT: One continuous shot inside one real, persistent building. The world
does not re-render; only the viewpoint moves. [LEG INTENT — e.g. "Crossing the
Foundry along the work line toward the oak stair", from the bible's camera line.]

ACTIVE REFERENCES: <<<start-frame>>> — 100% match, the first frame verbatim, this
exact room continuing. [<<<inspection-stills>>> — these exact surfaces and objects.]
<<<prop-one>>> — every lantern in frame is this design exactly.

GEOMETRY: [The apertures visible in this leg and what stands beyond each, per the
Geometry Ledger — e.g. "the oak stair rises along the north wall, turning east at a
half-landing (G-003); through the east door behind, the Great Hall's candle-ring".]
Nothing terminates into empty space; every opening leads where the map says.

CAMERA: A stabilized cinema crane at walking eye height above the local floor —
[MID-LEG MOVE from the bible: lateral track / slow half-orbit ≤30° / push-in-and-
ease / stair ascent rising with the treads]. Acceleration physically plausible, every
stop has weight, no jitter, no bob, no handheld shake, no drone float. The final
second settles into a slow, steady, level forward drift toward [NEXT APERTURE], and
holds it.

LIVING WORLD: The room was alive before the camera arrived and stays alive after.
[3–5 MOTIONS from the district's motion ecosystem, verbatim — e.g. "the forge fire
breathing orange, steam curling off the quench trough, iron filings skittering in
the bench draft, a chain hoist swaying minutely".] All motion indifferent to the
camera; nothing reacts, nothing performs, no motion event begins or ends because the
viewpoint passes.

PHYSICS: flame sways from air alone, never gutters; light falloff obeys the inverse
square; pools of amber alternate with deep warm shadow, lifted soft blacks, never
pure black; the fixed low west shadow angle holds for the whole move; stone and
timber structurally immobile.

POSITIVE LOCKS: one continuous shot, no cuts. No people, figures, hands, faces, or
shadows of people, ever. No text. No doors change state, no light changes state, no
weather begins. The camera stays at eye height above the local floor throughout and
ends at rest in the settled drift — no flourish, no push past the mark, no fade.
[+ the standing POSITIVE-LOCKS lines, appended by the atelier as today]
```

## 4 — The per-leg loop (sequential; the chain cannot parallelize)

1. Extract the previous leg's final frame **from the encoded clip** (LOCK-014/V4):
   `ffmpeg -sseof -0.15 -i legN-1_GRADED.mp4 -frames:v 1 -q:v 2 legN-1_last.png`
2. **Eyeball gate (blocking):** the frame must read as a frame of a gentle forward
   drift, and the next leg's aperture must be visible in it (C-1). Fail → re-roll
   leg N−1 before any spend on leg N.
3. Compose leg N from this template + the bible; submit with
   `--start-image legN-1_last.png`; no `--end-image` on chain legs (forward take).
4. On acceptance: append any new geometry reveals to the Ledger (C-3), run the
   inspection close-read (C-6), grade, encode, SSIM the joint (C-7 ≥0.95).
5. Stuck-leg ladder (LOCK-013 exception path): re-roll → strip trigger words →
   `kling3_0` same endpoints, recorded → halt to the canon holder.

## 5 — Encode (unchanged from the extraction, restated)

`ffmpeg -i src.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" -c:v libx264 -preset slow
-crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart out.mp4`
— native resolution only (LOCK-015). Posters extracted from encoded clips, never
stills. Mobile tier per the sealed choice at the spend gate.
