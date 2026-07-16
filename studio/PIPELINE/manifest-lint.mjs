#!/usr/bin/env node
// atelier-lint — the manifest CI gate (SPEC-SH3 §3.4; G-SH3-5/9).
// Default mode is SHIPPING: an UNCURATED asset FAILS the build. `--dev` relaxes
// exactly that one law (the watermark then applies at runtime). Exit 1 on any error.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateManifest } from '../../packages/atelier/src/validate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = process.argv.find((a) => a.endsWith('.json')) ?? join(here, '..', 'ASSETS', 'MANIFEST.json');
const devMode = process.argv.includes('--dev');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { errors, warnings } = validateManifest(manifest, { devMode });

for (const w of warnings) console.warn(`  warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  FAIL  ${e}`);
  console.error(`\natelier-lint: ${errors.length} error(s) — this manifest may not ship${devMode ? ' (even in dev)' : ''}.`);
  process.exit(1);
}
console.log(`atelier-lint: MANIFEST ok (${manifest.poses?.length ?? 0} poses, ${manifest.clips?.length ?? 0} clips, ${manifest.rites?.length ?? 0} rites, ${manifest.accretion?.length ?? 0} accretion)${devMode ? ' [dev mode]' : ''}`);
