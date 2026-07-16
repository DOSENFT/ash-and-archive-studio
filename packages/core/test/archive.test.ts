import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import {
  Studio, Vault, nodeSqliteBinding, ulid, EntryQuery,
  type EntryKind, type RiteSet,
} from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "aa-archive-"));
  studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  const w = await studio.shelf.create("Testworld");
  if (!w.ok) throw new Error("world create failed");
  const v = await studio.openWorld(w.value.id);
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

/** Test-only stand-in for §7 charter.lock (a later build step). */
function lockDirectly(entryId: string): void {
  vault.handle().run(`UPDATE entries SET canonStatus='locked', boundAt=? WHERE id=?`,
    new Date().toISOString(), entryId);
  vault.handle().run(`UPDATE entry_versions SET canonStatus='locked' WHERE versionId=
    (SELECT headVersion FROM entries WHERE id=?)`, entryId);
}

describe("archive.draft (§5.3, §2.2)", () => {
  it("creates a provisional ink entry with an ordinal-1 working version", () => {
    const v = draftOk("being", { name: "Duke Vane", beingType: "person", goal: "hold the March" });
    expect(v.kind).toBe("being");
    expect(v.name).toBe("Duke Vane");
    expect(v.canonStatus).toBe("provisional"); // never locked at draft (§5.3)
    expect(v.provenance).toBe("ink");
    expect(v.ordinal).toBe(1);
    expect(v.boundAt).toBeNull();
    expect((v.body as { goal: string }).goal).toBe("hold the March");
    const got = vault.archive.get(v.id);
    expect(got.ok && got.value.versionId).toBe(v.versionId);
  });

  it("rejects schema mismatches with E-1001 + field paths, unknown kinds with E-1001", () => {
    const noName = vault.archive.draft("being", { beingType: "person" }, ink);
    expect(!noName.ok && noName.error.code === "E-1001").toBe(true);
    if (!noName.ok) expect(JSON.stringify(noName.error.data)).toContain("name");
    const badEnum = vault.archive.draft("being", { name: "X", beingType: "dragon" }, ink);
    expect(!badEnum.ok && badEnum.error.code === "E-1001").toBe(true);
    if (!badEnum.ok) expect(JSON.stringify(badEnum.error.data)).toContain("beingType");
    const badClock = vault.archive.draft("clock", { name: "Doom", steps: ["one", "two"] }, ink);
    expect(!badClock.ok && badClock.error.code === "E-1001").toBe(true); // four steps for clock
    const badKind = vault.archive.draft("folder" as EntryKind, { name: "nope" }, ink);
    expect(!badKind.ok && badKind.error.code === "E-1001").toBe(true);
  });

  it("pencil drafts require a pencil.proposed event and cite it (I-4/I-5)", () => {
    const missing = vault.archive.draft("truth", { name: "Forged letter" }, { provenance: "pencil", actor: "dramaturg" });
    expect(!missing.ok && missing.error.code === "E-1001").toBe(true);
    const orphan = vault.archive.draft("truth", { name: "Forged letter" },
      { provenance: "pencil", actor: "dramaturg", proposalId: ulid() });
    expect(!orphan.ok && orphan.error.code === "E-1001").toBe(true);
    const proposalId = ulid();
    const ev = vault.ash.append("pencil.proposed",
      { proposalId, voice: "archivist", targetKind: "truth", draft: { name: "Forged letter" } }, { actor: "owner" });
    expect(ev.ok).toBe(true);
    if (!ev.ok) return;
    const drafted = vault.archive.draft("truth", { name: "Forged letter" },
      { provenance: "pencil", actor: "dramaturg", proposalId });
    expect(drafted.ok).toBe(true);
    if (!drafted.ok) return;
    expect(drafted.value.provenance).toBe("pencil");
    const hist = vault.archive.history(drafted.value.id);
    expect(hist.ok && hist.value[0]?.citations).toEqual([ev.value.eventId]);
    expect(hist.ok && hist.value[0]?.boundBy).toBeNull(); // working version (§2.2)
  });
});

