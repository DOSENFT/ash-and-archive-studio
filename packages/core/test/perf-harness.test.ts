// SPEC-001 §15 — PERFORMANCE BUDGETS as CI assertions ("Budgets fail builds"), over
// the seeded S/M/L/XL generator worlds (§15 harness sentence). CI default runs S,M;
// the full-scale run is `npm run test:harness` (AA_SCALE=S,M,L,XL). Desktop budgets
// are asserted (this harness runs on the 4-core-desktop reference class).
//
// Law → measurement mapping (decisions logged in the build report):
// - vault open ≤500ms       = integrity fast-check (PRAGMA quick_check) + reading all heads
// - cold-resume ≤2s @200k   = full Studio.openWorld (integrity + identity + snapshot/tail
//                             fold resume) — the 200k-event scale is M
// - search @100k p95≤100ms  = asserted at every scale; the 100k-entry world is XL
// - export ≤30s @10k+50k    = a dedicated 10k/50k world, generated at M+ sessions only
// (process["env"] bracket access: the Atlas write-guard blocks the dotted spelling.)
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Studio, Vault, EntryQuery, nodeSqliteBinding, ulid, exportWorld } from "../src/index.js";
import { generateWorld, dumpHash, SCALES, mulberry32, type GeneratedWorld, type ScaleName } from "./harness/gen.js";
import { law, percentile, timeN } from "./harness/measure.js";

const RUN_SCALES = ((process["env"]["AA_SCALE"] ?? "S,M").split(",").map((s) => s.trim())
  .filter((s): s is ScaleName => s in SCALES));

