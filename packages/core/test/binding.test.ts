// SPEC-001 §6 Binding — §16.3 idempotency by planHash, §16.8 no partial Bindings,
// §15 binding.plan ≤ 1.5s @ 400 events, E-13xx paths, §2/§7.1 status machine.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Studio, Vault, nodeSqliteBinding, ulid,
  type BindingPlan, type PlanItem, type DbHandle, type PlatformBinding, type EntryKind,
} from "../src/index.js";

let dir: string;
let studio: Studio;
let vault: Vault;
const chaos: { failAfter: number | null } = { failAfter: null };

/** §16.8 chaos harness — a platform binding whose writes can be killed mid-commit. */
function chaosBinding(dataDir: string): PlatformBinding {
  const base = nodeSqliteBinding(dataDir);
  return {
    ...base,
    open(fileName: string): DbHandle {
      const h = base.open(fileName);
      return {
        exec: (sql) => h.exec(sql),
        get: (sql, ...p) => h.get(sql, ...p),
        all: (sql, ...p) => h.all(sql, ...p),
        close: () => h.close(),
        run: (sql, ...p) => {
          if (chaos.failAfter !== null) {
            if (chaos.failAfter <= 0) throw new Error("chaos: process killed mid-commit");
            chaos.failAfter -= 1;
          }
          h.run(sql, ...p);
        },
      };
    },
  };
}

