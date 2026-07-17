# SH2 · HARVEST INTAKE — joint curation checklist
*v1 · 2026-07-15 · Run per raw take, after the harvest, before anything enters the asset bible. Raw takes stay archived uncurated (founder's rule); only PASS assets get hashed into PROVENANCE.json. Tools: eyes + `studio/SPIKES/SH1/check_seam.py` for flight endpoints.*

## A · EVERY STILL (scene stills, pose stills)
| ✓ | Check | Law |
|---|---|---|
| ☐ | **Lanternlight register**: reliquary lantern present where key-lit; living-flame chiaroscuro; matte grain; restrained contrast; no gloss, no CGI sheen | §0, Canon Style Block |
| ☐ | **Prop One fidelity**: the lantern matches the locked render (riveted brass, horn panels, ring handle, wax fossils) — any redesign fails | A-13 |
| ☐ | **Intimacy, not miniature**: tilt-shift focus never makes the room read as a model; building never seen whole (Approach still excepted) | §1.1, §1.4 |
| ☐ | Eye level, horizon level; forgotten-observer standpoint | §1.1, A-5 |
| ☐ | One aperture per frame at a working third; light source off-center | §1.3 |
| ☐ | One light source; shadows at the one fixed low angle — compare against any accepted asset | §1.2 fixed hour |
| ☐ | Warm band + ≤ one breath of moss green (living things only); no blue/cold anywhere | §1.2, A-4 |
| ☐ | Brightest region clearly dimmer than page-white would be | A-2 |
| ☐ | No people/hands/shadows-of-people; no text, letters, runes, pseudo-text | A-6 |
| ☐ | Prohibition sweep incl. new permanents: hurricane lantern, glass chimney, drinking horn; plus AI-tells (doubled doors, melted geometry) | §1.5, §5.3, A-8 |
| ☐ | Grayscale copy still reads (form survives color) | A-3 |
| ☐ | Wit budget: any humor is the room's one enumerated item | A-10 |
| ☐ | "Have you seen this image before?" — a yes fails | A-8/A-9 |
| ☐ | Provenance row written: tool, date, full prompt + Canon Style Block, references, deviations | A-11 |

## B · POSE STILLS ONLY (the 18)
| ✓ | Check |
|---|---|
| ☐ | Framing matches §5.4 exactly (bench/lintel/garth-center-single-frame/shelf-door-at-human-scale) |
| ☐ | Accretion anchor regions clean and peripheral (SH1 §5.2 slots must be composable over them) |
| ☐ | Cross-pose identity: columns, coursing, oak, lantern identical to previously accepted poses (A-13 — reject the take, never "fix later") |

## C · FLIGHTS (connector clips) — seam verification
| ✓ | Check |
|---|---|
| ☐ | Clip class exists in the sealed grammar: EXIT / ENTER / ARC / SPOKE only (SH1 §2.2); duration per route table at 1.0× |
| ☐ | **Endpoint frames vs locked pose stills: mean ΔE76 < 2.0 both ends** — run `python check_seam.py <clip> <pose-still.png> first|last`; record the numbers |
| ☐ | **Adjacent-clip seam: A.last vs B.first ΔE76 < 2.0** — `python check_seam.py <clipA.mp4> <clipB.mp4>`; then naked-eye at 2× |
| ☐ | Walking pace, constant height, no cuts, no rack focus mid-flight |
| ☐ | ARC clips (reversible): zero flame motion, smoke, or falling dust — steady flames only (SH1/SH2 U-11) |
| ☐ | Fixed-hour shadows consistent through the whole move |
| ☐ | Silent (travel has no sound, ever) |

## D · DISPOSITION per take
`PASS → hash → PROVENANCE.json → asset bible` · `FAIL(check-ids) → archive raw, note why, regenerate` · `DEVIATION candidate (a render taught the spec) → queue for founder ruling, never self-ratify.`

## C-bis · GRADED-OUTPUT LAW (founder instrument 2026-07-16)
Every clip is graded via `studio/PIPELINE/grade/lanternlight-v1.sh` BEFORE intake; all §C seam checks run on the **graded** output; joint frames extracted from encoded clips only (LOCK-V4). Grade version pinned in the manifest; a grade change is an ADR (full-library re-render by design).