describe("archive.reviseDraft (§5.3, §7.3, v1.2)", () => {
  it("appends an ink working version and applies the alias protocol on rename", () => {
    const v1 = draftOk("place", { name: "The Gloamfen", chokepoint: true });
    const r = vault.archive.reviseDraft(v1.id, { name: "The Drowned Fen", chokepoint: true }, "owner");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.ordinal).toBe(2);
    expect(r.value.name).toBe("The Drowned Fen");
    expect(r.value.aliases).toContain("The Gloamfen"); // renames never replace (§7.3)
    const hist = vault.archive.history(v1.id);
    expect(hist.ok && hist.value.length).toBe(2);
    if (hist.ok) {
      expect(hist.value[1]?.supersedes).toBe(v1.versionId);
      expect(hist.value[1]?.provenance).toBe("ink");
      expect(hist.value[1]?.canonStatus).toBe("provisional"); // status carries unless transitioned (§7.1)
    }
    // history answers "what did we believe?" — atVersion reads the old body (§5.2)
    const old = vault.archive.get(v1.id, { atVersion: v1.versionId });
    expect(old.ok && (old.value.body as { name: string }).name).toBe("The Gloamfen");
  });

  it("returns E-1104 LockedEntry on a LOCKED entry (v1.2)", () => {
    const v1 = draftOk("truth", { name: "The Duke's letter was forged" });
    lockDirectly(v1.id);
    const r = vault.archive.reviseDraft(v1.id, { name: "The letter was genuine" }, "owner");
    expect(!r.ok && r.error.code === "E-1104").toBe(true);
    const missing = vault.archive.reviseDraft(ulid(), { name: "ghost" }, "owner");
    expect(!missing.ok && missing.error.code === "E-1101").toBe(true);
  });
});

describe("links (§2.3, §5.3)", () => {
  it("creates typed links pinned to the asserting version; rejects self-links and duplicates", () => {
    const duke = draftOk("being", { name: "Duke Vane" });
    const secret = draftOk("truth", { name: "The tithe is stolen" });
    const l = vault.archive.link(duke.id, secret.id, "hides", "owner");
    expect(l.ok).toBe(true);
    if (l.ok) expect(l.value.sinceVersion).toBe(duke.headVersion);
    const self = vault.archive.link(duke.id, duke.id, "serves", "owner");
    expect(!self.ok && self.error.code === "E-1001").toBe(true);
    const dup = vault.archive.link(duke.id, secret.id, "hides", "owner");
    expect(!dup.ok && dup.error.code === "E-1103").toBe(true);
    const ghost = vault.archive.link(duke.id, ulid(), "hides", "owner");
    expect(!ghost.ok && ghost.error.code === "E-1101").toBe(true);
  });

  it("ends links (never deletes), filters by type/direction, and answers temporally via at", () => {
    const duke = draftOk("being", { name: "Duke Vane" });
    const rival = draftOk("being", { name: "Lady Merav" });
    const keep = draftOk("place", { name: "Vane Keep" });
    const threatens = vault.archive.link(rival.id, duke.id, "threatens", "owner");
    const serves = vault.archive.link(duke.id, keep.id, "serves", "owner");
    expect(threatens.ok && serves.ok).toBe(true);
    if (!threatens.ok || !serves.ok) return;
    const toDuke = vault.archive.links(duke.id, { direction: "to" });
    expect(toDuke.ok && toDuke.value.map((x) => x.id)).toEqual([threatens.value.id]);
    const fromDuke = vault.archive.links(duke.id, { direction: "from" });
    expect(fromDuke.ok && fromDuke.value.map((x) => x.id)).toEqual([serves.value.id]);
    const typed = vault.archive.links(duke.id, { type: "threatens" });
    expect(typed.ok && typed.value.length).toBe(1);

    // advance rival's head, then end — the link lived in [sinceVersion, endedByVersion)
    const revised = vault.archive.reviseDraft(rival.id, { name: "Lady Merav", goal: "take the March" }, "owner");
    expect(revised.ok).toBe(true);
    const ended = vault.archive.endLink(threatens.value.id, "owner");
    expect(ended.ok).toBe(true);
    const activeNow = vault.archive.links(duke.id);
    expect(activeNow.ok && activeNow.value.map((x) => x.id)).toEqual([serves.value.id]);
    // temporal: it was active at the version that asserted it ("who threatened whom in session 6")
    const back = vault.archive.links(duke.id, { at: threatens.value.sinceVersion });
    expect(back.ok && back.value.some((x) => x.id === threatens.value.id)).toBe(true);
    // the row survives — ended, not deleted
    const row = vault.handle().get<{ endedByVersion: string | null }>(
      `SELECT endedByVersion FROM links WHERE id=?`, threatens.value.id);
    expect(row?.endedByVersion).not.toBeNull();
    const again = vault.archive.endLink(threatens.value.id, "owner");
    expect(!again.ok && again.error.code === "E-1101").toBe(true);
    // partial unique index: the pair may re-link after the old link ended
    const relink = vault.archive.link(rival.id, duke.id, "threatens", "owner");
    expect(relink.ok).toBe(true);
  });
});

