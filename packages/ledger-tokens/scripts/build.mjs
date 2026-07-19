// Regenerates the committed artifacts (tokens.css, tokens.json) from the
// typed source. test/artifacts.test.ts asserts the committed files are
// byte-identical to emission — run this after any src/tokens.ts change.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitCss, emitJson } from '../src/emit.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(join(root, 'tokens.css'), emitCss(), 'utf8');
writeFileSync(join(root, 'tokens.json'), emitJson(), 'utf8');
console.log('ledger-tokens: tokens.css + tokens.json regenerated.');
