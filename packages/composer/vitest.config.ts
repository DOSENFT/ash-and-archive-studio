import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 30_000,
    // Perf assertions (the §11.6 stress fixture) must not race parallel files.
    fileParallelism: false,
  },
});
