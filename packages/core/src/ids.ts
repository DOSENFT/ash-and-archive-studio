// SPEC-001 §2.1 — ULID: 26-char Crockford, sortable, collision-safe, offline-generable.
// Monotonic within a millisecond (spec: ids must sort; two ids in one ms must not collide
// or invert). No dependency: SPEC-001 §17 caps the dependency set; a 40-line ULID does
// not earn a package.
import { randomBytes } from "node:crypto";

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

let lastTime = -1;
let lastRand: number[] = [];

export function ulid(nowMs: number = Date.now()): string {
  let rand: number[];
  if (nowMs === lastTime) {
    // increment previous randomness — monotonic within the millisecond
    rand = [...lastRand];
    for (let i = rand.length - 1; i >= 0; i--) {
      const v = rand[i]!;
      if (v < 31) { rand[i] = v + 1; break; }
      rand[i] = 0;
      if (i === 0) throw new Error("ulid: randomness overflow within one millisecond");
    }
  } else {
    const bytes = randomBytes(16);
    rand = Array.from({ length: 16 }, (_, i) => bytes[i]! % 32);
  }
  lastTime = nowMs;
  lastRand = rand;

  let time = "";
  let t = nowMs;
  for (let i = 0; i < 10; i++) { time = B32[t % 32]! + time; t = Math.floor(t / 32); }
  return time + rand.map((v) => B32[v]!).join("");
}

export function isUlid(s: string): boolean {
  return s.length === 26 && [...s].every((c) => B32.includes(c));
}
