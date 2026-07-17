// SPEC-001 §9 export/import — the ownership covenant. §16.3 round-trip identity
// (fold the reimported log ⇒ byte-identical states; entries/links/versions equal),
// §9.1 layout conformance, §9.2 human-readability + edit-tolerance, §9.3 staged
// plan / per-item report, §9.4 policy surface, and a §15-scaled perf sanity
// (the full 10k-entry / 50k-event harness is step 7).
import { describe, it, expect, afterEach } from "vitest";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  Studio, Vault, nodeSqliteBinding, CORE_FOLDS, stableJson,
  type EntryKind, type ImportPlan,
} from "../src/index.js";

const dirs: string[] = [];
const studios: Studio[] = [];
const vaults: Vault[] = [];
afterEach(() => {
  for (const v of vaults.splice(0)) { try { v.close(); } catch { /* closed in test */ } }
  for (const s of studios.splice(0)) { try { s.close(); } catch { /* closed in test */ } }
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

async function freshStudio(): Promise<Studio> {
  const dir = mkdtempSync(join(tmpdir(), "aa-export-"));
  dirs.push(dir);
  const studio = await Studio.open({ platformBinding: nodeSqliteBinding(dir) });
  studios.push(studio);
  return studio;
}

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "aa-export-dest-"));
  dirs.push(dir);
  return dir;
}

async function openVault(studio: Studio, worldId: string): Promise<Vault> {
  const v = await studio.openWorld(worldId);
  if (!v.ok) throw new Error(`openWorld failed: ${v.error.code} ${v.error.message}`);
  vaults.push(v.value);
  return v.value;
}

