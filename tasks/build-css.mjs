#!/usr/bin/env node
/*
 * Build the published stylesheet.
 *
 * The design tokens are authored once in `@bpmn-io/theme` and prepended here,
 * so `assets/diagram-js.css` stays self-contained and consumers still only
 * import a single file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const themeCss = fs.readFileSync(
  require.resolve('@bpmn-io/theme/assets/theme.css'),
  'utf8'
);

const source = fs.readFileSync(
  path.join(ROOT, 'src/assets/diagram-js.css'),
  'utf8'
);

const outDir = path.join(ROOT, 'assets');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'diagram-js.css'), `${themeCss}\n${source}`);

console.log('built assets/diagram-js.css');
