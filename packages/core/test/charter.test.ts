// SPEC-001 §7 Charter — §7.1 status-machine transition tables, E-1003 at lock
// (v1.2/ADR-003-D: mark-and-teach, never a save rejection), §7.4 contradiction
// detector suite over a curated conflict corpus (§16.4), docket + resolve with the
// three patches, §7.3 alias protocol on resolve-by-rename, §7.5 readiness (v1.2
// ReadinessReport shape, active-unlocks-link counting incl. the ended-link case,
// thresholds-as-data), and determinism (same log ⇒ same ReadinessReport).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Studio, Vault, nodeSqliteBinding, ulid,
  type EntryKind, type PlanItem, type ReadinessReport,
} from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;
let worldId: string;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-charter-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Charterworld");
  if (!w.ok) throw new Error("world create failed");
  worldId = w.value.id;
  const v = await studio.openWorld(worldId);
  if (!v.ok) throw new Error("world open failed");
  vault = v.value;
});
afterEach(() => { vault.close(); studio.close(); rmSync(dir, { recursive: true, force: true }); });

const ink = { provenance: "ink" as const, actor: "owner" };

function draftOk(kind: EntryKind, body: unknown) {
  const r = vault.archive.draft(kind, body, ink);
  if (!r.ok) throw new Error(`draft failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}
function linkOk(from: string, to: string, type: Parameters<typeof vault.archive.link>[2]) {
  const r = vault.archive.link(from, to, type, "owner");
  if (!r.ok) throw new Error(`link failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}
function lockOk(id: string, note?: string) {
  const r = vault.charter.lock(id, "owner", note);
  if (!r.ok) throw new Error(`lock failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}
function docketOk() {
  const r = vault.charter.docket();
  if (!r.ok) throw new Error("docket failed");
  return r.value;
}
function readinessOk(scope: string): ReadinessReport {
  const r = vault.charter.readiness(scope);
  if (!r.ok) throw new Error(`readiness failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

/** A truth with an active unlocks link (Lever Test passing by construction). */
function leveredTruth(name: string, target?: string) {
  const t = draftOk("truth", { name, lever: `lever of ${name}` });
  const hub = target ?? draftOk("thing", { name: `${name} — what it opens` }).id;
  linkOk(t.id, hub, "unlocks");
  return t;
}

/** Mint UNKNOWN-status entries the only sanctioned way: a Binding with statusIntent
 *  'unknown' (§7.1 — charter has no route to 'unknown'). */
function mintUnknowns(count: number): string[] {
  const s = vault.session.open({ actor: "owner" });
  if (!s.ok) throw new Error("session open failed");
  const sessionId = s.value.sessionId!;
  const plan = vault.binding.plan(sessionId);
  if (!plan.ok) throw new Error("plan failed");
  for (let i = 0; i < count; i += 1) {
    const item: PlanItem = {
      key: `unknown:${i}`, disposition: "bind", ratifier: "owner", challenged: false,
      leverTestFailed: false, conflicts: [], citations: [],
      upsert: {
        op: "newEntry", kind: "thing", statusIntent: "unknown",
        body: {
          name: `Bounded Unknown ${i}`, bounds: "somewhere in the March",
          whyUnknown: "no one has looked", tableTests: [`test ${i}`], payoff: "a reveal",
        },
      },
    };
    plan.value.items.push(item);
  }
  const receipt = vault.binding.commit(plan.value, "owner", "full");
  if (!receipt.ok) throw new Error(`commit failed: ${receipt.error.code} ${receipt.error.message}`);
  return receipt.value.boundVersions;
}

/** Builds a world that passes every §7.5 domain. Unique names throughout (no
 *  naming-sprawl noise). Returns the ids the tests poke at. */
function buildPassWorld() {
  const toy = (i: number) => ({
    goal: `goal ${i}`, method: `method ${i}`, activeProblem: `problem ${i}`,
    hooks: [`hook ${i}a`, `hook ${i}b`], lever: `lever ${i}`, escalation: `escalation ${i}`,
  });
  // 6 beings: lattice-complete AND toy-complete (actors ≥5, toys share the count)
  const beings = Array.from({ length: 6 }, (_, i) =>
    draftOk("being", {
      name: `Actor ${i}`, beingType: i % 2 === 0 ? "person" : "faction",
      enforcement: `enforcement ${i}`, ...toy(i),
    }));
  // 6 toy-complete things → 12 toys total
  for (let i = 0; i < 6; i += 1) draftOk("thing", { name: `Toy Thing ${i}`, ...toy(100 + i) });
  // ≥2 active tension pairs (never serves+threatens on the SAME pair)
  linkOk(beings[0]!.id, beings[1]!.id, "threatens");
  linkOk(beings[2]!.id, beings[3]!.id, "serves");
  // 3 gravity rulings (within the 3–7 band)
  for (let i = 0; i < 3; i += 1) draftOk("ruling", { name: `Gravity ${i}`, layer: "gravity" });
  // constraints: 3 chokepoints + 1 scarcity ruling
  for (let i = 0; i < 3; i += 1) draftOk("place", { name: `Pass ${i}`, chokepoint: true });
  draftOk("ruling", { name: "Iron is scarce", layer: "structural", scarcityVector: "iron" });
  // faith/magic ruling with 3-channel tells
  draftOk("ruling", { name: "Discernment", layer: "structural", discernmentTells: ["smell", "sound", "shadow"] });
  // 10 lever-passing truths, all unlocking one hub
  const hub = draftOk("thing", { name: "The Hub of Consequence" });
  const truths = Array.from({ length: 10 }, (_, i) => leveredTruth(`Truth ${i}`, hub.id));
  // 3 bounded unknowns (via Binding)
  mintUnknowns(3);
  return { beings, truths, hub };
}

// ---- §7.1 the status machine ----

describe("charter.lock / charter.demote (§7.1 status machine)", () => {
  it("locks provisional → locked with a new ink version (all transitions create versions)", () => {
    const e = draftOk("being", { name: "Duke Alrik" });
    const locked = lockOk(e.id, "sworn at the table");
    expect(locked.canonStatus).toBe("locked");
    expect(locked.ordinal).toBe(2); // §7.1: the transition IS a version
    expect(locked.boundAt).not.toBeNull();
    const hist = vault.archive.history(e.id);
    expect(hist.ok && hist.value[1]!.canonStatus === "locked").toBe(true);
    expect(hist.ok && hist.value[1]!.boundBy === "owner").toBe(true);
    expect(hist.ok && hist.value[1]!.note === "sworn at the table").toBe(true);
  });

  it("rejects lock on a locked entry and on an unknown entry (no such edges)", () => {
    const e = draftOk("being", { name: "Sable" });
    lockOk(e.id);
    const again = vault.charter.lock(e.id, "owner");
    expect(!again.ok && again.error.code === "E-1001").toBe(true);
    mintUnknowns(1);
    const unknown = vault.handle().get<{ id: string }>(
      `SELECT id FROM entries WHERE canonStatus='unknown'`)!;
    const r = vault.charter.lock(unknown.id, "owner");
    expect(!r.ok && r.error.code === "E-1001").toBe(true);
  });

  it("rejects lock of a pencil-provenance entry (I-4: no pencil → LOCKED without a Binding)", () => {
    const s = vault.session.open({ actor: "owner" });
    if (!s.ok) throw new Error("session");
    const proposalId = ulid();
    const pp = vault.ash.append("pencil.proposed",
      { proposalId, voice: "archivist", targetKind: "thing", draft: { name: "Whispered Thing" } },
      { actor: "owner", sessionId: s.value.sessionId! });
    expect(pp.ok).toBe(true);
    const d = vault.archive.draft("thing", { name: "Whispered Thing" }, { provenance: "pencil", actor: "owner", proposalId });
    if (!d.ok) throw new Error("pencil draft failed");
    const r = vault.charter.lock(d.value.id, "owner");
    expect(!r.ok && r.error.code === "E-1001").toBe(true);
  });

  it("demotes locked → provisional only, and the note is REQUIRED", () => {
    const e = draftOk("place", { name: "The Salt Gate" });
    lockOk(e.id);
    const noNote = vault.charter.demote(e.id, "owner", "  ");
    expect(!noNote.ok && noNote.error.code === "E-1001").toBe(true);
    const r = vault.charter.demote(e.id, "owner", "story-patch: the gate was never sealed");
    expect(r.ok && r.value.canonStatus === "provisional").toBe(true);
    expect(r.ok && r.value.ordinal === 3).toBe(true);
    // and demoting a provisional entry is not a transition
    const again = vault.charter.demote(e.id, "owner", "again");
    expect(!again.ok && again.error.code === "E-1001").toBe(true);
  });

  it("v1.2 demote → revise → re-lock is the locked-edit path (E-1104 guards reviseDraft)", () => {
    const e = draftOk("place", { name: "The Mill" });
    lockOk(e.id);
    const blocked = vault.archive.reviseDraft(e.id, { name: "The Burned Mill" }, "owner");
    expect(!blocked.ok && blocked.error.code === "E-1104").toBe(true);
    expect(vault.charter.demote(e.id, "owner", "the mill burned").ok).toBe(true);
    const revised = vault.archive.reviseDraft(e.id, { name: "The Burned Mill" }, "owner");
    expect(revised.ok).toBe(true);
    const relocked = lockOk(e.id);
    expect(relocked.canonStatus).toBe("locked");
    expect(relocked.aliases).toContain("The Mill"); // §7.3 — renames never replace
  });

  it("returns E-1101 for missing and archived entries", () => {
    expect(vault.charter.lock(ulid(), "owner").ok).toBe(false);
    const e = draftOk("thing", { name: "Dust" });
    vault.archive.archiveEntry(e.id, "owner");
    const r = vault.charter.lock(e.id, "owner");
    expect(!r.ok && r.error.code === "E-1101").toBe(true);
  });
});

// ---- E-1003 at lock (v1.2 / ADR-003-D) ----

describe("the Lever Test at charter.lock (E-1003, v1.2/ADR-003-D)", () => {
  it("a lever-less truth is DRAFTABLE (never a save rejection) but not LOCKABLE", () => {
    const t = draftOk("truth", { name: "The tithe is stolen" }); // draft succeeds lever-less
    const r = vault.charter.lock(t.id, "owner");
    expect(!r.ok && r.error.code === "E-1003").toBe(true);
  });

  it("locks a truth with an active unlocks link", () => {
    const t = leveredTruth("The Duke's letter was forged");
    expect(lockOk(t.id).canonStatus).toBe("locked");
  });

  it("fires E-1003 again when the only unlocks link has been ended (lever broken)", () => {
    const t = leveredTruth("The well is poisoned");
    const links = vault.archive.links(t.id, { type: "unlocks", direction: "from" });
    if (!links.ok) throw new Error("links failed");
    expect(vault.archive.endLink(links.value[0]!.id, "owner").ok).toBe(true);
    const r = vault.charter.lock(t.id, "owner");
    expect(!r.ok && r.error.code === "E-1003").toBe(true);
  });
});

// ---- §7.4/§16.4 contradiction detector suite: curated conflict corpus ----

describe("the docket (§7.4 detectors over a curated conflict corpus, §16.4)", () => {
  it("surfaces name/alias collisions as docket-level warnings (§7.3 naming-sprawl guard)", () => {
    const a = draftOk("being", { name: "Duke Álrik" });
    const b = draftOk("being", { name: "duke alrik" }); // case/diacritic-insensitive
    draftOk("place", { name: "Duke Alrik" });           // different kind: no case
    const cases = docketOk().filter((c) => c.kind === "name-collision");
    expect(cases).toHaveLength(1);
    expect(cases[0]!.entries.sort()).toEqual([a.id, b.id].sort());
    expect(cases[0]!.explanation).toContain("share a name/alias");
  });

  it("surfaces serves+threatens both active between one pair (link-contradiction)", () => {
    const a = draftOk("being", { name: "Warden" });
    const b = draftOk("being", { name: "Smuggler" });
    linkOk(a.id, b.id, "serves");
    linkOk(a.id, b.id, "threatens");
    const cases = docketOk().filter((c) => c.kind === "link-contradiction");
    expect(cases).toHaveLength(1);
    expect(cases[0]!.entries).toEqual([a.id, b.id]);
    expect(cases[0]!.explanation).toContain("cannot both be active");
  });

  it("reads machine-written contradicts links (typed via the note prefix) and human-filed ones", () => {
    const a = draftOk("truth", { name: "The heir lives" });
    const b = draftOk("truth", { name: "The heir drowned" });
    linkOk(a.id, b.id, "contradicts"); // human/pencil-filed through the same APIs (§7.4)
    const cases = docketOk().filter((c) => c.id.startsWith("case:docket:"));
    expect(cases).toHaveLength(1);
    expect(cases[0]!.kind).toBe("explicit-contradiction"); // asserted content contradiction
    expect(cases[0]!.entries).toEqual([a.id, b.id]);
  });

  it("charter.lock runs detection: a colliding lock dockets a contradicts link, never rejects", () => {
    draftOk("being", { name: "Mother Vey" });
    const dupe = draftOk("being", { name: "mother vey" });
    expect(lockOk(dupe.id).canonStatus).toBe("locked"); // marks, not save rejections (ADR-003-D)
    const link = vault.handle().get<{ note: string }>(
      `SELECT note FROM links WHERE type='contradicts' AND endedByVersion IS NULL AND fromEntry=?`, dupe.id);
    expect(link?.note).toContain("[name-collision]");
    // the docket shows it once (link-backed; the live naming scan dedupes)
    const cases = docketOk().filter((c) => c.kind === "name-collision");
    expect(cases).toHaveLength(1);
    expect(cases[0]!.id.startsWith("case:docket:")).toBe(true);
  });

  it("surfaces a single-entry invariant case when locked canon changed invariant fields", () => {
    const t = leveredTruth("The crown is hollow");
    lockOk(t.id);
    expect(vault.charter.demote(t.id, "owner", "revisiting the lever").ok).toBe(true);
    const revised = vault.archive.reviseDraft(t.id,
      { name: "The crown is hollow", lever: "a DIFFERENT lever" }, "owner");
    expect(revised.ok).toBe(true);
    lockOk(t.id); // re-lock with a changed invariant field ('lever' — §7.4's own example)
    const cases = docketOk().filter((c) => c.id === `case:invariant:${t.id}`);
    expect(cases).toHaveLength(1);
    expect(cases[0]!.kind).toBe("explicit-contradiction");
    expect(cases[0]!.entries).toEqual([t.id]);
    expect(cases[0]!.explanation).toContain("lever");
    expect(cases[0]!.versions).toHaveLength(2); // prior locked version + head
  });

  it("is empty for a clean world", () => {
    buildPassWorld();
    expect(docketOk()).toEqual([]);
  });
});

// ---- §7.4 resolve: the three patches ----

describe("charter.resolve (§7.4 — minimal | clean | story)", () => {
  it("minimal: edits the incoming draft; resolve-by-rename follows the alias protocol (§7.3)", () => {
    const a = draftOk("being", { name: "Brother Hale" });
    const b = draftOk("being", { name: "Brother Hale" }); // the incoming duplicate
    const caseId = docketOk().find((c) => c.kind === "name-collision")!.id;
    const r = vault.charter.resolve(caseId,
      { patch: "minimal", entryId: b.id, body: { name: "Brother Hale the Younger" } }, "owner");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0]!.name).toBe("Brother Hale the Younger");
    expect(r.value[0]!.aliases).toContain("Brother Hale"); // renames never replace
    expect(r.value[0]!.ordinal).toBe(2);
    expect(docketOk()).toEqual([]); // the collision is gone
    void a;
  });

  it("clean: a new version of the existing LOCKED entry (I-3 canon correction), status preserved", () => {
    const a = leveredTruth("The heir lives");
    lockOk(a.id);
    const b = draftOk("truth", { name: "The heir drowned" });
    linkOk(a.id, b.id, "contradicts");
    const caseId = docketOk().find((c) => c.id.startsWith("case:docket:"))!.id;
    const r = vault.charter.resolve(caseId,
      { patch: "clean", entryId: a.id,
        body: { name: "The heir lives", lever: "lever of The heir lives", inHiding: true },
        note: "clean patch: the drowning was staged" }, "owner");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value[0]!.canonStatus).toBe("locked"); // same status unless explicitly transitioned
    const hist = vault.archive.history(a.id);
    expect(hist.ok && hist.value.at(-1)!.note).toBe("clean patch: the drowning was staged");
    // the backing contradicts link ended (links end, never delete)
    const active = vault.handle().get<{ c: number }>(
      `SELECT COUNT(*) c FROM links WHERE type='contradicts' AND endedByVersion IS NULL`);
    expect(active?.c).toBe(0);
    expect(docketOk()).toEqual([]);
  });

  it("story: both stand; a new truth explains; the contradicts link ends", () => {
    const a = draftOk("truth", { name: "The bell rang at dusk" });
    const b = draftOk("truth", { name: "The bell never rang" });
    linkOk(a.id, b.id, "contradicts");
    const caseId = docketOk()[0]!.id;
    const before = vault.handle().get<{ c: number }>(`SELECT COUNT(*) c FROM entries WHERE kind='truth'`)!.c;
    const r = vault.charter.resolve(caseId,
      { patch: "story", truthBody: { name: "Two bells hang in the tower" } }, "owner");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value[0]!.kind).toBe("truth");
    expect(r.value[0]!.canonStatus).toBe("provisional"); // a working draft (lever-less is fine pre-lock)
    expect(vault.handle().get<{ c: number }>(`SELECT COUNT(*) c FROM entries WHERE kind='truth'`)!.c).toBe(before + 1);
    const ended = vault.handle().get<{ endedByVersion: string | null }>(
      `SELECT endedByVersion FROM links WHERE fromEntry=? AND type='contradicts'`, a.id);
    expect(ended?.endedByVersion).not.toBeNull();
    expect(docketOk()).toEqual([]);
  });

  it("rejects an unknown case id and a patch entry outside the case", () => {
    const r = vault.charter.resolve("case:docket:nope", { patch: "story", truthBody: { name: "x" } }, "owner");
    expect(!r.ok && r.error.code === "E-1101").toBe(true);
    draftOk("being", { name: "Twin" });
    draftOk("being", { name: "Twin" });
    const stranger = draftOk("being", { name: "Stranger" });
    const caseId = docketOk()[0]!.id;
    const bad = vault.charter.resolve(caseId,
      { patch: "minimal", entryId: stranger.id, body: { name: "Renamed" } }, "owner");
    expect(!bad.ok && bad.error.code === "E-1001").toBe(true);
  });
});