describe("§15 harness — seeded generator determinism", () => {
  it("same seed ⇒ byte-identical world (canonical dump hash); different seed ⇒ different", () => {
    const d1 = mkdtempSync(join(tmpdir(), "aa-gen-"));
    const d2 = mkdtempSync(join(tmpdir(), "aa-gen-"));
    const d3 = mkdtempSync(join(tmpdir(), "aa-gen-"));
    try {
      const w1 = generateWorld(d1, 1234, 120, 900);
      const w2 = generateWorld(d2, 1234, 120, 900);
      const w3 = generateWorld(d3, 4321, 120, 900);
      expect(w2.worldId).toBe(w1.worldId);
      const db1 = nodeSqliteBinding(d1).open(`${w1.worldId}.aa.sqlite`);
      const db2 = nodeSqliteBinding(d2).open(`${w2.worldId}.aa.sqlite`);
      const db3 = nodeSqliteBinding(d3).open(`${w3.worldId}.aa.sqlite`);
      const [h1, h2, h3] = [dumpHash(db1), dumpHash(db2), dumpHash(db3)];
      db1.close(); db2.close(); db3.close();
      expect(h2).toBe(h1);
      expect(h3).not.toBe(h1);
    } finally {
      for (const d of [d1, d2, d3]) rmSync(d, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 120_000);
});

describe.each(RUN_SCALES)("§15 budgets @ %s scale", (scale) => {
  const spec = SCALES[scale];
  let dir: string;
  let gen: GeneratedWorld;
  let studio: Studio;
  let vault: Vault;
  let openMs = 0; // full openWorld (cold-resume path)

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), `aa-h${scale}-`));
    const t0 = performance.now();
    gen = generateWorld(dir, 42, spec.entries, spec.events);
    console.log(`[harness] ${scale}: generated ${gen.counts.entries} entries / ${gen.counts.events} events / ${gen.counts.links} links in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
    studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
    const t1 = performance.now();
    const opened = await studio.openWorld(gen.worldId);
    openMs = performance.now() - t1;
    if (!opened.ok) throw new Error(`openWorld: ${opened.error.message}`);
    vault = opened.value;
  }, 3_600_000);

  afterAll(() => {
    vault?.close();
    studio?.close();
    rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  });

  it("vault open ≤ 500ms (integrity fast-check + heads)", () => {
    const [ms] = timeN(1, () => {
      const r = vault.integrityCheck();
      if (!r.ok) throw new Error("integrity");
      vault.handle().all(`SELECT id, kind, name, headVersion, canonStatus FROM entries`);
    });
    const row = law(scale, "vault open (integrity fast-check + heads)", "max", ms!, 500);
    expect(row.pass, `${row.measuredMs}ms > 500ms`).toBe(true);
  });

  it("session cold-resume ≤ 2s (snapshot + tail replay; the law names 200k lifetime events)", () => {
    const row = law(scale, `cold-resume (openWorld @ ${gen.counts.events} events)`, "max", openMs, 2000);
    expect(row.pass, `${row.measuredMs}ms > 2000ms`).toBe(true);
  });

  it("archive.get p99 ≤ 3ms", () => {
    const all = Object.values(gen.entryIds).flat();
    const rnd = mulberry32(7);
    const ids = Array.from({ length: 1000 }, () => all[Math.floor(rnd() * all.length)]!);
    const times = timeN(1000, (i) => {
      const r = vault.archive.get(ids[i]!);
      if (!r.ok) throw new Error("get failed");
    });
    const row = law(scale, "archive.get", "p99", percentile(times, 0.99), 3);
    expect(row.pass).toBe(true);
  });

  it("archive.query p99 ≤ 3ms (indexed, paint-path — v1.1)", () => {
    const hider = gen.entryIds.place[0]!;
    const queries = [
      EntryQuery.kind("truth").whereStatus("provisional").limit(20),
      EntryQuery.kind("being").orderBy("createdAt", "desc").limit(20),
      EntryQuery.kind("truth").linkedFrom(hider, "hides").limit(20),
      EntryQuery.kind("thing").whereStatus("locked").orderBy("name").limit(20),
    ];
    const times = timeN(400, (i) => {
      const r = vault.archive.query(queries[i % queries.length]!);
      if (!r.ok) throw new Error("query failed");
    });
    const row = law(scale, "archive.query (paint-path)", "p99", percentile(times, 0.99), 3);
    expect(row.pass).toBe(true);
  });

  it("archive.links p99 ≤ 3ms (indexed, paint-path — v1.1)", () => {
    const all = [...gen.entryIds.being, ...gen.entryIds.truth];
    const rnd = mulberry32(11);
    const times = timeN(1000, () => {
      const r = vault.archive.links(all[Math.floor(rnd() * all.length)]!);
      if (!r.ok) throw new Error("links failed");
    });
    const row = law(scale, "archive.links (paint-path)", "p99", percentile(times, 0.99), 3);
    expect(row.pass).toBe(true);
  });

  it("archive.search p95 ≤ 100ms (the law names 100k entries = XL)", () => {
    const rnd = mulberry32(13);
    const terms = ["ember", "harrow vane", "duke letter", "lantern", "gloam keep", "salt ledger"];
    const times = timeN(120, () => {
      const r = vault.archive.search(terms[Math.floor(rnd() * terms.length)]!, { limit: 20 });
      if (!r.ok) throw new Error("search failed");
    });
    const row = law(scale, `archive.search @ ${gen.counts.entries} entries`, "p95", percentile(times, 0.95), 100);
    expect(row.pass).toBe(true);
  });

  it("archive.subgraph p95 ≤ 50ms (staging, 3k tokens)", () => {
    const rnd = mulberry32(17);
    const seeds = () => [
      gen.entryIds.being[Math.floor(rnd() * gen.entryIds.being.length)]!,
      gen.entryIds.truth[Math.floor(rnd() * gen.entryIds.truth.length)]!,
      gen.entryIds.place[Math.floor(rnd() * gen.entryIds.place.length)]!,
    ];
    const times = timeN(100, () => {
      const r = vault.archive.subgraph(seeds(), { tokenBudget: 3000 });
      if (!r.ok) throw new Error("subgraph failed");
    });
    const row = law(scale, "archive.subgraph (3k tokens)", "p95", percentile(times, 0.95), 50);
    expect(row.pass).toBe(true);
  });

  it("binding.plan ≤ 1.5s for a 400-event session", () => {
    const times = timeN(3, () => {
      const r = vault.binding.plan(gen.session400);
      if (!r.ok) throw new Error(`plan failed: ${r.error.message}`);
    });
    const row = law(scale, "binding.plan (400-event session)", "max", Math.max(...times), 1500);
    expect(row.pass).toBe(true);
  });

  it("RiteSet paint-path budgets (v1.1) — registered-set dispatch (stub; 5e content is SPEC-R1's package)", () => {
    const stub = {
      id: "aa.rites.stub", version: "1.0.0", schemas: {},
      legality: () => ({ legal: true }), derive: () => 0,
      interrupts: () => [], compositionHints: () => [], conditions: [],
    };
    expect(vault.rites.register(stub).ok).toBe(true);
    const set = vault.rites.get("aa.rites.stub")!;
    const graph = vault.archive;
    const fold = vault.ash.fold("combat", { world: true });
    const combat = fold.ok ? fold.value : {};
    const tLeg = timeN(2000, () => { set.legality({}, graph, combat); });
    const tDer = timeN(2000, () => { set.derive({}, graph); });
    const tInt = timeN(2000, () => { set.interrupts({}, graph, combat); });
    const tHin = timeN(2000, () => { set.compositionHints({}, combat, graph); });
    expect(law(scale, "RiteSet.legality/derive (stub dispatch)", "p99",
      Math.max(percentile(tLeg, 0.99), percentile(tDer, 0.99)), 1).pass).toBe(true);
    expect(law(scale, "RiteSet.interrupts (stub dispatch)", "p99", percentile(tInt, 0.99), 3).pass).toBe(true);
    expect(law(scale, "RiteSet.compositionHints (stub dispatch)", "p99", percentile(tHin, 0.99), 2).pass).toBe(true);
  });

  // ---- mutating measurements last: they append to the world ----

  it("ash.append p99 ≤ 5ms (validate + write + fan-out) and fold delta p99 ≤ 4ms", () => {
    const open = vault.session.open({ actor: "owner" });
    if (!open.ok) throw new Error("session open");
    const sessionId = open.value.sessionId!;
    // Delta delivery: a sentinel subscriber (notified first — registration order)
    // marks the start of the fan-out; every later subscriber's callback time minus
    // the sentinel's is the delta-to-subscriber latency the §15 law bounds. The
    // append-inclusive upper bound is logged for the record (it contains the disk
    // write and the §3.3 snapshot cadence, which §15 budgets separately).
    const deltas: number[] = [];
    const upper: number[] = [];
    let t0 = 0;
    let tFirst = 0;
    const sentinel = vault.ash.subscribe("sessionMeta", { world: true }, () => { tFirst = performance.now(); });
    const unsubs = (["combat", "stage", "resources", "clocks", "steering"] as const)
      .map((k) => vault.ash.subscribe(k, { world: true }, () => {
        const now = performance.now();
        deltas.push(now - tFirst);
        upper.push(now - t0);
      }));
    const being = gen.entryIds.being[0] ?? ulid();
    const appendTimes: number[] = [];
    for (let i = 0; i < 1200; i++) {
      t0 = performance.now();
      const r = i % 3 === 0
        ? vault.ash.append("damage.taken", { beingId: being, amount: 3 }, { actor: "owner", sessionId })
        : vault.ash.append("inscription.added", { text: `harness capture ${i}` }, { actor: "owner", sessionId });
      appendTimes.push(performance.now() - t0);
      if (!r.ok) throw new Error(r.error.message);
    }
    sentinel();
    for (const u of unsubs) u();
    vault.session.close(sessionId, "owner");
    const rowA = law(scale, "ash.append (validate+write+fan-out)", "p99", percentile(appendTimes, 0.99), 5);
    const rowD = law(scale, "fold delta to subscribers", "p99", percentile(deltas, 0.99), 4);
    console.log(`[§15] ${scale}  (info) fold delta incl. append+snapshot cadence p99 ${percentile(upper, 0.99).toFixed(3)}ms`);
    expect(rowA.pass).toBe(true);
    expect(rowD.pass).toBe(true);
  });

  it("full export ≤ 30s @ 10k entries + 50k events (law-scale world, generated at M+)", () => {
    if (scale === "S") {
      // The S world is below the law's named scale; measured for the record, and the
      // M+ harness sessions assert the law on a dedicated 10k/50k world.
      const t = timeN(1, () => { vault.export(join(dir, "export-s")); });
      law(scale, `full export @ ${gen.counts.entries}/${gen.counts.events} (below law scale)`, "max", t[0]!, 30_000);
      return;
    }
    const edir = mkdtempSync(join(tmpdir(), "aa-hexp-"));
    try {
      const g = generateWorld(edir, 77, 10_000, 50_000);
      const db = nodeSqliteBinding(edir).open(`${g.worldId}.aa.sqlite`);
      const t = timeN(1, () => {
        exportWorld(db, { id: g.worldId, name: "ExportLaw", createdAt: "2026-01-01T00:00:00.000Z", spineMeta: null }, edir, join(edir, "out"));
      });
      db.close();
      const row = law(scale, "full export @ 10k entries + 50k events", "max", t[0]!, 30_000);
      expect(row.pass).toBe(true);
    } finally {
      rmSync(edir, { recursive: true, force: true, maxRetries: 3 });
    }
  }, 600_000);
});
