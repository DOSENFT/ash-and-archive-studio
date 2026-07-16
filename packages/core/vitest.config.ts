import { defineConfig } from "vitest/config";

// Scoped config so vitest never climbs to the repo root's landing-page vite.config.ts.
export default defineConfig({
  test: {
    root: __dirname,
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