// ---- §7.5 readiness ----

describe("charter.readiness (§7.5, v1.2 ReadinessReport shape)", () => {
  it("an empty world fails with every domain reported, missing minimums, and build steps", () => {
    const rep = readinessOk(worldId);
    expect(rep.verdict).toBe("fail");
    expect(rep.domains.map((d) => d.domain)).toEqual([
      "gravity-truths", "power-lattice", "constraints-chokepoints", "constraints-scarcity",
      "faith-magic", "toys", "truths", "unknowns",
    ]);
    for (const d of rep.domains) expect(d.met).toBe(false);
    expect(rep.missing.length).toBeGreaterThanOrEqual(8);
    expect(rep.smallestNextBuild.length).toBe(rep.missing.length);
    for (const s of rep.smallestNextBuild) {
      expect(["draft", "link", "revise"]).toContain(s.action);
      expect(s.hint.length).toBeGreaterThan(0);
    }
  });

  it("a fully built world passes, with per-domain progress reported for MET domains too (v1.2)", () => {
    buildPassWorld();
    const rep = readinessOk(worldId);
    expect(rep.verdict).toBe("pass");
    expect(rep.missing).toEqual([]);
    expect(rep.smallestNextBuild).toEqual([]);
    const byDomain = Object.fromEntries(rep.domains.map((d) => [d.domain, d]));
    expect(byDomain["gravity-truths"]).toMatchObject({ count: 3, min: 3, met: true });
    expect(byDomain["power-lattice"]).toMatchObject({ count: 6, min: 5, met: true });
    expect(byDomain["constraints-chokepoints"]).toMatchObject({ count: 3, min: 3, met: true });
    expect(byDomain["toys"]).toMatchObject({ count: 12, min: 12, met: true });
    expect(byDomain["truths"]).toMatchObject({ count: 10, min: 10, met: true });
    expect(byDomain["unknowns"]).toMatchObject({ count: 3, min: 3, met: true });
  });

  it("counts only truths with an ACTIVE unlocks link — the ended-link case (ADR-003-D)", () => {
    const { truths } = buildPassWorld();
    const links = vault.archive.links(truths[9]!.id, { type: "unlocks", direction: "from" });
    if (!links.ok) throw new Error("links failed");
    expect(vault.archive.endLink(links.value[0]!.id, "owner").ok).toBe(true);
    const rep = readinessOk(worldId);
    const truthsDomain = rep.domains.find((d) => d.domain === "truths")!;
    expect(truthsDomain.count).toBe(9);
    expect(truthsDomain.met).toBe(false);
    expect(rep.missing).toContainEqual({ domain: "truths", need: 10, have: 9 });
    expect(rep.verdict).toBe("borderline"); // one short of pass
    expect(rep.smallestNextBuild[0]!.kind).toBe("truth");
  });

  it("thresholds are data: a Ruling entry's readinessThresholds overrides the checklist", () => {
    leveredTruth("Only Truth");
    draftOk("ruling", {
      name: "House thresholds", layer: "local",
      readinessThresholds: { truths: 1, toys: 0, "gravity-truths": 0, "power-lattice": 0,
        "power-lattice-pairs": 0, "constraints-chokepoints": 0, "constraints-scarcity": 0,
        "faith-magic": 0, unknowns: 0 },
    });
    const rep = readinessOk(worldId);
    expect(rep.verdict).toBe("pass");
    expect(rep.domains.find((d) => d.domain === "truths")).toMatchObject({ count: 1, min: 1, met: true });
  });

  it("gravity truths hold a 3–7 band: over-max reports a revise step", () => {
    for (let i = 0; i < 8; i += 1) draftOk("ruling", { name: `G${i}`, layer: "gravity" });
    const rep = readinessOk(worldId);
    expect(rep.domains.find((d) => d.domain === "gravity-truths")!.met).toBe(false);
    expect(rep.missing).toContainEqual({ domain: "gravity-truths", need: 7, have: 8 });
    const step = rep.smallestNextBuild.find((s) => s.action === "revise");
    expect(step?.kind).toBe("ruling");
  });

  it("is deterministic: same log ⇒ same ReadinessReport, across calls and reopen", async () => {
    buildPassWorld();
    const a = readinessOk(worldId);
    const b = readinessOk(worldId);
    expect(b).toEqual(a);
    vault.close();
    const v = await studio.openWorld(worldId);
    if (!v.ok) throw new Error("reopen failed");
    vault = v.value;
    expect(readinessOk(worldId)).toEqual(a);
  });

  it("region scope: an entry id evaluates its active-link neighborhood; unknown scope is E-1101", () => {
    buildPassWorld();
    const region = draftOk("place", { name: "The Verge" });
    const t = leveredTruth("Verge Truth");
    linkOk(t.id, region.id, "witnessed-by");
    const rep = readinessOk(region.id);
    expect(rep.verdict).toBe("fail"); // a region holds almost nothing of the world
    expect(rep.domains.find((d) => d.domain === "truths")!.count).toBe(1); // the in-scope truth counts
    const bad = vault.charter.readiness(ulid());
    expect(!bad.ok && bad.error.code === "E-1101").toBe(true);
  });
});

// ---- §7.2 rulings ----

describe("charter.rulings (§7.2)", () => {
  it("lists ruling entries, optionally filtered by layer", () => {
    draftOk("ruling", { name: "Iron law", layer: "gravity" });
    draftOk("ruling", { name: "Toll law", layer: "structural" });
    draftOk("ruling", { name: "Unlayered custom" });
    const all = vault.charter.rulings();
    expect(all.ok && all.value.length === 3).toBe(true);
    const gravity = vault.charter.rulings("gravity");
    expect(gravity.ok && gravity.value.length === 1 && gravity.value[0]!.name === "Iron law").toBe(true);
    const dynamic = vault.charter.rulings("dynamic");
    expect(dynamic.ok && dynamic.value.length === 0).toBe(true);
  });
});
