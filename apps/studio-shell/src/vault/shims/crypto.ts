// node:crypto shim — randomBytes over WebCrypto (ULID randomness, SPEC-001 §2.1)
// and a subtle-free sync sha256 for the export marker path (js implementation via
// a small, dependency-free routine is not worth its risk; export runs under the
// host bridge, so createHash here only needs to exist for the module graph and
// the non-export paths core actually calls in the webview: none today).
import { Buffer } from "buffer";

export function randomBytes(n: number): Buffer {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Buffer.from(b);
}

export function createHash(_alg: string): { update(d: unknown): { digest(enc: string): string } } {
  throw new Error("createHash is host-bridge territory in the webview (export/import).");
}
