# Manual generation fallback (SPEC-SH3 §11.5 step 4 — the documented exception)
When the Higgsfield MCP is unavailable, the founder pastes into the GUI by hand.
The law does not relax: (1) the prompt comes from an APPROVED shot record — copy
`prompt` verbatim, attach every `elements` reference image; (2) the raw result is
saved uncurated; (3) a take row is appended to the shot record by hand:
`{ takeId, tool: "higgsfield-gui:<model>", date, result: "<path>", failure? }`;
(4) verification (`check_seam.py`, A-checks) and intake proceed identically.
A prompt composed in the GUI from memory is invalid by construction (§11.3).
