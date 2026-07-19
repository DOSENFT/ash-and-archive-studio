// Durability for the WASM vault: the Tauri host (app-data/vault, atomic writes)
// in the shipped shell; IndexedDB in browser dev. Debounced after writes; flushed
// on blur and pagehide (§4.3's checkpoint moments applied to the serialize seam).
import { openedVaultFiles } from "./sqljs-binding.js";

const DEBOUNCE_MS = 1500;

interface TauriInvoke {
  core: { invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> };
}
const tauri = (): TauriInvoke | undefined =>
  (window as unknown as { __TAURI__?: TauriInvoke }).__TAURI__;

// ---- IndexedDB fallback (browser dev) ----

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("aa-vault", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbLoad(name: string): Promise<Uint8Array | null> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly").objectStore("files").get(name);
    tx.onsuccess = () => resolve(tx.result instanceof Uint8Array ? tx.result : null);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbSave(name: string, bytes: Uint8Array): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite").objectStore("files").put(bytes, name);
    tx.onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbList(): Promise<string[]> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly").objectStore("files").getAllKeys();
    tx.onsuccess = () => resolve(tx.result.map(String));
    tx.onerror = () => reject(tx.error);
  });
}

// ---- byte transport ----

function toB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

// ---- the public surface ----

export async function loadVaultFiles(): Promise<Map<string, Uint8Array>> {
  const files = new Map<string, Uint8Array>();
  const t = tauri();
  if (t) {
    const names = await t.core.invoke<string[]>("vault_list").catch(() => []);
    for (const name of names) {
      const b64 = await t.core.invoke<string | null>("vault_load", { name }).catch(() => null);
      if (b64 !== null) files.set(name, fromB64(b64));
    }
  } else {
    for (const name of await idbList().catch(() => [] as string[])) {
      const bytes = await idbLoad(name).catch(() => null);
      if (bytes !== null) files.set(name, bytes);
    }
  }
  return files;
}

const dirty = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
let onStatus: ((state: "inked" | "unsaved") => void) | null = null;

export function onPersistStatus(cb: (state: "inked" | "unsaved") => void): void {
  onStatus = cb;
}

export function markDirty(name: string): void {
  dirty.add(name);
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), DEBOUNCE_MS);
}

export async function flush(): Promise<void> {
  const names = [...dirty];
  dirty.clear();
  const handles = openedVaultFiles();
  const t = tauri();
  try {
    for (const name of names) {
      const handle = handles.get(name);
      if (handle === undefined) continue;
      const bytes = handle.serialize();
      if (t) await t.core.invoke("vault_save", { name, bytesB64: toB64(bytes) });
      else await idbSave(name, bytes);
    }
    if (names.length > 0) onStatus?.("inked");
  } catch (e) {
    for (const name of names) dirty.add(name); // retry on the next write or flush moment
    onStatus?.("unsaved");
    console.warn("[vault] persist failed:", e);
  }
}

export function installFlushMoments(): void {
  addEventListener("blur", () => void flush());
  addEventListener("pagehide", () => void flush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });
}
