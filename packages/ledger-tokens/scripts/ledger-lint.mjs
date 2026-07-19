#!/usr/bin/env node
/**
 * ledger-lint — token-only rendering, enforced (EMB-3).
 *
 * GENESIS 03 §XI: "Future Wings consume tokens, never raw values." This lint
 * gives that sentence CI teeth on consumer surfaces. Rules derive ONLY from
 * sealed law (the stricter CB1 bench-lint set — no shadows, no radii — is
 * unsealed and NOT enforced here; it arrives with the CB1 seal).
 *
 * CSS rules:
 *   L1  raw hex color literals                    → use var(--…)
 *   L2  rgb()/rgba()/hsl()/hsla()/oklch() literals → use var(--…) or a
 *       color-mix() whose every color argument is var(--…) or `transparent`
 *   L3  cubic-bezier() literals                   → use var(--ease-…)
 *   L4  font-family not via var(--font-…)         → three faces, no fourth ever
 *   L5  numeric durations on transition/animation → use var(--dur-…)
 * TS/JS rule:
 *   L6  hex color string literals                 → import from ledger-tokens
 *
 * Exemptions: node_modules, dist, vendor/ (sealed working state, themed only
 * through its declared --sw-* seams), *.d.ts, and the token package itself
 * (the sole home of raw values). A line may carry
 * `ledger-lint: allow(<rule>) <reason>` — the reason is mandatory and the
 * allowance is visible in the diff, never silent.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const roots = process.argv.slice(2);
if (roots.length === 0) {
  console.error('usage: ledger-lint.mjs <dir-or-file> [...]');
  process.exit(2);
}

const SKIP_DIRS = new Set(['node_modules', 'dist', 'vendor', 'target', '.git']);
const CSS_EXT = /\.css$/i;
const TS_EXT = /\.(ts|tsx|js|jsx|mjs)$/i;

function* walk(path) {
  const st = statSync(path);
  if (st.isFile()) { yield path; return; }
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(join(path, name));
  }
}

const findings = [];
const report = (file, lineNo, rule, msg, line) =>
  findings.push({ file, lineNo, rule, msg, line: line.trim() });

const ALLOW_RE = /ledger-lint:\s*allow\((L\d)\)\s+\S/;

function allowed(line, rule) {
  const m = ALLOW_RE.exec(line);
  return m !== null && m[1] === rule;
}

/** Every color argument of every color-mix() must be var(--…) or transparent.
 * (var(--…) contains a ')', so the lawful form is matched whole rather than
 * naively splitting on the first close-paren.) */
const CM_ARG = String.raw`(?:var\(--[\w-]+\)|transparent)(?:\s+\d+(?:\.\d+)?%)?`;
const CM_LAWFUL = new RegExp(
  String.raw`color-mix\(\s*in\s+[\w-]+\s*,\s*${CM_ARG}\s*,\s*${CM_ARG}\s*\)`,
  'g',
);
function lawfulColorMixes(line) {
  const total = (line.match(/color-mix\(/g) ?? []).length;
  const lawful = (line.match(CM_LAWFUL) ?? []).length;
  return lawful === total;
}

function lintCssLine(file, lineNo, line) {
  const noComments = line.replace(/\/\*.*?\*\//g, '');
  if (/#[0-9a-fA-F]{3,8}\b/.test(noComments) && !allowed(line, 'L1')) {
    report(file, lineNo, 'L1', 'raw hex color — use var(--…)', line);
  }
  if (/\b(rgb|rgba|hsl|hsla|oklch)\(/.test(noComments) && !allowed(line, 'L2')) {
    report(file, lineNo, 'L2', 'raw color function — use var(--…) or a var-only color-mix()', line);
  }
  if (!lawfulColorMixes(noComments) && !allowed(line, 'L2')) {
    report(file, lineNo, 'L2', 'color-mix() with a non-token color argument', line);
  }
  if (/cubic-bezier\(/.test(noComments) && !allowed(line, 'L3')) {
    report(file, lineNo, 'L3', 'raw easing — use var(--ease-…)', line);
  }
  if (/font-family\s*:/.test(noComments) && !/font-family\s*:\s*var\(--font-/.test(noComments) && !allowed(line, 'L4')) {
    report(file, lineNo, 'L4', 'font-family must come from var(--font-…) — three faces, no fourth ever', line);
  }
  if (/\b(transition|animation)\b[^;]*\b\d+(\.\d+)?m?s\b/.test(noComments) && !allowed(line, 'L5')) {
    report(file, lineNo, 'L5', 'numeric motion duration — use var(--dur-…), the four registers only', line);
  }
}

function lintTsLine(file, lineNo, line) {
  if (/(['"`])#[0-9a-fA-F]{6}\1/.test(line) && !allowed(line, 'L6')) {
    report(file, lineNo, 'L6', 'hex color string in code — import the token from @ash-archive/ledger-tokens', line);
  }
}

for (const root of roots) {
  for (const file of walk(root)) {
    if (file.split(sep).includes('ledger-tokens')) continue; // the source of raw values
    if (/\.d\.ts$/.test(file)) continue;
    const isCss = CSS_EXT.test(file);
    const isTs = TS_EXT.test(file);
    if (!isCss && !isTs) continue;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (isCss) lintCssLine(file, i + 1, line);
      else lintTsLine(file, i + 1, line);
    });
  }
}

if (findings.length) {
  console.error(`ledger-lint: ${findings.length} violation(s) of token-only rendering (GENESIS 03 §XI):\n`);
  for (const f of findings) {
    console.error(`  ${relative(process.cwd(), f.file)}:${f.lineNo}  [${f.rule}] ${f.msg}`);
    console.error(`      ${f.line}`);
  }
  process.exit(1);
}
console.log('ledger-lint: clean — tokens only.');
