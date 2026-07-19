import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The SAME aliases as vite.config.ts: the smoke suite must exercise the browser
// module graph (shims + WASM binding), not Node's own zlib/crypto/sqlite.
export default defineConfig({
  resolve: {
    alias: {
      'node:sqlite': here('./src/vault/shims/sqlite.ts'),
      'node:zlib': here('./src/vault/shims/zlib.ts'),
      'node:crypto': here('./src/vault/shims/crypto.ts'),
      'node:fs': here('./src/vault/shims/fs.ts'),
      'node:path': here('./src/vault/shims/path.ts'),
      '@ash-archive/core': here('../../packages/core/src/index.ts'),
      '@ash-archive/composer': here('../../packages/composer/src/index.ts'),
      '@ash-archive/atelier': here('../../packages/atelier/src/index.ts'),
      '@ash-archive/ledger-tokens': here('../../packages/ledger-tokens/src/index.ts'),
      '@ash-archive/ledger-ui': here('../../packages/ledger-ui/src/index.ts'),
    },
  },
  define: { __DEV_BUILD__: 'true' },
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 60_000,
  },
});
