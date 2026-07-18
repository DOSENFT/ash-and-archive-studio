# THE WORLD BIBLE — one physical world, guaranteed by pipeline
*v1 · 2026-07-17 · The film system's constitution: director, cinematographer, production designer, and editor in one document. Scroll-world doctrine absorbed whole; Ash & Archive's sealed canon (SH2 Lanternlight) supplies the art; THIS file supplies the physics that makes every clip provably the same place.*

## The two root-caused failures this bible exists to prevent (postmortems, permanent)
1. **THE PINK (2026-07-17):** halation bloom screen-blended in YUV space pushes U/V above center — which *is* magenta — on every warm source. v1's curves compounded it. **Law: all luminance-additive operations (halation, glow, bloom) blend in RGB planes (`format=gbrp`). Curves, hue rotations, and channel remaps are BANNED from post — the register is generated, never painted on.** Post = finishing only: grain, halation, breath of vignette. Every graded output is numerically gated: mean frame RGB must preserve the source's warm order R ≥ G ≥ B.
2. **THE DISJOINT (2026-07-17):** every clip to date was generated independently *from stills* — three private worlds wearing one costume. **Law (the doctrine's one rule): world identity lives in the chain of frames.** Architecture A, sequential: leg N's `--start-image` is leg N−1's ACTUAL extracted last frame. Stills are references and reduced-motion artwork; frames are truth. No leg generates until its predecessor's last frame is on disk and eyeballed.

## Environmental continuity
- One camera, one take, one direction: the journey is a single walking shot from the moor to the desk. The camera never reverses across a seam (velocity law); inside a leg it may breathe (drift, gentle turn) under the **motion-handoff contract**: every leg *ends settling into a slow steady forward drift* toward the next space (final ~1s) and every leg *begins by continuing that same drift* — both clauses verbatim in every prompt.
- Atmosphere is continuous state, not per-shot decoration: still night air; flame sway only from stillness; no wind, weather, or drifting dust that a previous leg didn't establish. Moonlit cool is permitted ONLY through openings to the night sky (it is the night, not a grade); interior light is always flame.

## Spatial coherence
- The Cloister's geography is fixed (SH1): shots are ordered as the building is walked — moor → gate → threshold → corridor (two legs) → garth emergence → codex doorway → desk settle. A leg may not teleport: each prompt names what the PREVIOUS frame established behind the camera and what the destination is ahead.
- Eye height 1.55–1.70m, level horizon, walking pace ~1.2 m/s, 35mm field. No crane, no drone rise, no orbit across seams.

## Persistent identity (production design)
- **Prop One** (the brass-and-horn reliquary lantern) is the world's signature: present in every leg the camera passes light. Reference-attached at every still generation; in video prompts referenced by *behavior* only ("the lanterns already burning"), never redescribed (identity lives in the handed-off frame).
- Stone coursing, oak, flagstones, moss inherit automatically through frame handoff — that is the entire point of the chain.

## Color science & lens
- The register is IN the generation (anchored stills + handed-off frames). Video prompts carry **physics only** + the texture preamble: *"the world does not re-render; only the viewpoint moves."* (LOCK-V3.)
- Post-grade = `lanternlight-v2.sh` only: RGB-space halation (opacity 0.14, threshold 190, σ12), fine grain (7), vignette π/5.4, scrub encode (crf 20, g8, faststart). Numeric warm-law gate on every output.
- Lens character (soft depth falloff, gentle field) comes from the generations; NO post sharpening beyond the doctrine's optional light unsharp — currently off to protect grain structure.

## Cinematic language & pacing
- Camera grammar per beat (from the doctrine's table, chosen for a monastic walkthrough): plain forward glide is the default; the garth emergence may breathe wider (arch opening) and the desk leg *pushes in and settles* — the only deceleration-to-rest in the film, because the journey ends in a chair.
- Pacing lives in the scrub map, not the clips: hero beats (moor, corridor, desk) get `scroll` 1.8–2.8 + `linger` 0.3–0.45; transit beats stay brisk. Scrub plays both directions — every move must read in reverse.

## The gates (machine-enforced, in `film.mjs`)
1. **Anchor gate** — no batch before the founder approves the anchor still (existing sealed stills serve as anchors where they exist).
2. **Chain gate** — a leg will not generate unless its predecessor's last frame exists; each finished leg's last frame is eyeballed (evidence file) before the next spends.
3. **Warm-law gate** — graded output frame must keep R ≥ G ≥ B (postmortem 1).
4. **SSIM seam gate** — every seam ≥ 0.90 from the ENCODED files (0.75–0.90 only with recorded eyeball acceptance; < 0.75 = an endpoint was a still: automatic redo).
5. **Poster gate** — posters are extracted first frames of the encoded clips, never stills.
6. **Spend gate** — previz tier (`seedance_2_0_mini`) first for the full chain; finals only after the previz journey is approved; every run prints its generation count before burning; `--approve-spend` required.
7. **NSFW ladder** — re-roll → strip trigger words + "empty, unoccupied, architectural" → same frames on `kling3_0` → surface to the founder. One model per chain otherwise (`seedance_2_0`, std, 1080p).

## Intake
The founder's HARVEST-INTAKE remains the only PASS hand. The pipeline emits UNCURATED manifests + shot records; nothing it makes can grade its own homework.

## Postmortem 3 — the SSIM gate recalibrated (2026-07-18, from the finals)
On this register (dark, grainy, repeated stone textures) SSIM collapses on frames the eye reads as twins (measured: visually identical gate frames scored 0.23; matched colonnade frames 0.41–0.45). **Law: SSIM is a catastrophe tripwire only (<0.2 = wrong world); the seam verdict is the montage — boundary-frame pairs eyeballed side by side — plus the engine's crossfade.** Model behavior, measured and now law: this model holds END-image anchors firmly and START-image anchors loosely — repairs anchor the exit, never re-shoot the entry.