describe("EntryQuery (§5.5)", () => {
  it("runs the spec's example chain against a seeded fixture", () => {
    const duke = draftOk("being", { name: "Duke Vane" });
    const t1 = draftOk("truth", { name: "The tithe is stolen" });
    const t2 = draftOk("truth", { name: "The heir lives" });
    const t3 = draftOk("truth", { name: "The well is poisoned" });
    draftOk("place", { name: "Vane Keep" }); // wrong kind — must not appear
    for (const t of [t1, t2, t3]) {
      const l = vault.archive.link(duke.id, t.id, "hides", "owner");
      expect(l.ok).toBe(true);
    }
    lockDirectly(t1.id); lockDirectly(t2.id); // t3 stays provisional
    expect(vault.archive.disclose(t1.id, "playerA").ok).toBe(true);
    expect(vault.archive.disclose(t2.id, "playerB").ok).toBe(true);

    const q = EntryQuery.kind("truth")
      .whereStatus("locked")
      .linkedFrom(duke.id, "hides")
      .disclosedTo("playerA")
      .orderBy("createdAt", "desc").limit(20);
    const r = vault.archive.query(q);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.map((v) => v.id)).toEqual([t1.id]); // locked ∧ hidden-by-duke ∧ disclosed-to-A
  });

  it("undisclosed(), limit, and deterministic ordering", () => {
    const a = draftOk("truth", { name: "Alpha" });
    const b = draftOk("truth", { name: "Beta" });
    const c = draftOk("truth", { name: "Gamma" });
    expect(vault.archive.disclose(b.id, "playerA").ok).toBe(true);
    const und = vault.archive.query(EntryQuery.kind("truth").undisclosed());
    expect(und.ok && und.value.map((v) => v.id)).toEqual([a.id, c.id]); // ULID creation order
    const lim = vault.archive.query(EntryQuery.kind("truth").orderBy("name", "desc").limit(2));
    expect(lim.ok && lim.value.map((v) => v.name)).toEqual(["Gamma", "Beta"]);
  });
});

describe("perspective redaction (§2.4, §16.5 leak test)", () => {
  it("undisclosed truths are invisible through get, the builder, and subgraph — zero leakage", () => {
    const duke = draftOk("being", { name: "Duke Vane" });
    const secret = draftOk("truth", { name: "The tithe is stolen" });
    const known = draftOk("truth", { name: "The harvest failed" });
    expect(vault.archive.link(duke.id, secret.id, "hides", "owner").ok).toBe(true);
    expect(vault.archive.link(known.id, duke.id, "threatens", "owner").ok).toBe(true);
    expect(vault.archive.disclose(known.id, "playerA").ok).toBe(true);

    // get: existence itself is not revealed (E-1101, not a redacted stub)
    const blocked = vault.archive.get(secret.id, { perspective: "playerA" });
    expect(!blocked.ok && blocked.error.code === "E-1101").toBe(true);
    // omniscient owner default still sees it
    expect(vault.archive.get(secret.id).ok).toBe(true);
    // non-truth kinds are not perspective-excluded
    expect(vault.archive.get(duke.id, { perspective: "playerA" }).ok).toBe(true);

    // builder path
    const q = vault.archive.query(EntryQuery.kind("truth").disclosedTo("playerA"));
    expect(q.ok && q.value.map((v) => v.id)).toEqual([known.id]);

    // subgraph staging (§8): the undisclosed truth and every link touching it stay out
    const staged = vault.archive.subgraph([duke.id], { perspective: "playerA" });
    expect(staged.ok).toBe(true);
    if (!staged.ok) return;
    const blob = JSON.stringify(staged.value);
    expect(blob).not.toContain(secret.id);
    expect(blob).not.toContain("tithe");
    expect(staged.value.entries.map((e) => e.id).sort()).toEqual([duke.id, known.id].sort());

    // disclosure opens the door
    expect(vault.archive.disclose(secret.id, "playerA").ok).toBe(true);
    expect(vault.archive.get(secret.id, { perspective: "playerA" }).ok).toBe(true);
    const restaged = vault.archive.subgraph([duke.id], { perspective: "playerA" });
    expect(restaged.ok && restaged.value.entries.some((e) => e.id === secret.id)).toBe(true);
  });
});

