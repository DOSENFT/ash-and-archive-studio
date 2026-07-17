// `npm run test:harness` — the §15 full-scale release harness (S/M/L/XL) plus the
// §16.8 chaos storm at its full N. One vitest process PER scale so an L/XL world's
// working set never shares a heap with another scale's. Kept as a script (not shell
// syntax) so the env wiring is identical on Windows and POSIX. AA_CHAOS=0 skips the
// chaos step (it also runs, at its full default N, inside the plain CI suite).
import { spawnSync } from "node:child_process";

const scales = (process["env"]["AA_SCALE"] ?? "S,M,L,XL").split(",").map((s) => s.trim()).filter(Boolean);
const chaosN = process["env"]["AA_CHAOS"] ?? "1000";

let failed = false;
for (const scale of scales) {
  console.log(`\n===== §15 harness @ ${scale} =====`);
  const r = spawnSync(process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "--no-file-parallelism", "test/perf-harness.test.ts"],
    { stdio: "inherit", env: { ...process["env"], AA_SCALE: scale } });
  if ((r.status ?? 1) !== 0) failed = true;
}

if (chaosN !== "0") {
  console.log(`\n===== §16.8 chaos ×${chaosN} =====`);
  const c = spawnSync(process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "--no-file-parallelism", "test/chaos.test.ts"],
    { stdio: "inherit", env: { ...process["env"], AA_CHAOS: chaosN } });
  if ((c.status ?? 1) !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
