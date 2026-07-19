// The Foundation boots in the webview: load persisted bytes → WASM binding →
// Studio.open → ensure a world on the shelf → open its Vault. Cold resume ≤2s is
// the law (SPEC-001 §11); the wasm init + open path is measured in dev console.
import { Buffer } from "buffer";
import { Studio, type Vault } from "@ash-archive/core";
import { initSql, probeFts5, wasmBinding } from "./wasm-binding.js";
import { installFlushMoments, loadVaultFiles, markDirty } from "./persist.js";

// Core's Ash uses the bare Buffer global for its snapshot gzip (SPEC-001 §5.4);
// Node has it, the webview does not. Without this line the 50th append of every
// device THROWS mid-play (found by adversarial review, not by the Node-run tests).
if (!("Buffer" in globalThis)) {
  (globalThis as Record<string, unknown>)["Buffer"] = Buffer;
}

export interface OpenedStudio {
  studio: Studio;
  vault: Vault;
  worldId: string;
  worldName: string;
}

export async function bootStudio(): Promise<OpenedStudio> {
  await initSql();
  if (!probeFts5()) {
    throw new Error("This SQLite build lacks FTS5; the vault DDL requires it.");
  }
  const files = await loadVaultFiles();
  const binding = wasmBinding(files, markDirty);
  installFlushMoments();

  const studio = await Studio.open({ platformBinding: binding });
  const shelf = await studio.shelf.list();
  let worldId: string;
  let worldName: string;
  if (shelf.length === 0) {
    // The first world. Its name is the user's to change at the Charter Room;
    // creation itself must not gate on a form (empty-state law, GENESIS 03 §XII).
    const created = await studio.shelf.create("The First World");
    if (!created.ok) throw new Error(`world create failed: ${created.error.message}`);
    worldId = created.value.id;
    worldName = created.value.name;
  } else {
    const mostRecent = [...shelf].sort((a, b) =>
      (b.lastOpenedAt ?? b.createdAt).localeCompare(a.lastOpenedAt ?? a.createdAt))[0]!;
    worldId = mostRecent.id;
    worldName = mostRecent.name;
  }
  const opened = await studio.openWorld(worldId);
  if (!opened.ok) throw new Error(`world open failed: ${opened.error.message}`);
  return { studio, vault: opened.value, worldId, worldName };
}