describe("archive.search (§5.2, E-1601)", () => {
  it("FTS finds by name, alias, and body text; filters kinds; excludes archived; survives revision", () => {
    const fen = draftOk("place", { name: "The Gloamfen", chokepoint: true });
    draftOk("being", { name: "Gloam Warden" });
    const juniper = draftOk("thing", { name: "Signet ring", description: "juniper wax seal of the March" });
    const byName = vault.archive.search("gloamfen");
    expect(byName.ok && byName.value.map((h) => h.entryId)).toEqual([fen.id]);
    const byBody = vault.archive.search("juniper");
    expect(byBody.ok && byBody.value.map((h) => h.entryId)).toEqual([juniper.id]);
    const kinds = vault.archive.search("gloam", { kinds: ["being"] });
    expect(kinds.ok && kinds.value.every((h) => h.kind === "being")).toBe(true);

    // revision re-indexes (same entry, deduped) and the alias remains findable
    const rev = vault.archive.reviseDraft(fen.id, { name: "The Drowned Fen", chokepoint: true }, "owner");
    expect(rev.ok).toBe(true);
    const newName = vault.archive.search("drowned");
    expect(newName.ok && newName.value.map((h) => h.entryId)).toEqual([fen.id]);
    const oldAlias = vault.archive.search("gloamfen");
    expect(oldAlias.ok && oldAlias.value.map((h) => h.entryId)).toEqual([fen.id]); // deduped to one hit

    expect(vault.archive.archiveEntry(juniper.id, "owner").ok).toBe(true);
    const gone = vault.archive.search("juniper");
    expect(gone.ok && gone.value.length).toBe(0);
    // soft retire: get still answers (history is the product, I-6)
    expect(vault.archive.get(juniper.id).ok).toBe(true);
    const q = vault.archive.query(EntryQuery.kind("thing"));
    expect(q.ok && q.value.length).toBe(0); // but query surfaces exclude it
  });

  it("degrades to LIKE search when FTS is unavailable (E-1601 behavior)", async () => {
    const base = nodeSqliteBinding(mkdtempSync(join(tmpdir(), "aa-nofts-")));
    const noFts = { ...base, ftsAvailable: false };
    const s2 = await Studio.open({ platformBinding: noFts });
    const w = await s2.shelf.create("Dim world");
    if (!w.ok) throw new Error("create failed");
    const v2 = await s2.openWorld(w.value.id);
    if (!v2.ok) throw new Error("open failed");
    expect(v2.value.capability().fts).toBe(false); // the flag (§11 E-1601: degrade + flag)
    const d = v2.value.archive.draft("place", { name: "The Gloamfen" }, ink);
    expect(d.ok).toBe(true);
    const hit = v2.value.archive.search("Gloamfen");
    expect(hit.ok && hit.value.length === 1).toBe(true);
    v2.value.close(); s2.close();
  });
});

describe("archive.subgraph (§8)", () => {
  it("stages seeds plus linked neighborhood, capped by token budget with truncation flag", () => {
    const duke = draftOk("being", { name: "Duke Vane", goal: "hold the March", method: "levies", enforcement: "the Warden" });
    const keep = draftOk("place", { name: "Vane Keep", chokepoint: true });
    const secret = draftOk("truth", { name: "The tithe is stolen" });
    expect(vault.archive.link(duke.id, keep.id, "serves", "owner").ok).toBe(true);
    expect(vault.archive.link(duke.id, secret.id, "hides", "owner").ok).toBe(true);
    const full = vault.archive.subgraph([duke.id], {});
    expect(full.ok).toBe(true);
    if (!full.ok) return;
    expect(full.value.entries.map((e) => e.id).sort()).toEqual([duke.id, keep.id, secret.id].sort());
    expect(full.value.links.length).toBe(2);
    expect(full.value.truncated).toBe(false);
    expect(full.value.tokenEstimate).toBeGreaterThan(0);
    expect(full.value.tokenEstimate).toBeLessThanOrEqual(3000); // default cap

    const tiny = vault.archive.subgraph([duke.id], { tokenBudget: 40 });
    expect(tiny.ok).toBe(true);
    if (!tiny.ok) return;
    expect(tiny.value.truncated).toBe(true);
    expect(tiny.value.entries.length).toBeLessThan(3);
    expect(tiny.value.tokenEstimate).toBeLessThanOrEqual(40);

    const clamped = vault.archive.subgraph([duke.id], { tokenBudget: 999999 }); // hard max 8000
    expect(clamped.ok && clamped.value.tokenEstimate <= 8000).toBe(true);
  });
});

