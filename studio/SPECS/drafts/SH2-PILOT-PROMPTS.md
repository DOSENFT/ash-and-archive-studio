# SH2 · PILOT PROMPT PACK — manual generation (ChatGPT · Gemini)
*v1 · 2026-07-14 · Companion to SPEC-SH2 §5 under ADR-SH2-E (Higgsfield removed; stills manual; flights deferred). Operator: Marcus. Every output is held against its checklist below; a fail is regenerated, never hand-waved. Record per accepted asset in PROVENANCE.json: `{tool, date, full prompt text, reference images attached, operator:"founder"}`.*

**Operating rules (both tools):**
- Paste the prompt whole; do not paraphrase. Attach the listed reference images where the tool accepts them (both do).
- Ask for the stated aspect ratio; if the tool ignores it, regenerate — never crop a pose still (framing is law).
- Neither tool honors separate negative prompts; the "Never include" block is part of the prompt body by design.
- Generate ≥4 candidates per asset; run the checklist on the best; a checklist fail on all four = revise *dressing details only* (never the anchor language) and note the deviation.

---

## ASSET 1 — THE STUDIO LANTERN (prop canon #1; generate FIRST — it is a reference input to assets 2 and 3)
**Aspect 1:1 · no reference images (this is the origin of the chain)**

**ChatGPT — paste verbatim:**
> Create a square photograph, not an illustration. An available-light 35mm still photograph, matte and unprocessed: a single squat lantern standing on a dark oak workbench against a near-black warm background. The lantern is the only light source, lit from within by a steady flame behind panels of thin translucent horn, its frame of aged unpolished brass with visible tool marks and one small geometric maker's stamp punched into the base plate — an abstract angular device, not a letter, not a rune. Squat proportions: wider than tall, a broad ring handle folded down, wax drips fossilized at one corner. Warm palette only — amber flame light, umber shadow, bone highlights on the horn, iron-black falloff. Honest wear: rubbed edges, a shallow dent, soot shading inside the top vent. Deep focus, level camera at bench height, the lantern slightly off-center with its shadow cast to the right at a low fixed angle. Never include: people, hands, text or letters of any kind, runes, other objects, glass panes, chrome or polish, neon, haze, glow effects, lens flare, bloom, saturated color, blue tones, painting or fantasy-art style, video-game rendering.

**Gemini — paste verbatim:**
> Photorealistic product-scale still photograph, 35mm available light, matte, square format. Subject: one squat brass-and-horn lantern, lit, standing alone on a dark oak workbench, near-black warm background. Specification: aged unpolished brass frame with tool marks; thin translucent horn panels (not glass) glowing warm amber from a steady interior flame; wider than tall; broad folded ring handle; fossilized wax drips at one corner; one small abstract angular maker's stamp punched in the base plate (geometric device only — no letters, no runes); rubbed edges, one shallow dent, soot inside the top vent. Lighting: the lantern is the sole light source; shadow falls right at a low, fixed angle. Palette strictly warm: amber, umber, bone, iron-black. Deep focus, camera level at bench height, subject slightly off-center. Exclude: people, hands, any text or lettering, additional objects, glass, chrome, polish, neon, haze, glow, flare, bloom, saturation, blue or cold tones, illustration or painterly style, video-game render.

