// node:zlib shim — the Ash's snapshot gzip (SPEC-001 §5.4) over pako, byte-compatible
// with Node's gzipSync/gunzipSync for the (Buffer, {level}) shapes core uses.
import { gzip, ungzip } from "pako";
import { Buffer } from "buffer";

export function gzipSync(data: Uint8Array | string, opts?: { level?: number }): Buffer {
  const input = typeof data === "string" ? Buffer.from(data) : data;
  const level = (opts?.level ?? 6) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  return Buffer.from(gzip(input, { level }));
}

export function gunzipSync(data: Uint8Array): Buffer {
  return Buffer.from(ungzip(data));
}
