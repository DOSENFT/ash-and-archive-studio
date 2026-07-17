// `npm run test:harness` — the §15 full-scale release harness (S/M/L/XL) plus the
// §16.8 chaos storm at its full N. Kept as a script (not shell syntax) so the env
// wiring is identical on Windows and POSIX.
import { spawnSync } from "node:child_process";

const env = { ...process["env"] };
env["AA_SCALE"] = env["AA_SCALE"] ?? "S,M,L,XL";
env["AA_CHAOS"] = env["AA_CHAOS"] ?? "1000";

const r = spawnSync(process.execPath,
  ["node_modules/vitest/vitest.mjs", "run", "test/perf-harness.test.ts", "test/chaos.test.ts"],
  { stdio: "inherit", env });
process.exit(r.status ?? 1);