beforeEach(async () => {
  chaos.failAfter = null;
  dir = mkdtempSync(join(tmpdir(), "aa-binding-"));
  studio = await Studio.open({ platformBinding: chaosBinding(dir) });
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

function openSession(): string {
  const r = vault.session.open({ actor: "owner" });
  if (!r.ok) throw new Error("session open failed");
  return r.value.sessionId!;
}

function appendOk(type: string, payload: unknown, ctx: { actor: string; sessionId?: string; sceneId?: string }) {
  const r = vault.ash.append(type as never, payload as never, ctx);
  if (!r.ok) throw new Error(`append ${type} failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

function planOk(sessionId: string): BindingPlan {
  const r = vault.binding.plan(sessionId);
  if (!r.ok) throw new Error(`plan failed: ${r.error.code} ${r.error.message}`);
  return r.value;
}

/** A ceremony edit (§6 phase 2 — the plan is a value). */
function pushItem(plan: BindingPlan, item: Omit<PlanItem, "disposition" | "ratifier" | "challenged" | "leverTestFailed" | "conflicts"> & Partial<PlanItem>): PlanItem {
  const full: PlanItem = {
    disposition: "bind", ratifier: "owner", challenged: false, leverTestFailed: false, conflicts: [],
    ...item,
  };
  plan.items.push(full);
  return full;
}

function count(sql: string, ...params: unknown[]): number {
  return vault.handle().get<{ c: number }>(sql, ...params)?.c ?? 0;
}

describe("binding.plan (§6 phase 1 — pure, deterministic)", () => {
  it("returns E-1101 for an unknown session", () => {
    const r = vault.binding.plan(ulid());
    expect(!r.ok && r.error.code === "E-1101").toBe(true);
  });

  it("drafts upserts from the session's ash with citations, grouped by scene", () => {
    const proposalId = ulid();
    const secret = draftOk("truth", { name: "The tithe is stolen" });
    const doom = draftOk("clock", { name: "Doom of the March", steps: ["a", "b", "c", "d"] });
    const sessionId = openSession();
    const sceneA = ulid();
    const pp = appendOk("pencil.proposed",
      { proposalId, voice: "archivist", targetKind: "thing", draft: { name: "The Forged Letter" } },
      { actor: "owner", sessionId, sceneId: sceneA });
    const reveal = appendOk("truth.revealed", { entryId: secret.id, toActors: ["playerA"] }, { actor: "owner", sessionId, sceneId: sceneA });
    appendOk("clock.ticked", { entryId: doom.id, step: 1 }, { actor: "owner", sessionId });
    const tick2 = appendOk("clock.ticked", { entryId: doom.id, step: 2 }, { actor: "owner", sessionId });
    const alias = appendOk("alias.noted", { entryId: secret.id, alias: "the tithe business" }, { actor: "owner", sessionId });
    // struck material never drafts (pre-judged "blow away", §3.4)
    const struck = appendOk("inscription.added", { text: "mistake" }, { actor: "owner", sessionId });
    expect(vault.ash.strike(struck.eventId, "owner").ok).toBe(true);

    const plan = planOk(sessionId);
    expect(plan.ratificationProtocol).toBe("player-ownership"); // default (§6)
    const ops = plan.items.map((i) => i.upsert.op);
    expect(ops).toEqual(["newEntry", "disclosure", "clockAdvance", "alias"]);
    const [newEntry, disclosure, clock, aliasItem] = plan.items;
    expect(newEntry!.upsert).toMatchObject({ op: "newEntry", kind: "thing", body: { name: "The Forged Letter" } });
    expect(newEntry!.citations).toEqual([pp.eventId]);
    expect(disclosure!.upsert).toMatchObject({ op: "disclosure", entryId: secret.id, knownBy: "playerA", via: reveal.eventId });
    expect(clock!.upsert).toMatchObject({ op: "clockAdvance", entryId: doom.id, step: 2 }); // final confirmed step
    expect(clock!.citations.length).toBe(2);
    expect(aliasItem!.upsert).toMatchObject({ op: "alias", alias: "the tithe business" });
    // scene grouping: sceneA holds its two events; struck id is grouped but marked
    const sceneGroup = plan.scenes.find((s) => s.sceneId === sceneA);
    expect(sceneGroup?.eventIds).toEqual([pp.eventId, reveal.eventId]);
    const root = plan.scenes.find((s) => s.sceneId === null);
    expect(root?.struckEventIds).toContain(struck.eventId);
    expect(root?.eventIds).not.toContain(struck.eventId);
    // clock event only produced one item, not two (tick2 folded into citations)
    expect(plan.items.filter((i) => i.upsert.op === "clockAdvance").length).toBe(1);
    expect(clock!.citations).toContain(tick2.eventId);
  });

  it("is deterministic: same ash ⇒ identical plan and planHash; new ash ⇒ new hash", () => {
    const sessionId = openSession();
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "A ring" } },
      { actor: "owner", sessionId });
    const p1 = planOk(sessionId);
    const p2 = planOk(sessionId);
    expect(p2.planHash).toBe(p1.planHash);
    expect(JSON.stringify(p2.items)).toBe(JSON.stringify(p1.items));
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "A second ring" } },
      { actor: "owner", sessionId });
    const p3 = planOk(sessionId); // "new material since you began" (§6)
    expect(p3.planHash).not.toBe(p1.planHash);
  });

  it("dismissed proposals and pencil-drafted entries route correctly", () => {
    const sessionId = openSession();
    const keepId = ulid();
    const dropId = ulid();
    const kept = appendOk("pencil.proposed",
      { proposalId: keepId, voice: "archivist", targetKind: "thing", draft: { name: "Kept" } },
      { actor: "owner", sessionId });
    appendOk("pencil.proposed",
      { proposalId: dropId, voice: "archivist", targetKind: "thing", draft: { name: "Dropped" } },
      { actor: "owner", sessionId });
    appendOk("pencil.dismissed", { proposalId: dropId }, { actor: "owner", sessionId });
    // the kept proposal was drafted at the table → plan proposes binding that entry
    const drafted = vault.archive.draft("thing", { name: "Kept" },
      { provenance: "pencil", actor: "dramaturg", proposalId: keepId });
    expect(drafted.ok).toBe(true);
    if (!drafted.ok) return;
    const plan = planOk(sessionId);
    expect(plan.items.length).toBe(1);
    expect(plan.items[0]!.upsert).toMatchObject({ op: "newVersion", entryId: drafted.value.id });
    expect(plan.items[0]!.citations).toEqual([kept.eventId]);
  });

  it("fires the Lever Test at plan (v1.2): lever-less truths are held; an active unlocks link passes", () => {
    const gate = draftOk("place", { name: "The Sluice Gate" });
    const sessionId = openSession();
    const pArmed = ulid(); const pBare = ulid(); const pNew = ulid();
    appendOk("pencil.proposed", { proposalId: pArmed, voice: "archivist", targetKind: "truth",
      draft: { name: "The heir lives", lever: "name the heir" } }, { actor: "owner", sessionId });
    appendOk("pencil.proposed", { proposalId: pBare, voice: "archivist", targetKind: "truth",
      draft: { name: "The well is poisoned" } }, { actor: "owner", sessionId });
    appendOk("pencil.proposed", { proposalId: pNew, voice: "archivist", targetKind: "truth",
      draft: { name: "Brand new truth" } }, { actor: "owner", sessionId });
    // the first two proposals were drafted at the table (the sanctioned pencil path, §8)
    const armedR = vault.archive.draft("truth", { name: "The heir lives", lever: "name the heir" },
      { provenance: "pencil", actor: "dramaturg", proposalId: pArmed });
    const bareR = vault.archive.draft("truth", { name: "The well is poisoned" },
      { provenance: "pencil", actor: "dramaturg", proposalId: pBare });
    if (!armedR.ok || !bareR.ok) throw new Error("pencil drafts failed");
    const armed = armedR.value; const bare = bareR.value;
    expect(vault.archive.link(armed.id, gate.id, "unlocks", "owner").ok).toBe(true); // the lever's consequence

    const plan = planOk(sessionId);
    const armedItem = plan.items.find((i) => i.upsert.op === "newVersion" && i.upsert.entryId === armed.id)!;
    const bareItem = plan.items.find((i) => i.upsert.op === "newVersion" && i.upsert.entryId === bare.id)!;
    const newItem = plan.items.find((i) => i.upsert.op === "newEntry")!;
    expect(armedItem.leverTestFailed).toBe(false);
    expect(armedItem.disposition).toBe("bind");
    expect(bareItem.leverTestFailed).toBe(true);
    expect(bareItem.disposition).toBe("holdAsAsh");
    expect(newItem.leverTestFailed).toBe(true); // a brand-new truth has no unlocks yet

    // forcing a held lever-less truth to bind is refused at commit with E-1003
    bareItem.disposition = "bind";
    const r = vault.binding.commit(plan, "owner", "full");
    expect(!r.ok && r.error.code === "E-1003").toBe(true);
  });

  it("marks the §7.4 contradictions: name collision, locked-invariant, link exclusion", () => {
    const existing = draftOk("thing", { name: "The Signet Ring" });
    const lockedTruth = draftOk("truth", { name: "The letter was forged", lever: "the wax seal" });
    vault.handle().run(`UPDATE entries SET canonStatus='locked' WHERE id=?`, lockedTruth.id);
    vault.handle().run(`UPDATE entry_versions SET canonStatus='locked' WHERE versionId=?`, lockedTruth.headVersion);
    const a = draftOk("being", { name: "Duke Vane" });
    const b = draftOk("being", { name: "Lady Merav" });
    expect(vault.archive.link(a.id, b.id, "serves", "owner").ok).toBe(true);

    const sessionId = openSession();
    const collide = appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "the sìgnet ring" } },
      { actor: "owner", sessionId });
    const plan = planOk(sessionId);
    // detector 1 — case/diacritic-insensitive collision against same-kind entries
    const collideItem = plan.items.find((i) => i.citations.includes(collide.eventId))!;
    expect(collideItem.conflicts.length).toBe(1);
    expect(plan.conflicts.find((c) => c.id === collideItem.conflicts[0])).toMatchObject({
      kind: "name-collision", entries: [existing.id],
    });
    // detector 2 — ceremony edit proposing a new lever on a LOCKED truth
    const inv = pushItem(plan, {
      key: "edit:inv",
      upsert: { op: "newVersion", entryId: lockedTruth.id, body: { name: "The letter was forged", lever: "a DIFFERENT lever" } },
      citations: [collide.eventId],
    });
    // detector 3 — ceremony edit adding threatens where serves is active
    const clash = pushItem(plan, {
      key: "edit:clash",
      upsert: { op: "link", from: a.id, to: b.id, type: "threatens" },
      citations: [collide.eventId],
    });
    // phase-2 edits re-run the §7.4 primitive over the plan value
    const cases = vault.binding.detect(plan.items);
    expect(cases.some((c) => c.kind === "name-collision" && c.entries.includes(existing.id))).toBe(true);
    const invCase = cases.find((c) => c.kind === "explicit-contradiction");
    expect(invCase).toMatchObject({ entries: [lockedTruth.id], versions: [lockedTruth.headVersion] });
    expect(inv.conflicts).toContain(invCase!.id);
    const clashCase = cases.find((c) => c.kind === "link-contradiction");
    expect(clashCase?.entries).toEqual([a.id, b.id]);
    expect(clash.conflicts).toContain(clashCase!.id);
  });
});

describe("binding.commit (§6 phase 3 — single transaction)", () => {
  it("binds ink versions with boundBy + citations, transitions status per §7.1, and seals", () => {
    const proposalId = ulid();
    const sessionId = openSession();
    const pp = appendOk("pencil.proposed",
      { proposalId, voice: "archivist", targetKind: "thing", draft: { name: "The Forged Letter" } },
      { actor: "owner", sessionId });
    const secret = draftOk("truth", { name: "The tithe is stolen" });
    appendOk("truth.revealed", { entryId: secret.id, toActors: ["playerA"] }, { actor: "owner", sessionId });
    const doom = draftOk("clock", { name: "Doom", steps: ["a", "b", "c", "d"] });
    appendOk("clock.ticked", { entryId: doom.id, step: 1 }, { actor: "owner", sessionId });
    expect(vault.session.close(sessionId, "owner").ok).toBe(true);

    const plan = planOk(sessionId);
    const newEntry = plan.items.find((i) => i.upsert.op === "newEntry")!;
    (newEntry.upsert as { statusIntent?: string }).statusIntent = "locked"; // binding with lock intent (§7.1)

    const r = vault.binding.commit(plan, "owner", "full");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const receipt = r.value;
    expect(receipt.mode).toBe("full");
    expect(receipt.planHash).toBe(plan.planHash);
    // the new entry: ink, locked, boundBy owner, citing the pencil.proposed event
    const hits = vault.archive.search("Forged Letter");
    expect(hits.ok && hits.value.length).toBe(1);
    const bound = vault.archive.get(hits.ok ? hits.value[0]!.entryId : "");
    expect(bound.ok).toBe(true);
    if (!bound.ok) return;
    expect(bound.value.provenance).toBe("ink");
    expect(bound.value.canonStatus).toBe("locked");
    expect(bound.value.boundAt).not.toBeNull();
    const hist = vault.archive.history(bound.value.id);
    expect(hist.ok && hist.value[0]?.boundBy).toBe("owner");
    expect(hist.ok && hist.value[0]?.citations).toEqual([pp.eventId]);
    // disclosure applied with via = the reveal event
    const disc = vault.handle().get<{ knownBy: string; via: string }>(
      `SELECT knownBy, via FROM disclosures WHERE entryId=?`, secret.id);
    expect(disc?.knownBy).toBe("playerA");
    // clock advance became an ink version carrying the confirmed step
    const clockNow = vault.archive.get(doom.id);
    expect(clockNow.ok && (clockNow.value.body as { currentStep: number }).currentStep).toBe(1);
    expect(clockNow.ok && clockNow.value.ordinal).toBe(2);
    // chronicle Session entry — locked ink canon, cited from the session's ash
    const chron = vault.archive.get(receipt.chronicleEntry);
    expect(chron.ok).toBe(true);
    if (!chron.ok) return;
    expect(chron.value.kind).toBe("session");
    expect(chron.value.canonStatus).toBe("locked");
    expect((chron.value.body as { sessionId: string }).sessionId).toBe(sessionId);
    // binding.ratified + binding.sealed emitted BY the transaction (§3.2)
    const ratified = vault.handle().get<{ payload: string }>(
      `SELECT payload FROM events WHERE eventId=?`, receipt.ratifiedEvent);
    expect(JSON.parse(ratified!.payload)).toMatchObject({ planHash: plan.planHash, boundVersions: receipt.boundVersions });
    const sealed = vault.handle().get<{ payload: string }>(
      `SELECT payload FROM events WHERE eventId=?`, receipt.sealedEvent);
    expect(JSON.parse(sealed!.payload)).toMatchObject({ mode: "full", chronicleEntry: receipt.chronicleEntry });
    expect(receipt.boundVersions).toContain(chron.value.versionId);
  });

  it("is idempotent by planHash: re-commit is a no-op returning the original receipt (E-1301)", () => {
    const sessionId = openSession();
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "A ring" } },
      { actor: "owner", sessionId });
    const plan = planOk(sessionId);
    const first = vault.binding.commit(plan, "owner", "full");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const versionsAfter = count(`SELECT COUNT(*) c FROM entry_versions`);
    const eventsAfter = count(`SELECT COUNT(*) c FROM events`);
    const again = vault.binding.commit(plan, "owner", "full");
    expect(!again.ok && again.error.code === "E-1301").toBe(true);
    if (again.ok) return;
    expect(again.error.data).toEqual(first.value); // the original receipt, reconstructed from the ash
    expect(count(`SELECT COUNT(*) c FROM entry_versions`)).toBe(versionsAfter); // no-op
    expect(count(`SELECT COUNT(*) c FROM events`)).toBe(eventsAfter);
    // the same session re-planned after new ash binds under a NEW hash
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "A different ring" } },
      { actor: "owner", sessionId });
    const plan2 = planOk(sessionId);
    expect(plan2.planHash).not.toBe(plan.planHash);
  });

  it("banked mode commits ONLY the chronicle Session entry + seal; upserts stay as ash", () => {
    const sessionId = openSession();
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "Held thing" } },
      { actor: "owner", sessionId });
    const entriesBefore = count(`SELECT COUNT(*) c FROM entries`);
    const plan = planOk(sessionId);
    const r = vault.binding.commit(plan, "owner", "banked");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.mode).toBe("banked");
    // exactly one new entry: the chronicle
    expect(count(`SELECT COUNT(*) c FROM entries`)).toBe(entriesBefore + 1);
    expect(count(`SELECT COUNT(*) c FROM entries WHERE kind='session'`)).toBe(1);
    expect(r.value.boundVersions.length).toBe(1); // the chronicle version only
    const sealed = vault.handle().get<{ payload: string }>(
      `SELECT payload FROM events WHERE eventId=?`, r.value.sealedEvent);
    expect(JSON.parse(sealed!.payload)).toMatchObject({ mode: "banked" });
    // the held material is still plannable later at the Desk
    const later = planOk(sessionId);
    expect(later.items.some((i) => i.upsert.op === "newEntry")).toBe(true);
  });

  it("enforces the ratification protocol (E-1302) and unresolved challenges (E-1303)", () => {
    // protocol is a world setting stored as a Ruling entry (§6)
    draftOk("ruling", { name: "Table Charter", ratificationProtocol: "dm-only" });
    const sessionId = openSession();
    const pp = appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "A ring" } },
      { actor: "playerA", sessionId });
    const plan = planOk(sessionId);
    expect(plan.ratificationProtocol).toBe("dm-only");
    expect(plan.items[0]!.ratifier).toBe("owner"); // dm-only: the owner ratifies everything
    plan.items[0]!.ratifiedBy = "playerA";
    const wrong = vault.binding.commit(plan, "owner", "full");
    expect(!wrong.ok && wrong.error.code === "E-1302").toBe(true);
    delete plan.items[0]!.ratifiedBy; // commit actor 'owner' ratifies by default

    // challenge the item's source event: plan forces holdAsAsh; forcing bind → E-1303
    appendOk("binding.challenged", { target: pp.eventId, byActor: "playerB" }, { actor: "playerB", sessionId });
    const challengedPlan = planOk(sessionId);
    expect(challengedPlan.items[0]!.challenged).toBe(true);
    expect(challengedPlan.items[0]!.disposition).toBe("holdAsAsh");
    challengedPlan.items[0]!.disposition = "bind";
    const blocked = vault.binding.commit(challengedPlan, "owner", "full");
    expect(!blocked.ok && blocked.error.code === "E-1303").toBe(true);
    // resolution lifts the hold
    appendOk("binding.challenge.resolved", { target: pp.eventId, outcome: "stands" }, { actor: "owner", sessionId });
    const resolvedPlan = planOk(sessionId);
    expect(resolvedPlan.items[0]!.challenged).toBe(false);
    const okNow = vault.binding.commit(resolvedPlan, "owner", "full");
    expect(okNow.ok).toBe(true);
  });

  it("drives the §7.1 status machine: unknown→locked binds; provisional→unknown is invalid; unknown needs its fields", () => {
    const relic = draftOk("thing", {
      name: "The Hollow Crown", bounds: "somewhere in the March", whyUnknown: "no witness survives",
      tableTests: ["a survivor speaks"], payoff: "the succession turns",
    });
    vault.handle().run(`UPDATE entries SET canonStatus='unknown' WHERE id=?`, relic.id);
    vault.handle().run(`UPDATE entry_versions SET canonStatus='unknown' WHERE versionId=?`, relic.headVersion);
    const plain = draftOk("thing", { name: "A plain dagger" });
    const sessionId = openSession();
    appendOk("inscription.added", { text: "the crown surfaced" }, { actor: "owner", sessionId });
    const plan = planOk(sessionId);

    // discovery ratified: unknown → locked (§2.1)
    pushItem(plan, {
      key: "edit:discovery",
      upsert: { op: "newVersion", entryId: relic.id, body: { name: "The Hollow Crown" }, statusIntent: "locked" },
      citations: [ulid()],
    });
    const r1 = vault.binding.commit(plan, "owner", "full");
    expect(r1.ok).toBe(true);
    const after = vault.archive.get(relic.id);
    expect(after.ok && after.value.canonStatus).toBe("locked");

    // provisional → unknown is not a §7.1 transition
    const plan2 = planOk(sessionId);
    plan2.planHash = `edited:${ulid()}`; // ceremony-edited plan, distinct identity
    pushItem(plan2, {
      key: "edit:bad",
      upsert: { op: "newVersion", entryId: plain.id, body: { name: "A plain dagger" }, statusIntent: "unknown" },
      citations: [ulid()],
    });
    const r2 = vault.binding.commit(plan2, "owner", "full");
    expect(!r2.ok && r2.error.code === "E-1001").toBe(true);

    // an unknown-staying version without the Unknown Discipline fields is rejected (§2.2)
    const vague = draftOk("thing", {
      name: "The Second Seal", bounds: "x", whyUnknown: "y", tableTests: ["z"], payoff: "w",
    });
    vault.handle().run(`UPDATE entries SET canonStatus='unknown' WHERE id=?`, vague.id);
    const plan3 = planOk(sessionId);
    plan3.planHash = `edited:${ulid()}`;
    pushItem(plan3, {
      key: "edit:vague",
      upsert: { op: "newVersion", entryId: vague.id, body: { name: "The Second Seal" } },
      citations: [ulid()],
    });
    const r3 = vault.binding.commit(plan3, "owner", "full");
    expect(!r3.ok && r3.error.code === "E-1001").toBe(true);
  });

  it("dockets unresolved conflicts as machine-written contradicts links", () => {
    const existing = draftOk("thing", { name: "The Signet Ring" });
    const sessionId = openSession();
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "The Signet Ring" } },
      { actor: "owner", sessionId });
    const plan = planOk(sessionId);
    const item = plan.items[0]!;
    expect(item.upsert.op).toBe("newEntry");
    // ceremony defers the collision (leaves it unresolved) and binds anyway
    expect(item.conflicts.length).toBe(1);
    const r = vault.binding.commit(plan, "owner", "full");
    expect(r.ok).toBe(true);
    // the docket link pairs the freshly minted entry with the colliding one
    const docketed = vault.handle().get<{ fromEntry: string; toEntry: string; note: string }>(
      `SELECT fromEntry, toEntry, note FROM links WHERE type='contradicts' AND endedByVersion IS NULL
       AND (fromEntry=? OR toEntry=?)`, existing.id, existing.id);
    expect(docketed).toBeDefined();
    expect(docketed!.note).toContain("collides");
    const otherId = docketed!.fromEntry === existing.id ? docketed!.toEntry : docketed!.fromEntry;
    const other = vault.archive.get(otherId);
    expect(other.ok && other.value.name).toBe("The Signet Ring");
    expect(other.ok && other.value.id !== existing.id).toBe(true);
  });
});

describe("binding atomicity (§16.8 — no partial Bindings)", () => {
  it("a process killed mid-commit leaves integrity intact and nothing half-bound", () => {
    const sessionId = openSession();
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "Ring one" } },
      { actor: "owner", sessionId });
    appendOk("pencil.proposed",
      { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: "Ring two" } },
      { actor: "owner", sessionId });
    const plan = planOk(sessionId);
    expect(plan.items.length).toBe(2);
    const entriesBefore = count(`SELECT COUNT(*) c FROM entries`);
    const versionsBefore = count(`SELECT COUNT(*) c FROM entry_versions`);
    const eventsBefore = count(`SELECT COUNT(*) c FROM events`);

    chaos.failAfter = 3; // dies after the first upsert's writes, mid-transaction
    expect(() => vault.binding.commit(plan, "owner", "full")).toThrow(/chaos/);
    chaos.failAfter = null;

    // integrity intact, nothing half-written, no seal, no ratified event
    expect(vault.integrityCheck().ok).toBe(true);
    expect(count(`SELECT COUNT(*) c FROM entries`)).toBe(entriesBefore);
    expect(count(`SELECT COUNT(*) c FROM entry_versions`)).toBe(versionsBefore);
    expect(count(`SELECT COUNT(*) c FROM events`)).toBe(eventsBefore);
    expect(count(`SELECT COUNT(*) c FROM events WHERE type IN ('binding.ratified','binding.sealed')`)).toBe(0);

    // the ash is still writable and gapless (the rolled-back counter resynced)
    const alive = vault.ash.append("inscription.added", { text: "we survived" }, { actor: "owner", sessionId });
    expect(alive.ok).toBe(true);

    // the identical plan (same hash — ash regrew, so replan) commits cleanly afterward
    const replay = planOk(sessionId);
    const done = vault.binding.commit(replay, "owner", "full");
    expect(done.ok).toBe(true);
    expect(count(`SELECT COUNT(*) c FROM events WHERE type='binding.ratified'`)).toBe(1);
  });
});

describe("binding.plan performance (§15 — ≤ 1.5s for a 400-event session)", () => {
  it("plans a ~400-event session inside the budget", () => {
    const doom = draftOk("clock", { name: "Doom", steps: ["a", "b", "c", "d"] });
    const truths = Array.from({ length: 5 }, (_, i) => draftOk("truth", { name: `Truth ${i}` }));
    const sessionId = openSession();
    let n = 1; // session.opened
    for (let i = 0; i < 20; i++) {
      appendOk("pencil.proposed",
        { proposalId: ulid(), voice: "archivist", targetKind: "thing", draft: { name: `Prop ${i}` } },
        { actor: "owner", sessionId });
      n++;
    }
    for (let i = 0; i < 20; i++) {
      appendOk("clock.ticked", { entryId: doom.id, step: ((i % 4) + 1) as 1 | 2 | 3 | 4 }, { actor: "owner", sessionId });
      n++;
    }
    for (const t of truths) {
      appendOk("truth.revealed", { entryId: t.id, toActors: ["playerA", "playerB"] }, { actor: "owner", sessionId });
      n++;
    }
    while (n < 400) {
      appendOk("inscription.added", { text: `beat ${n}` }, { actor: "owner", sessionId });
      n++;
    }
    const t0 = performance.now();
    const plan = planOk(sessionId);
    const ms = performance.now() - t0;
    expect(plan.items.length).toBeGreaterThanOrEqual(30);
    expect(ms, `binding.plan took ${ms.toFixed(0)}ms`).toBeLessThanOrEqual(1500);
    // and the deterministic replan matches
    expect(planOk(sessionId).planHash).toBe(plan.planHash);
  });
});
