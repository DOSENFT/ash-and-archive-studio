// SPEC-001 §16.5 — PERSPECTIVE LEAK TESTS (security-critical; runs in CI and release).
// Adversarial queries against undisclosed truths must return ZERO leakage across every
// query-builder path. §2.4: enforcement is at the query layer, below the API line —
// a Wing cannot accidentally leak what it never receives. §17: an undisclosed truth's
// existence is itself undisclosed.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Studio, Vault, EntryQuery, nodeSqliteBinding, stableJson, HIDDEN_FIELDS,
} from "../src/index.js";

// Marker strings that must NEVER appear in any player-perspective result.
const SECRET_NAME = "Xyzzumbra the Forged Ducal Letter";
const SECRET_LEVER = "SECRET-LEVER-ZOTHRAQ";
const SECRET_ALIAS = "the-umbral-forgery";
const HIDDEN_MARK = "HIDDEN-FIELD-VELQUARN";

let dir: string;
let studio: Studio;
let vault: Vault;
let secretTruth: string;   // undisclosed truth (provisional)
let secretLocked: string;  // undisclosed truth (locked via direct status)
let knownTruth: string;    // truth disclosed to player-a
let hider: string;         // place that hides the secret truth
let door: string;          // thing the secret truth unlocks
let witnessBeing: string;  // being linked to the secret truth

const P = "player-a";
const STRANGER = "player-nobody";

function leakCheck(payload: unknown): void {
  const s = stableJson(payload);
  expect(s).not.toContain(SECRET_NAME.split(" ")[0]); // "Xyzzumbra"
  expect(s).not.toContain(SECRET_LEVER);
  expect(s).not.toContain(SECRET_ALIAS);
  expect(s).not.toContain(secretTruth);
  expect(s).not.toContain(secretLocked);
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-leak-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Leaks");
  if (!w.ok) throw new Error("create");
  const v = await studio.openWorld(w.value.id);
  if (!v.ok) throw new Error("open");
  vault = v.value;
  const a = vault.archive;

  const draft = (kind: Parameters<typeof a.draft>[0], body: Record<string, unknown>): string => {
    const r = a.draft(kind, body, { provenance: "ink", actor: "owner" });
    if (!r.ok) throw new Error(r.error.message);
    return r.value.id;
  };

  secretTruth = draft("truth", { name: SECRET_NAME, lever: SECRET_LEVER, notes: "the duke's letter was forged" });
  secretLocked = draft("truth", { name: `${SECRET_NAME} II`, lever: SECRET_LEVER });
  knownTruth = draft("truth", { name: "The Bell Tolls At Dusk", lever: "lever: ring it" });
  hider = draft("place", { name: "The Salt Vault", chokepoint: true });
  door = draft("thing", { name: "The Sable Door" });
  witnessBeing = draft("being", { name: "Warden Reed", beingType: "person", secretNote: HIDDEN_MARK });

  // aliases carry the secret too (rename → alias protocol)
  const rev = a.reviseDraft(secretTruth, { name: SECRET_ALIAS, lever: SECRET_LEVER }, "owner");
  if (!rev.ok) throw new Error(rev.error.message);
  const back = a.reviseDraft(secretTruth, { name: SECRET_NAME, lever: SECRET_LEVER }, "owner");
  if (!back.ok) throw new Error(back.error.message);

  // lock one secret truth through the charter (it has an unlocks link first)
  for (const [from, to, type] of [
    [secretTruth, door, "unlocks"], [secretLocked, door, "unlocks"], [knownTruth, door, "unlocks"],
    [hider, secretTruth, "hides"], [hider, secretLocked, "hides"], [hider, knownTruth, "hides"],
    [secretTruth, witnessBeing, "witnessed-by"],
  ] as const) {
    const l = a.link(from, to, type, "owner");
    if (!l.ok) throw new Error(l.error.message);
  }
  const lock = vault.charter.lock(secretLocked, "owner");
  if (!lock.ok) throw new Error(lock.error.message);

  const d = a.disclose(knownTruth, P);
  if (!d.ok) throw new Error(d.error.message);
});

afterAll(() => {
  vault.close();
  studio.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
});

describe("§16.5 — get/history under a perspective", () => {
  it("get: an undisclosed truth's existence is undisclosed (E-1101), at head and at any version", () => {
    for (const who of [P, STRANGER]) {
      const r = vault.archive.get(secretTruth, { perspective: who });
      expect(!r.ok && r.error.code === "E-1101").toBe(true);
      const hist = vault.archive.history(secretTruth); // owner reads history for version ids
      expect(hist.ok).toBe(true);
      if (hist.ok) {
        for (const ver of hist.value) {
          const rv = vault.archive.get(secretTruth, { atVersion: ver.versionId, perspective: who });
          expect(!rv.ok && rv.error.code === "E-1101").toBe(true);
        }
      }
      const rl = vault.archive.get(secretLocked, { perspective: who });
      expect(!rl.ok && rl.error.code === "E-1101").toBe(true);
    }
  });

  it("history: undisclosed truth returns E-1101 under a perspective; disclosed truth is readable", () => {
    const r = vault.archive.history(secretTruth, { perspective: P });
    expect(!r.ok && r.error.code === "E-1101").toBe(true);
    const k = vault.archive.history(knownTruth, { perspective: P });
    expect(k.ok).toBe(true);
  });

  it("control: the omniscient owner default still sees everything (no false negatives)", () => {
    expect(vault.archive.get(secretTruth).ok).toBe(true);
    expect(vault.archive.get(secretLocked).ok).toBe(true);
    const q = vault.archive.query(EntryQuery.kind("truth"));
    expect(q.ok && q.value.length === 3).toBe(true);
  });
});

