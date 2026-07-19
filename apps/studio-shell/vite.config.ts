import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The world's assets are served from studio/ASSETS — in the shipped shell the Rust
// host range-serves this tree on a localhost-scoped protocol (SPEC-SH3 §2.4); in the
// webview slice Vite plays that role. Dev builds watch MANIFEST.json (Gate 1 F-11):
// Vite's publicDir serving reads the file fresh per request, so an intake PASS swap
// is visible on the next navigation with zero code change (G-SH3-6).
// __DEV_BUILD__ is the C-7 compile-time constant: baked at build, never a runtime
// toggle. A production bundle physically contains `false`.
//
// The Foundation runs IN the webview over WASM SQLite (SPEC-001 §5.1's anticipated
// wasm binding); the node:* aliases below satisfy core's module graph with the
// shell's shims — node:sqlite is a throwing stub (never constructed), zlib/crypto
// are byte-compatible implementations, fs is host-bridge territory (export/import).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: '../../studio/ASSETS',
  css: { postcss: {} }, // isolate from the repo root's postcss/tailwind config (the landing page's, not ours)
  build: { target: 'esnext' }, // the shell targets WebView2 (evergreen Chromium) only — top-level await is native there
  server: { port: 5175 },
  define: {
    __DEV_BUILD__: JSON.stringify(mode !== 'production'),
    global: 'globalThis',
  },
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
  optimizeDeps: {
    // esbuild prebundling breaks the wasm-file URL resolution in dev; the module
    // must load as-authored (its own import.meta.url locates sqlite3.wasm).
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
}));
