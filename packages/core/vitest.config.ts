import { defineConfig } from "vitest/config";

// Scoped config so vitest never climbs to the repo root's landing-page vite.config.ts.
export default defineConfig({
  test: {
    root: __dirname,
    include: ["test/**/*.test.ts"],
    environment: "node",
    // §15 budgets are measured in-suite ("budgets fail builds"); parallel workers
    // hammering the same disk turn latency laws into coin flips. One file at a time.
    fileParallelism: false,
    testTimeout: 120_000,   // §15/§16 harness suites measure real work at scale
    hookTimeout: 3_600_000, // L/XL world generation happens in beforeAll
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text-summary", "text"],
      // §16 coverage floor: 90% lines. (The "100% of write paths" law is verified as
      // 100% function coverage of the write surfaces — see the step-7 build report.)
      thresholds: { lines: 90 },
    },
  },
});
