// The webview vault, proven headlessly: the FULL Foundation running over the WASM
// binding through the shell's own shims (pako zlib, WebCrypto ids) — the exact
// module graph the browser executes, aliased identically in vitest.config.ts.
// This is the architecture's load-bearing risk; it does not ship unverified.
import { describe, it, expect, beforeAll } from "vitest";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { Studio, EntryQuery, type Vault } from "@ash-archive/core";
import {
  compose, CODEX_TABLE_PLAYER, DEFAULT_BUDGETS, ComposerRuntime,
} from "@ash-archive/composer";
import { __setSqlite3, probeFts5, wasmBinding } from "../src/vault/wasm-binding.js";

let studio: Studio;
let vault: Vault;
let worldId: string;
const dirtied: string[] = [];

beforeAll(async () => {
  __setSqlite3(await sqlite3InitModule({ print: () => {}, printErr: () => {} }));
  expect(probeFts5()).toBe(true); // the DDL requires FTS5 — fail here, not later
  const binding = wasmBinding(new Map(), (name) => dirtied.push(name));
  studio = await Studio.open({ platformBinding: binding });
  const w = await studio.shelf.create("Smoke World");
  if (!w.ok) throw new Error(w.error.message);
  worldId = w.value.id;
  const v = await studio.openWorld(worldId);
  if (!v.ok) throw new Error(v.error.message);
  vault = v.value;
});

describe("the Foundation over WASM SQLite (the shell's real substrate)", () => {
  it("drafts, queries, links, and folds against the live wasm vault", () => {
    const being = vault.archive.draft("being",
      { name: "Duke Vane", beingType: "person", goal: "hold the March", method: "debt",
        ext: { "aa.rites.5e": { statblock: { hp: 40, ac: 15, speed: 30 } } } },
      { provenance: "ink", actor: "owner" });
    expect(being.ok).toBe(true);
    if (!being.ok) return;
    const truth = vault.archive.draft("truth",
      { name: "The ledger is forged", lever: "the wax seal is wrong" },
      { provenance: "ink", actor: "owner" });
    expect(truth.ok).toBe(true);
    if (!truth.ok) return;
    const link = vault.archive.link(truth.value.id, being.value.id, "unlocks", "owner");
    expect(link.ok).toBe(true);

    const beings = vault.archive.query(EntryQuery.kind("being"));
    expect(beings.ok && beings.value.length).toBe(1);

    // The ash: session + events + fold, through the pako-gzip snapshot path.
    const s = vault.session.open({ actor: "owner" });
    expect(s.ok).toBe(true);
    if (!s.ok) return;
    const sessionId = s.value.sessionId!;
    const dmg = vault.ash.append("damage.taken",
      { beingId: being.value.id, amount: 7 }, { actor: "owner", sessionId });
    expect(dmg.ok).toBe(true);
    const fold = vault.ash.fold<{ hpDelta: Record<string, number> }>("resources", { sessionId });
    expect(fold.ok && fold.value.hpDelta[being.value.id]).toBe(-7);

    // The composer over the wasm graph — the full seated chain.
    const folio = compose("table", {
      activeFolio: "vitals",
      combat: { inCombat: false, order: [], activeTurn: null, conditions: {}, deathSaves: {} },
      stage: { kindled: [], masks: {}, veiled: false, revealed: [] },
      resources: fold.ok ? (fold.value as never) : { hpDelta: {}, slotsSpent: {}, resources: {} },
      clocks: { steps: {} },
      sessionMeta: { openSession: sessionId, scenesFramed: 0, scenesEnded: 0, countsByType: {}, lastDeviceSeq: 0 },
      beingToActor: { [being.value.id]: "owner" },
      perspectiveBeings: [being.value.id],
    }, vault.archive, null, DEFAULT_BUDGETS, {
      steering: { autoturn: {}, margins: { "1": null, "2": null } },
      ribbonState: { dismissed: [] },
      perspective: "owner", reducedMotion: false, plainPage: false, tableLight: false,
    }, CODEX_TABLE_PLAYER);
    const hp = folio.pinned.find((e) => e.kind === "hp");
    expect(hp !== undefined && (hp as { current: number }).current).toBe(33); // 40 − 7

    // The Binding: plan over the session's ash; the charter locks the truth.
    const plan = vault.binding.plan(sessionId);
    expect(plan.ok).toBe(true);
    const locked = vault.charter.lock(truth.value.id, "owner");
    expect(locked.ok && locked.value.canonStatus).toBe("locked");

    // The readiness gate computes over the wasm graph.
    const readiness = vault.charter.readiness(worldId);
    expect(readiness.ok && readiness.value.verdict).toBe("fail"); // one being ≠ a world
    if (readiness.ok) expect(readiness.value.smallestNextBuild.length).toBeGreaterThan(0);

    // Every write marked the file dirty for the persist layer.
    expect(dirtied.length).toBeGreaterThan(0);
    expect(dirtied).toContain(`${worldId}.aa.sqlite`);
  });

  it("the ComposerRuntime mounts over the wasm vault and recomposes on deltas", () => {
    const beings = vault.archive.query(EntryQuery.kind("being"));
    if (!beings.ok || beings.value.length === 0) throw new Error("fixture missing");
    const beingId = beings.value[0]!.id;
    const sessionId = vault.session.current();
    if (sessionId === null) throw new Error("no open session");
    const rt = new ComposerRuntime(vault, CODEX_TABLE_PLAYER, {
      graph: vault.archive, beingToActor: { [beingId]: "owner" }, sessionId,
    });
    rt.mount(["vitals", "action", "stage", "resources"], {
      steering: { autoturn: {}, margins: { "1": null, "2": null } },
      ribbonState: { dismissed: [] },
      perspective: "owner", reducedMotion: false, plainPage: false, tableLight: false,
    });
    let saw = 0;
    rt.onDelta(() => { saw += 1; });
    const r = vault.ash.append("healing.applied", { beingId, amount: 5 }, { actor: "owner", sessionId });
    expect(r.ok).toBe(true);
    expect(saw).toBeGreaterThan(0);
    const hp = rt.current("vitals").pinned.find((e) => e.kind === "hp");
    expect(hp !== undefined && (hp as { current: number }).current).toBe(38); // 33 + 5
    rt.dispose();
  });

  it("serialize → reopen: the world survives the persist round-trip", async () => {
    const { openedVaultFiles } = await import("../src/vault/wasm-binding.js");
    const files = new Map<string, Uint8Array>();
    for (const [name, handle] of openedVaultFiles()) files.set(name, handle.serialize());
    expect(files.has("studio.sqlite")).toBe(true);
    expect(files.has(`${worldId}.aa.sqlite`)).toBe(true);

    // Prove the BYTES independently: deserialize into a raw db and count entries.
    const sqlite3 = await sqlite3InitModule({ print: () => {}, printErr: () => {} });
    const bytes = files.get(`${worldId}.aa.sqlite`)!;
    const world = new sqlite3.oo1.DB();
    const p = sqlite3.wasm.allocFromTypedArray(bytes);
    world.checkRc(sqlite3.capi.sqlite3_deserialize(
      world.pointer!, "main", p, bytes.length, bytes.length,
      sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE,
    ));
    const rows = world.exec({ sql: "SELECT COUNT(*) c FROM entries", rowMode: "object", returnValue: "resultRows" }) as { c: number }[];
    world.close();
    expect(rows[0]!.c).toBeGreaterThanOrEqual(2); // being + truth at minimum
  });
});
