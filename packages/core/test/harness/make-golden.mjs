// One-off fixture forge for §16.2 golden logs. Run manually (node --experimental-strip-types
// is not needed — this drives the compiled-by-vitest sources through tsx-free import of
// vitest's node loader is overkill; we just re-implement the tiny deterministic script
// here and let the checked-in fixture be the law from then on).
//
//   node test/harness/make-golden.mjs
//
// Writes test/spec-fixtures/golden-log.jsonl + golden-folds.json. The fixture is
// generated ONCE and checked in; the test replays it forever (and other runtimes —
// Tauri-Rust SQLite, WASM — replay the same file for the I-8 cross-runtime contract).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "spec-fixtures");
mkdirSync(outDir, { recursive: true });

// mulberry32 — same PRNG as the harness generator
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
let t = Date.UTC(2026, 0, 2);
const rnd = mulberry32(7);
function detUlid() {
  const ms = t++;
  let time = ""; let x = ms;
  for (let i = 0; i < 10; i++) { time = B32[x % 32] + time; x = Math.floor(x / 32); }
  let r = "";
  for (let i = 0; i < 16; i++) r += B32[Math.floor(rnd() * 32)];
  return time + r;
}

const A = detUlid(), B = detUlid(), CLOCK = detUlid(), MASK = detUlid();
const events = [
  ["session.opened", {}],
  ["scene.framed", { frame: "the salt vault door stands open" }],
  ["combat.started", { stage: [A, B] }],
  ["initiative.set", { order: [{ beingId: A, value: 18 }, { beingId: B, value: 11 }] }],
  ["turn.started", { beingId: A }],
  ["damage.taken", { beingId: B, amount: 9, source: "blade" }],
  ["condition.applied", { beingId: B, conditionId: "poisoned" }],
  ["slot.spent", { beingId: A, level: 2 }],
  ["clock.ticked", { entryId: CLOCK, step: 1 }],
  ["turn.ended", { beingId: A }],
  ["turn.started", { beingId: B }],
  ["death.save", { beingId: B, result: "failure" }],
  ["healing.applied", { beingId: B, amount: 4 }],
  ["condition.removed", { beingId: B, conditionId: "poisoned" }],
  ["inscription.added", { text: "the warden blinks first", tags: ["beat"] }],
  ["inscription.added", { text: "this one never happened" }], // struck below
  ["roll.made", { notation: "1d20", results: [17], total: 17 }],
  ["clock.ticked", { entryId: CLOCK, step: 2 }],
  ["autoturn.granted", { eventType: "turn.started" }],
  ["margin.allocated", { slot: 1, proposalId: detUlid() }],
  ["entry.kindled", { entryId: CLOCK }],
  ["mask.donned", { beingId: A, maskId: MASK }],
  ["veil.raised", { byActor: "owner" }],
  ["veil.lifted", {}],
  ["turn.ended", { beingId: B }],
  ["combat.ended", {}],
  ["rest.taken", { beingId: "party", kind: "long" }],
  ["scene.ended", {}],
  ["session.closed", {}],
];

const lines = events.map(([type, payload], ix) => JSON.stringify({
  ix, type, payload, actor: ix % 4 === 3 ? "player-a" : "owner",
  // ix 15 is struck by the replayer after append (strike is an API act, not a column)
  strike: ix === 15,
}));
writeFileSync(join(outDir, "golden-log.jsonl"), lines.join("\n") + "\n");
console.log(`golden-log.jsonl: ${events.length} events (ids A=${A} B=${B} CLOCK=${CLOCK} MASK=${MASK})`);
console.log("Now run the vitest golden test with AA_WRITE_GOLDEN=1 to emit golden-folds.json.");