**PASS/FAIL — Asset 1:** ☐ A-1 could sit on a real wooden table as a handmade thing ☐ squat/horn/brass matches spec (this image BECOMES the canon — pick the one you'd own) ☐ maker's stamp present, geometric, illegible-as-language ☐ sole light source, steady (no glow halo) ☐ warm band only; no blue anywhere ☐ shadow low and single-direction ☐ no text/figures/extra objects ☐ grayscale copy still reads (form survives without color) ☐ brightest highlight clearly dimmer than white paper would be. **On acceptance: this file is the hash-referenced lantern forever (A-13).**

---

## ASSET 2 — SEAM-ADJACENT AMBULATORY POSE PAIR (two lintel-class stills; the one-hand + seam test for manual tools)
**Aspect 16:9 · Frame B is generated WITH Frame A attached as a reference image + the accepted lantern**

**ChatGPT — Frame A — paste verbatim (attach: lantern image):**
> Create a wide 16:9 photograph, not an illustration. An available-light 35mm still photograph, matte and unprocessed, deep focus, level horizon, from standing eye height (about 1.65 meters): the covered walkway of a working scriptorium-cloister at night, standing on a bay's threshold facing inward toward a small open courtyard. Left of frame: a row of worn honey-grey stone columns on low walls, stone floors dished by centuries of feet. Right of frame: the dark timber-and-stone wall of the workrooms. Ahead: the ambulatory curves gently away; exactly one doorway is visible down the walk, and beside it stands this exact lantern (see attached reference — reproduce it faithfully), lit, the sole light source, its warm amber falloff raking the stone; shadow angles low and fixed. Dressing: a rolled chart leaning in a niche, nothing else. Palette strictly warm — amber, umber, bone, iron-black; deepest shadow warm near-black, never pure black. Never include: people, hands, silhouettes or human shadows, any text or lettering, banners, torches on walls, multiple light sources, moonbeams, volumetric light rays, fog, haze, flare, bloom, blue tone, cold light, saturated color, painting or concept-art style, video-game render, symmetrical centered composition.

**ChatGPT — Frame B — paste verbatim (attach: Frame A + lantern):**
> Create a wide 16:9 photograph continuing the attached photograph exactly — same night, same building, same stone, same lantern design, same warm palette, same low fixed shadow angle, same 35mm lens at the same standing eye height. The camera has walked about four meters further along the same cloister walkway toward the courtyard and now stands on the NEXT bay's threshold: the doorway that was distant in the attached image is now just passed on the right; the same lantern (attached reference) now stands behind-right casting its light forward past the camera; ahead, the walkway continues its gentle curve with one further doorway visible far down the walk. Reproduce the column profiles, floor stones, and wall materials of the attached image precisely — this must read as the same photographer's next step in the same building, seconds later. Never include: people, hands, human shadows, any text, extra light sources, light rays, fog, haze, flare, bloom, blue tone, saturated color, illustration style, video-game render.

**Gemini — Frame A / Frame B:** identical text to the ChatGPT versions with the first sentence replaced by: *"Photorealistic 16:9 still photograph, 35mm available light, matte, deep focus, level horizon, standing eye height (~1.65 m)."* (attach the same references).

**PASS/FAIL — Asset 2 (run on the pair together):** ☐ A-5 eye height: horizon crosses the columns at chest-height, floor and lintels both natural — no looking down, no miniature feel ☐ one aperture ahead per frame ☐ lantern matches the canon reference in BOTH frames (A-13 — this is the pilot's core question) ☐ stone coursing/column profile consistent across the pair (one hand, one building) ☐ shadow angle identical in both (the fixed hour) ☐ sole light source each frame ☐ warm band; generous darkness; no pure black ☐ no people/text/rays/haze ☐ grayscale survives ☐ the pair reads as two steps of one walk — if B reads as a different building, FAIL and regenerate B with stronger reference language. *(This asset decides ADR-SH2-B's reversal clause for the manual pipeline: if 4 attempts cannot hold A-13 across the pair, invoke the painterly-grade fallback decision — yours, not mine.)*

---

## ASSET 3 — THE TOYBOX BENCH (the workbench law made visible)
**Aspect 3:2 · attach: lantern image**

**ChatGPT — paste verbatim:**
> Create a 3:2 photograph, not an illustration. An available-light 35mm still photograph, matte and unprocessed: leaning close over a craftsman's workbench in a dark warm workshop — the camera low and near, as a watchmaker or miniature-painter bends over small work. Foreground, sharply in focus on scarred dark oak: a small carved wooden game piece mid-work (an abstract tapering form, knife-marks visible, one facet still unfinished), a worn steel carving knife laid down mid-task, curled wood shavings, a small open parts drawer holding three or four finished pieces of folded card and cast brass, each clearly a handmade token, none representing a creature or a face. Behind, softly out of focus: the warm amber falloff of this exact lantern (attached reference) at the bench's far end, and the suggestion of shelves. Honest wear everywhere: the bench edge rounded by years, paint-worn edges on the card pieces. Palette strictly warm — amber, umber, bone, iron-black. The scene reads as just left: work interrupted seconds ago, no person present. Never include: people, hands, faces, figurines of creatures or characters, dragons, painted miniatures of monsters, dice with numerals, any text or letters, glass, plastic, neon, haze, flare, blue tone, saturated color, illustration style, video-game render.

**Gemini:** same body; first sentence → *"Photorealistic 3:2 macro-proximity still photograph, 35mm available light, matte, shallow depth of field."*

**PASS/FAIL — Asset 3:** ☐ camera down-and-in (bench fills frame; no overview) ☐ every foreground object passes A-1 (plausible handmade things on a real table) ☐ NO piece depicts a creature, face, or anything that could be someone's fiction — abstract/geometric token forms only (A-14's spirit; the machine may not imagine for the user) ☐ knife-marks/wear read as one maker ☐ shallow focus ONLY here (background soft, foreground crisp) ☐ lantern falloff matches canon ☐ just-left gesture present (knife mid-task) ☐ warm band, no text, no figures ☐ grayscale survives.

---

## ASSET 4 — ONE TABLE PIECE: THE LOCATION TOKEN (parts-drawer catalog, kind-keyed family)
**Aspect 1:1 · attach: lantern image (for light continuity)**

**ChatGPT — paste verbatim:**
> Create a square photograph, not an illustration. An available-light 35mm still photograph, matte and unprocessed, close on a dark oak surface: one small hand-carved wooden token standing upright — the height of a chess pawn. Its form is abstract and architectural: a simple tapering column with a wide stable base and a notched crown, the way a fine chess set abstracts a rook — it suggests "a place" without depicting any particular building, landscape, or fantasy structure. Carved from close-grained wood, knife-facets visible, edges softened by handling, a tiny geometric maker's stamp pressed into the base — no letters. Lit warm from off-frame left by lantern light (attached reference for light character), single low shadow. Palette strictly warm: amber, umber, bone, iron-black. Deep focus. Never include: people, hands, faces, creatures, buildings in miniature, dioramas, terrain, maps, paint colors, numerals, any text or lettering, plastic, glass, neon, blue tone, glow, flare, illustration style, video-game render.

**Gemini:** same body; first sentence → *"Photorealistic square still photograph, 35mm available light, matte, deep focus, object study on dark oak."*

**PASS/FAIL — Asset 4:** ☐ A-1 both clauses: plausible handmade AND form derives from nothing — no fiction, no terrain, no depiction of any *particular* place (a chess-rook abstraction, not a model building) ☐ reads as one of a *family* (could imagine ten siblings in a drawer) — this is the kind-keyed catalog, not a portrait ☐ maker's stamp present, illegible ☐ handling wear visible ☐ single warm light, low fixed shadow ☐ no text/numerals/paint ☐ grayscale survives. **Reminder in law: the user assigns this token to an entry; nothing about any entry shaped it (A-14).**