function draftOk(vault: Vault, kind: EntryKind, body: unknown) {
  const r = vault.archive.draft(kind, body, { provenance: "ink", actor: "owner" });
  if (!r.ok) throw new Error(`draft failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

function appendOk(vault: Vault, type: string, payload: unknown, ctx: { actor: string; sessionId?: string; sceneId?: string }) {
  const r = vault.ash.append(type as never, payload as never, ctx);
  if (!r.ok) throw new Error(`append ${type} failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

/** A world exercising every exported surface: kinds, versions, aliases, links
 *  (active + ended), a locked truth, disclosures, a bound session with chronicle
 *  entry, struck + inverse events, snapshots. */
async function seedRichWorld(studio: Studio): Promise<{
  vault: Vault; worldId: string;
  ids: { duke: string; bridge: string; truth: string; clock: string };
}> {
  const w = await studio.shelf.create("The Amber Marches");
  if (!w.ok) throw new Error("world create failed");
  const vault = await openVault(studio, w.value.id);

  const duke = draftOk(vault, "being", {
    name: "Duke Alric", beingType: "person",
    goal: "Hold the amber trade against the river lords.",
    method: "Debt, marriage, and a quiet blade.",
    enforcement: "The Ninefold Toll levied at every bridge.",
  });
  const bridge = draftOk(vault, "place", { name: "Tollbridge", chokepoint: true });
  const truth = draftOk(vault, "truth", {
    name: "The Duke's Letter", lever: "The letter naming the heir was forged.",
    vectors: ["the notary's widow", "the wax seal"],
  });
  const clock = draftOk(vault, "clock", {
    name: "The River Rises", steps: ["murmurs", "floods", "levy breaks", "the delta drowns"],
  });
  draftOk(vault, "thing", { name: "Amber Ledger" });

  // Links: active pair, an unlocks lever, and one ENDED link (the temporal graph §2.3).
  const l1 = vault.archive.link(duke.id, bridge.id, "threatens", "owner");
  if (!l1.ok) throw new Error("link failed");
  const l2 = vault.archive.link(truth.id, bridge.id, "unlocks", "owner");
  if (!l2.ok) throw new Error("link failed");
  const l3 = vault.archive.link(bridge.id, duke.id, "serves", "owner");
  if (!l3.ok) throw new Error("link failed");
  const ended = vault.archive.endLink(l3.value.id, "owner");
  if (!ended.ok) throw new Error("endLink failed");

  // Version 2 with a rename — §7.3 alias protocol.
  const revised = vault.archive.reviseDraft(duke.id, {
    name: "Duke Alric the Pale", beingType: "person",
    goal: "Hold the amber trade against the river lords.",
    method: "Debt, marriage, and a quiet blade.",
    enforcement: "The Ninefold Toll levied at every bridge.",
  }, "owner");
  if (!revised.ok) throw new Error("revise failed");

  const locked = vault.charter.lock(truth.id, "owner", "sworn before the table");
  if (!locked.ok) throw new Error(`lock failed: ${locked.error.code}`);
  const disclosed = vault.archive.disclose(truth.id, "player-a");
  if (!disclosed.ok) throw new Error("disclose failed");

  // A session with capture, correction, undo, stagecraft — then a Binding.
  const opened = vault.session.open({ actor: "owner" });
  if (!opened.ok) throw new Error("session open failed");
  const sessionId = opened.value.sessionId!;
  appendOk(vault, "scene.framed", { frame: "The toll queue at dawn" }, { actor: "owner", sessionId });
  appendOk(vault, "inscription.added", { text: "The widow recognizes the seal." }, { actor: "owner", sessionId });
  const stray = appendOk(vault, "inscription.added", { text: "wrong table note" }, { actor: "owner", sessionId });
  const struck = vault.ash.strike(stray.eventId, "owner", "wrong table");
  if (!struck.ok) throw new Error("strike failed");
  const dmg = appendOk(vault, "damage.taken", { beingId: duke.id, amount: 4 }, { actor: "owner", sessionId });
  const undone = vault.ash.undo(dmg.eventId, "owner");
  if (!undone.ok) throw new Error("undo failed");
  appendOk(vault, "clock.ticked", { entryId: clock.id, step: 1 }, { actor: "owner", sessionId });
  appendOk(vault, "alias.noted", { entryId: bridge.id, alias: "the Ninefold" }, { actor: "owner", sessionId });
  appendOk(vault, "truth.revealed", { entryId: truth.id, toActors: ["player-a"] }, { actor: "owner", sessionId });

  const plan = vault.binding.plan(sessionId);
  if (!plan.ok) throw new Error("plan failed");
  const receipt = vault.binding.commit(plan.value, "owner", "full");
  if (!receipt.ok) throw new Error(`commit failed: ${receipt.error.code} ${receipt.error.message}`);
  const closedS = vault.session.close(sessionId, "owner"); // snapshots at session.closed (§3.3)
  if (!closedS.ok) throw new Error("session close failed");

  return { vault, worldId: w.value.id, ids: { duke: duke.id, bridge: bridge.id, truth: truth.id, clock: clock.id } };
}

function walk(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    const rel = base.length > 0 ? `${base}/${name}` : name;
    if (statSync(abs).isDirectory()) out.push(...walk(abs, rel));
    else out.push(rel);
  }
  return out;
}

const sha256 = (b: Buffer): string => createHash("sha256").update(b).digest("hex");

function exportOk(vault: Vault, dest: string) {
  const r = vault.export(dest);
  if (!r.ok) throw new Error(`export failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

/** Replay the exported log through the six core folds — I-8 determinism makes
 *  byte-identical states the round-trip identity witness (§16.3). */
function foldStates(eventLines: string[]): string {
  const events = eventLines.map((l) => JSON.parse(l) as {
    eventId: string; sessionId: string | null; sceneId: string | null; type: string;
    payload: unknown; actor: string; deviceSeq: number; lamport: number; inverseOf: string | null; struck: boolean;
  });
  const states: Record<string, unknown> = {};
  for (const def of CORE_FOLDS) {
    let s = def.init();
    for (const e of events) {
      if (e.struck || e.type === "state.snapshot") continue; // §3.4/§3.3, as the framework does
      s = def.reduce(s, { eventId: e.eventId, sessionId: e.sessionId, sceneId: e.sceneId,
        type: e.type as never, payload: e.payload, actor: e.actor, deviceSeq: e.deviceSeq,
        lamport: e.lamport, inverseOf: e.inverseOf });
    }
    states[def.key] = s;
  }
  return stableJson(states);
}

const eventLines = (root: string): string[] => {
  const text = readFileSync(join(root, "ash/events.jsonl"), "utf8");
  return text.length === 0 ? [] : text.replace(/\n$/, "").split("\n");
};

describe("export layout (§9.1)", () => {
  it("writes the spec tree exactly: WORLD.md, entries/<kind>/<slug>-<id>.md, history/, chronicle/, ash/, attachments/, prompts/, MANIFEST.json", async () => {
    const studio = await freshStudio();
    const { vault, worldId, ids } = await seedRichWorld(studio);
    const dest = tempDir();
    const res = exportOk(vault, dest);

    expect(res.root.endsWith(`the-amber-marches-${worldId}`)).toBe(true);
    for (const ns of ["entries", "history", "chronicle", "ash", "attachments", "prompts"]) {
      expect(statSync(join(res.root, ns)).isDirectory()).toBe(true);
    }
    expect(existsSync(join(res.root, "WORLD.md"))).toBe(true);
    expect(existsSync(join(res.root, "MANIFEST.json"))).toBe(true);
    expect(existsSync(join(res.root, "ash/events.jsonl"))).toBe(true);
    expect(existsSync(join(res.root, `entries/being/duke-alric-the-pale-${ids.duke}.md`))).toBe(true);
    expect(existsSync(join(res.root, `history/${ids.duke}.jsonl`))).toBe(true);
    // chronicle/session-<n>-<slug>.md — the bound chapter from the Binding's Session entry
    expect(existsSync(join(res.root, "chronicle/session-1-session-1.md"))).toBe(true);
    // every file uses LF only (§9.1 UTF-8, LF)
    for (const rel of walk(res.root)) {
      expect(readFileSync(join(res.root, rel)).includes("\r"), `${rel} has CRLF`).toBe(false);
    }
  });

  it("MANIFEST.json carries every file + sha256 + counts + vocabVersion + ddlVersion", async () => {
    const studio = await freshStudio();
    const { vault } = await seedRichWorld(studio);
    const res = exportOk(vault, tempDir());
    const manifest = JSON.parse(readFileSync(join(res.root, "MANIFEST.json"), "utf8")) as {
      counts: Record<string, number>; ddlVersion: number; vocabVersion: number;
      worldId: string; files: Record<string, string>;
    };
    expect(manifest.ddlVersion).toBe(1);
    expect(manifest.vocabVersion).toBe(1);
    expect(manifest.counts.entries).toBe(6); // 5 drafts + the chronicle Session entry
    expect(manifest.counts.versions).toBeGreaterThanOrEqual(8);
    expect(manifest.counts.links).toBe(3);
    expect(manifest.counts.disclosures).toBeGreaterThanOrEqual(1);
    expect(manifest.counts.snapshots).toBeGreaterThan(0);
    const all = walk(res.root).filter((f) => f !== "MANIFEST.json");
    expect(Object.keys(manifest.files).sort()).toEqual(all);
    for (const [rel, hash] of Object.entries(manifest.files)) {
      expect(sha256(readFileSync(join(res.root, rel))), rel).toBe(hash);
    }
  });
});

describe("human-readability (§9.2 — legible with a text editor, no tooling)", () => {
  it("entry markdown: frontmatter with EntryHead + head-version fields + links out, prose body fields as markdown sections", async () => {
    const studio = await freshStudio();
    const { vault, ids } = await seedRichWorld(studio);
    const res = exportOk(vault, tempDir());
    const md = readFileSync(join(res.root, `entries/being/duke-alric-the-pale-${ids.duke}.md`), "utf8");
    expect(md.startsWith("---\n")).toBe(true);
    expect(md).toContain(`id: ${ids.duke}`);
    expect(md).toContain('name: "Duke Alric the Pale"');
    expect(md).toContain('aliases: ["Duke Alric"]'); // §7.3 — renames never replace
    expect(md).toContain("canonStatus: provisional");
    expect(md).toContain("provenance: ink");
    expect(md).toContain('"citations":');
    expect(md).toContain(`"to":"${ids.bridge}"`); // links out, incl. the ended serves link
    expect(md).toContain('"type":"threatens"');
    expect(md).toContain('"endedByVersion"');
    expect(md).toContain("\n# Duke Alric the Pale\n");
    expect(md).toContain("\n## goal\n\nHold the amber trade against the river lords.\n");
    expect(md).toContain("\n## method\n");
  });

  it("WORLD.md states the covenant; ash/events.jsonl is line-JSON with struck events marked", async () => {
    const studio = await freshStudio();
    const { vault } = await seedRichWorld(studio);
    const res = exportOk(vault, tempDir());
    const world = readFileSync(join(res.root, "WORLD.md"), "utf8");
    expect(world).toContain("# The Amber Marches");
    expect(world).toContain("human-readable");
    expect(world).toContain("losslessly re-importable");
    expect(world).toContain("MANIFEST.json");

    const lines = eventLines(res.root);
    expect(lines.length).toBeGreaterThan(10);
    const parsed = lines.map((l) => JSON.parse(l) as { type: string; struck: boolean; lamport: number });
    const struckLines = parsed.filter((e) => e.struck);
    expect(struckLines.length).toBe(1); // included, marked (§9.1)
    expect(parsed.some((e) => e.type === "state.snapshot")).toBe(true);
    for (let i = 1; i < parsed.length; i++) expect(parsed[i]!.lamport).toBeGreaterThanOrEqual(parsed[i - 1]!.lamport);
  });
});

describe("round-trip identity (§9.2 lossless / §16.3 property)", () => {
  it("export → import → export: files byte-identical (the sole delta is the §9.3 import.completed marker in the ash), folds byte-identical, entries/links/versions equal", async () => {
    const studioA = await freshStudio();
    const { vault: vaultA, worldId } = await seedRichWorld(studioA);
    const destA = tempDir();
    const resA = exportOk(vaultA, destA);

    const studioB = await freshStudio();
    const planR = await studioB.import({ kind: "archive-folder", path: resA.root });
    expect(planR.ok).toBe(true);
    if (!planR.ok) return;
    const plan = planR.value;
    expect(plan.items.every((i) => i.valid)).toBe(true);
    expect(plan.items.some((i) => i.handEdited)).toBe(false);
    expect(plan.world.id).toBe(worldId);
    expect(plan.world.name).toBe("The Amber Marches");

    const receipt = await studioB.importCommit(plan);
    expect(receipt.ok).toBe(true);
    if (!receipt.ok) return;
    expect(receipt.value.counts.entries).toBe(6);

    const vaultB = await openVault(studioB, worldId);
    const destB = tempDir();
    const resB = exportOk(vaultB, destB);

    // Same tree, same bytes — ash/events.jsonl differs by exactly the trailing
    // import.completed marker (§9.3 appends it AFTER the imported log), and
    // MANIFEST.json reflects that one event.
    const filesA = walk(resA.root);
    const filesB = walk(resB.root);
    expect(filesB).toEqual(filesA);
    for (const rel of filesA) {
      if (rel === "ash/events.jsonl" || rel === "MANIFEST.json") continue;
      expect(readFileSync(join(resB.root, rel), "utf8"), rel).toBe(readFileSync(join(resA.root, rel), "utf8"));
    }
    const linesA = eventLines(resA.root);
    const linesB = eventLines(resB.root);
    expect(linesB.length).toBe(linesA.length + 1);
    expect(linesB.slice(0, linesA.length)).toEqual(linesA);
    const marker = JSON.parse(linesB[linesB.length - 1]!) as { type: string; payload: { source: string } };
    expect(marker.type).toBe("import.completed");
    expect(marker.payload.source).toBe("archive-folder");

    const manA = JSON.parse(readFileSync(join(resA.root, "MANIFEST.json"), "utf8")) as { counts: Record<string, number>; files: Record<string, string> };
    const manB = JSON.parse(readFileSync(join(resB.root, "MANIFEST.json"), "utf8")) as { counts: Record<string, number>; files: Record<string, string> };
    expect(manB.counts).toEqual({ ...manA.counts, events: manA.counts.events! + 1 });
    for (const [rel, hash] of Object.entries(manA.files)) {
      if (rel !== "ash/events.jsonl") expect(manB.files[rel], rel).toBe(hash);
    }

    // §16.3: fold the reimported log ⇒ byte-identical states.
    expect(foldStates(linesB.slice(0, linesA.length))).toBe(foldStates(linesA));

    // entries / versions / links / disclosures equal, row for row.
    const dump = (v: Vault): unknown[] => [
      v.handle().all(`SELECT id,kind,name,aliases,canonStatus,provenance,headVersion,createdAt,boundAt,archivedAt FROM entries ORDER BY id`),
      v.handle().all(`SELECT versionId,entryId,ordinal,body,bodySchemaVersion,canonStatus,provenance,boundBy,citations,supersedes,note,createdAt FROM entry_versions ORDER BY versionId`),
      v.handle().all(`SELECT id,fromEntry,toEntry,type,sinceVersion,endedByVersion,note,createdAt FROM links ORDER BY id`),
      v.handle().all(`SELECT id,entryId,atVersion,knownBy,via,createdAt FROM disclosures ORDER BY id`),
    ];
    expect(stableJson(dump(vaultB))).toBe(stableJson(dump(vaultA)));

    // The reconstructed world is live: search and folds work over the imported state.
    const hit = vaultB.archive.search("amber");
    expect(hit.ok && hit.value.length > 0).toBe(true);
  });
});

describe("edit-tolerant import (§9.2)", () => {
  it("hand-edited prose re-imports as a new PROVISIONAL version (ink, owner, 'edited outside the Studio') — even on a LOCKED entry", async () => {
    const studioA = await freshStudio();
    const { vault: vaultA, ids } = await seedRichWorld(studioA);
    const resA = exportOk(vaultA, tempDir());

    const edited = join(tempDir(), "edited");
    cpSync(resA.root, edited, { recursive: true });
    const beingFile = join(edited, `entries/being/duke-alric-the-pale-${ids.duke}.md`);
    writeFileSync(beingFile, readFileSync(beingFile, "utf8")
      .replace("Debt, marriage, and a quiet blade.", "Open war on the river lords."));
    const truthFiles = walk(join(edited, "entries/truth"));
    const truthFile = join(edited, "entries/truth", truthFiles[0]!);
    writeFileSync(truthFile, readFileSync(truthFile, "utf8")
      .replace("The letter naming the heir was forged.", "The letter was genuine after all."));

    const studioC = await freshStudio();
    const planR = await studioC.import({ kind: "archive-folder", path: edited });
    expect(planR.ok).toBe(true);
    if (!planR.ok) return;
    const handEdited = planR.value.items.filter((i) => i.handEdited).map((i) => i.file).sort();
    expect(handEdited.length).toBe(2);
    const receipt = await studioC.importCommit(planR.value);
    expect(receipt.ok).toBe(true);
    if (!receipt.ok) return;

    const vaultC = await openVault(studioC, planR.value.world.id);
    const duke = vaultC.archive.get(ids.duke);
    expect(duke.ok).toBe(true);
    if (!duke.ok) return;
    expect((duke.value.body as { method: string }).method).toBe("Open war on the river lords.");
    expect(duke.value.canonStatus).toBe("provisional");
    expect(duke.value.provenance).toBe("ink");
    const history = vaultC.archive.history(ids.duke);
    expect(history.ok).toBe(true);
    if (!history.ok) return;
    const head = history.value[history.value.length - 1]!;
    expect(head.note).toBe("edited outside the Studio");
    expect(head.boundBy).toBe("owner");
    expect(head.provenance).toBe("ink");

    // The truth was LOCKED; the external edit never silently becomes locked canon (I-1).
    const truth = vaultC.archive.get(ids.truth);
    expect(truth.ok && truth.value.canonStatus === "provisional").toBe(true);
  });
});

describe("import staging and failure behavior (§9.3, E-15xx)", () => {
  it("tampered machine files fail per item with {file, field, error, suggestion}; valid items still import (E-1501 PartialImport)", async () => {
    const studioA = await freshStudio();
    const { vault: vaultA, ids } = await seedRichWorld(studioA);
    const resA = exportOk(vaultA, tempDir());

    const tampered = join(tempDir(), "tampered");
    cpSync(resA.root, tampered, { recursive: true });
    writeFileSync(join(tampered, `history/${ids.duke}.jsonl`), "not json at all\n");

    const studioD = await freshStudio();
    const planR = await studioD.import({ kind: "archive-folder", path: tampered });
    expect(planR.ok).toBe(true);
    if (!planR.ok) return;
    const bad = planR.value.items.find((i) => !i.valid);
    expect(bad).toBeDefined();
    expect(bad!.issues[0]).toMatchObject({
      file: expect.stringContaining("") as string,
      field: expect.any(String) as string,
      error: expect.any(String) as string,
      suggestion: expect.any(String) as string,
    });

    const receipt = await studioD.importCommit(planR.value);
    expect(receipt.ok).toBe(false);
    if (receipt.ok) return;
    expect(receipt.error.code).toBe("E-1501");

    const vaultD = await openVault(studioD, planR.value.world.id);
    expect(vaultD.archive.get(ids.duke).ok).toBe(false);  // the invalid item did not land
    expect(vaultD.archive.get(ids.bridge).ok).toBe(true); // valid items imported
  });

  it("no MANIFEST.json → E-1502; v0 source → deferred; re-import over a live world → refused", async () => {
    const studioA = await freshStudio();
    const { vault: vaultA } = await seedRichWorld(studioA);
    const resA = exportOk(vaultA, tempDir());

    const empty = tempDir();
    const noManifest = await studioA.import({ kind: "archive-folder", path: empty });
    expect(!noManifest.ok && noManifest.error.code === "E-1502").toBe(true);

    const v0 = await studioA.import({ kind: "v0", data: {} });
    expect(!v0.ok && v0.error.code === "E-1001").toBe(true);

    const collide = await studioA.import({ kind: "archive-folder", path: resA.root });
    expect(!collide.ok && collide.error.code === "E-1001").toBe(true);
  });
});

describe("scheduled export surface (§9.4)", () => {
  it("vault.export appends vault.exported; the backup policy defaults to weekly / keep 8 and round-trips", async () => {
    const studio = await freshStudio();
    const { vault } = await seedRichWorld(studio);
    exportOk(vault, tempDir());
    const win = vault.ash.window({ world: true }, { types: ["vault.exported"] });
    expect(win.ok).toBe(true);
    if (!win.ok) return;
    expect(win.value.length).toBe(1);
    expect((win.value[0]!.payload as { destinationHash: string }).destinationHash).toMatch(/^[0-9a-f]{64}$/);

    expect(studio.backup.policy()).toEqual({ intervalDays: 7, keep: 8, dest: null });
    const set = studio.backup.schedule({ intervalDays: 1, keep: 2, dest: "D:/backups" });
    expect(set.ok).toBe(true);
    expect(studio.backup.policy()).toEqual({ intervalDays: 1, keep: 2, dest: "D:/backups" });
    const bad = studio.backup.schedule({ intervalDays: 0, keep: 8, dest: null });
    expect(!bad.ok && bad.error.code === "E-1001").toBe(true);
  });
});

describe("perf sanity (§15 — full export ≤ 30s law at 10k/50k; scaled fixture here, harness is step 7)", () => {
  it("exports and re-imports a 300-entry / ~2000-event world well inside the law", async () => {
    const studio = await freshStudio();
    const w = await studio.shelf.create("Perfworld");
    if (!w.ok) throw new Error("create failed");
    const vault = await openVault(studio, w.value.id);
    const beings: string[] = [];
    for (let i = 0; i < 300; i++) {
      beings.push(draftOk(vault, "being", { name: `Being ${i}`, goal: `Goal of being ${i}.` }).id);
    }
    for (let i = 0; i < 100; i++) {
      const r = vault.archive.link(beings[i]!, beings[i + 1]!, "threatens", "owner");
      if (!r.ok) throw new Error("link failed");
    }
    const opened = vault.session.open({ actor: "owner" });
    if (!opened.ok) throw new Error("open failed");
    const sessionId = opened.value.sessionId!;
    for (let i = 0; i < 2000; i++) {
      appendOk(vault, "damage.taken", { beingId: beings[i % 300]!, amount: 1 }, { actor: "owner", sessionId });
    }

    const t0 = performance.now();
    const res = exportOk(vault, tempDir());
    const exportMs = performance.now() - t0;

    const studioB = await freshStudio();
    const t1 = performance.now();
    const plan = await studioB.import({ kind: "archive-folder", path: res.root });
    if (!plan.ok) throw new Error(`plan failed: ${plan.error.message}`);
    const receipt = await studioB.importCommit(plan.value);
    if (!receipt.ok) throw new Error(`commit failed: ${receipt.error.message}`);
    const importMs = performance.now() - t1;

    // eslint-disable-next-line no-console
    console.info(`§15 scaled export/import: export ${exportMs.toFixed(0)}ms, import ${importMs.toFixed(0)}ms (law: 30s @ 10k entries + 50k events)`);
    expect(exportMs).toBeLessThan(15_000);
    expect(importMs).toBeLessThan(15_000);
    expect(receipt.value.counts.entries).toBe(300);
    expect(receipt.value.counts.events).toBeGreaterThanOrEqual(2000);
  }, 120_000);
});