describe("rites.register (§5.7)", () => {
  const wellFormed: RiteSet = {
    id: "aa.rites.5e", version: "1.0.0",
    schemas: { spell: z.strictObject({ level: z.number().int() }) },
    legality: () => ({ legal: true }),
    derive: () => 0,
    interrupts: () => [],
    conditions: [{ id: "prone", name: "Prone", severity: 2, mechanicalText: "Disadvantage on attack rolls." }],
    compositionHints: () => [],
  };

  it("registers a well-formed set; rejects duplicates and malformed contracts as values", () => {
    expect(vault.rites.register(wellFormed).ok).toBe(true);
    const dup = vault.rites.register(wellFormed);
    expect(!dup.ok && dup.error.code === "E-1001").toBe(true);
    const badVersion = vault.rites.register({ ...wellFormed, id: "aa.rites.x", version: "one" });
    expect(!badVersion.ok && badVersion.error.code === "E-1001").toBe(true);
    const badFn = vault.rites.register({ ...wellFormed, id: "aa.rites.y", legality: undefined as never });
    expect(!badFn.ok && badFn.error.code === "E-1001").toBe(true);
    const badConditions = vault.rites.register({
      ...wellFormed, id: "aa.rites.z",
      conditions: [{ id: "x", name: "X", severity: 9, mechanicalText: "no" }] as never,
    });
    expect(!badConditions.ok && badConditions.error.code === "E-1001").toBe(true);
  });
});

describe("paint-path budgets (§15 in-test sanity; the full S/M/L/XL harness is step 7)", () => {
  it("holds get/query/links p99 ≤ 3ms and search p95 ≤ 100ms on a seeded world", () => {
    const beings: string[] = [];
    for (let i = 0; i < 300; i++) {
      const b = draftOk("being", { name: `Being ${i} ward-${i % 17}`, goal: `goal ${i}` });
      beings.push(b.id);
    }
    for (let i = 1; i < 300; i++) {
      const l = vault.archive.link(beings[i - 1]!, beings[i]!, i % 2 === 0 ? "serves" : "threatens", "owner");
      expect(l.ok).toBe(true);
    }
    const p = (times: number[], q: number) => {
      const s = [...times].sort((a, b) => a - b);
      return s[Math.min(s.length - 1, Math.floor(s.length * q))]!;
    };

    const getT: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const t0 = performance.now();
      const r = vault.archive.get(beings[i % beings.length]!);
      getT.push(performance.now() - t0);
      expect(r.ok).toBe(true);
    }
    expect(p(getT, 0.99), `get p99 ${p(getT, 0.99).toFixed(3)}ms`).toBeLessThanOrEqual(3);

    const q = EntryQuery.kind("being").whereStatus("provisional").linkedFrom(beings[0]!, "threatens").limit(20);
    const queryT: number[] = [];
    for (let i = 0; i < 300; i++) {
      const t0 = performance.now();
      const r = vault.archive.query(q);
      queryT.push(performance.now() - t0);
      expect(r.ok).toBe(true);
    }
    expect(p(queryT, 0.99), `query p99 ${p(queryT, 0.99).toFixed(3)}ms`).toBeLessThanOrEqual(3);

    const linksT: number[] = [];
    for (let i = 0; i < 300; i++) {
      const t0 = performance.now();
      const r = vault.archive.links(beings[i % beings.length]!);
      linksT.push(performance.now() - t0);
      expect(r.ok).toBe(true);
    }
    expect(p(linksT, 0.99), `links p99 ${p(linksT, 0.99).toFixed(3)}ms`).toBeLessThanOrEqual(3);

    const searchT: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t0 = performance.now();
      const r = vault.archive.search(`ward-${i % 17}`);
      searchT.push(performance.now() - t0);
      expect(r.ok && r.value.length > 0).toBe(true);
    }
    expect(p(searchT, 0.95), `search p95 ${p(searchT, 0.95).toFixed(3)}ms`).toBeLessThanOrEqual(100);
  });
});
