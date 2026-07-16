import { defineConfig } from 'vite';

// The world's assets are served from studio/ASSETS — in the shipped shell the Rust
// host range-serves this tree on a localhost-scoped protocol (SPEC-SH3 §2.4); in the
// webview slice Vite plays that role. Dev builds watch MANIFEST.json (Gate 1 F-11):
// Vite's publicDir serving reads the file fresh per request, so an intake PASS swap
// is visible on the next navigation with zero code change (G-SH3-6).
// __DEV_BUILD__ is the C-7 compile-time constant: baked at build, never a runtime
// toggle. A production bundle physically contains `false`.
export default defineConfig(({ mode }) => ({
  publicDir: '../../studio/ASSETS',
  css: { postcss: {} }, // isolate from the repo root's postcss/tailwind config (the landing page's, not ours)
  build: { target: 'esnext' }, // the shell targets WebView2 (evergreen Chromium) only — top-level await is native there
  server: { port: 5175 },
  define: { __DEV_BUILD__: JSON.stringify(mode !== 'production') },
}));
