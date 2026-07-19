// node:crypto shim — randomBytes over WebCrypto (ULID randomness, SPEC-001 §2.1)
// and a real synchronous sha256 (js-sha256) for the paths core hashes on the live
// path: the Binding's planHash (§6) and export markers. Hex digests only — the
// only encoding core requests; anything else is a loud defect, not a silent wrong.
import { Buffer } from "buffer";
import { sha256 } from "js-sha256";

export function randomBytes(n: number): Buffer {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Buffer.from(b);
}

export function createHash(alg: string): {
  update(d: string | Uint8Array): { digest(enc: string): string };
} {
  if (alg !== "sha256") throw new Error(`createHash: only sha256 is provided in the webview (asked for ${alg})`);
  const h = sha256.create();
  const surface = {
    update(d: string | Uint8Array) {
      h.update(typeof d === "string" ? d : new Uint8Array(d));
      return { digest(enc: string): string {
        if (enc !== "hex") throw new Error(`digest('${enc}') unsupported in the webview shim (hex only)`);
        return h.hex();
      } };
    },
  };
  return surface;
}