describe("§16.5 — every query-builder path × undisclosed truths ⇒ zero leakage", () => {
  const paths: Array<[string, () => EntryQuery]> = [
    ["kind", () => EntryQuery.kind("truth")],
    ["whereStatus provisional", () => EntryQuery.kind("truth").whereStatus("provisional")],
    ["whereStatus locked", () => EntryQuery.kind("truth").whereStatus("locked")],
    ["whereStatus unknown", () => EntryQuery.kind("truth").whereStatus("unknown")],
    ["linkedFrom typed", () => EntryQuery.kind("truth").linkedFrom(hider, "hides")],
    ["linkedFrom untyped", () => EntryQuery.kind("truth").linkedFrom(hider)],
    ["disclosedTo self", () => EntryQuery.kind("truth").disclosedTo(P)],
    ["disclosedTo other", () => EntryQuery.kind("truth").disclosedTo("player-b")],
    ["undisclosed", () => EntryQuery.kind("truth").undisclosed()],
    ["orderBy boundAt desc", () => EntryQuery.kind("truth").orderBy("boundAt", "desc")],
    ["orderBy name asc", () => EntryQuery.kind("truth").orderBy("name", "asc")],
    ["orderBy createdAt + limit", () => EntryQuery.kind("truth").orderBy("createdAt", "desc").limit(50)],
    ["limit 1000", () => EntryQuery.kind("truth").limit(1000)],
    ["full chain", () => EntryQuery.kind("truth").whereStatus("provisional").linkedFrom(hider, "hides").orderBy("boundAt", "desc").limit(20)],
  ];

  it.each(paths)("query path [%s] leaks nothing under any perspective", (_name, mk) => {
    for (const who of [P, STRANGER]) {
      const r = vault.archive.query(mk(), { perspective: who });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      leakCheck(r.value);
      for (const e of r.value) {
        if (e.kind === "truth") {
          // anything that survived must be disclosed to this principal
          expect(who === P && e.id === knownTruth).toBe(true);
        }
      }
    }
  });

  it("the disclosed truth still flows to its principal (no over-redaction)", () => {
    const r = vault.archive.query(EntryQuery.kind("truth"), { perspective: P });
    expect(r.ok && r.value.map((e) => e.id)).toEqual([knownTruth]);
  });
});

describe("§16.5 — search / links / subgraph under a perspective", () => {
  it("search cannot find an undisclosed truth by name, alias, or body text", () => {
    for (const term of ["Xyzzumbra", "umbral", SECRET_LEVER, "forged"]) {
      const r = vault.archive.search(term, { perspective: P, limit: 50 });
      expect(r.ok).toBe(true);
      if (r.ok) leakCheck(r.value);
    }
    // owner control: the same terms DO hit without a perspective
    const owner = vault.archive.search("Xyzzumbra", { limit: 50 });
    expect(owner.ok && owner.value.length > 0).toBe(true);
  });

  it("links never name an undisclosed truth as either endpoint", () => {
    for (const id of [hider, door, witnessBeing]) {
      for (const dirn of ["from", "to", "both"] as const) {
        const r = vault.archive.links(id, { direction: dirn, perspective: P });
        expect(r.ok).toBe(true);
        if (r.ok) leakCheck(r.value);
      }
    }
    // the subject itself: undisclosed truth → E-1101 (existence undisclosed)
    const r = vault.archive.links(secretTruth, { perspective: P });
    expect(!r.ok && r.error.code === "E-1101").toBe(true);
    // disclosed truth keeps its visible links
    const k = vault.archive.links(knownTruth, { perspective: P });
    expect(k.ok && k.value.length > 0).toBe(true);
  });

  it("subgraph staging (the Dramaturg's only source, §8) excludes undisclosed truths entirely", () => {
    const r = vault.archive.subgraph([hider, witnessBeing, door], { perspective: P, tokenBudget: 8000 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      leakCheck(r.value);
      expect(r.value.entries.some((e) => e.id === knownTruth)).toBe(true); // disclosed flows
    }
  });

  it("hidden-field redaction mechanism (§2.4): a field marked hidden vanishes under any perspective", () => {
    const hidden = HIDDEN_FIELDS.being as string[];
    hidden.push("secretNote"); // SPEC-001 marks no concrete field; exercise the single registry
    try {
      const r = vault.archive.get(witnessBeing, { perspective: P });
      expect(r.ok).toBe(true);
      if (r.ok) expect(stableJson(r.value.body)).not.toContain(HIDDEN_MARK);
      const q = vault.archive.query(EntryQuery.kind("being"), { perspective: P });
      expect(q.ok).toBe(true);
      if (q.ok) expect(stableJson(q.value)).not.toContain(HIDDEN_MARK);
      const h = vault.archive.history(witnessBeing, { perspective: P });
      expect(h.ok).toBe(true);
      if (h.ok) expect(stableJson(h.value)).not.toContain(HIDDEN_MARK);
      const sg = vault.archive.subgraph([witnessBeing], { perspective: P });
      expect(sg.ok).toBe(true);
      if (sg.ok) expect(stableJson(sg.value.entries)).not.toContain(HIDDEN_MARK);
      // owner default remains omniscient
      const o = vault.archive.get(witnessBeing);
      expect(o.ok && stableJson(o.value.body)).toContain(HIDDEN_MARK);
    } finally {
      hidden.pop();
    }
  });
});
