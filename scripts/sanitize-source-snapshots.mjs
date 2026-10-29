import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = fileURLToPath(new URL('../research/sources/', import.meta.url));
const extensions = new Set(['.html', '.htm', '.json', '.md', '.txt']);
const write = process.argv.includes('--write');
const allowedArgs = new Set(['--check', '--write']);
if (process.argv.slice(2).some(arg => !allowedArgs.has(arg)) ||
    (write && process.argv.includes('--check'))) {
  console.error('Usage: node scripts/sanitize-source-snapshots.mjs [--check | --write]');
  process.exit(1);
}

async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile() && extensions.has(extname(entry.name).toLowerCase())) {
      yield path;
    }
  }
}

let affected = 0;
let checked = 0;
for await (const path of files(sourceRoot)) {
  checked++;
  const original = await readFile(path, 'utf8');
  // Public mini-program IDs are irrelevant to vehicle evidence. Never print their values.
  const matches = [...original.matchAll(/\bwx[0-9a-f]{16}\b/gi)];
  if (!matches.length) continue;
  affected++;
  const lines = [...new Set(matches.map(match =>
    original.slice(0, match.index).split('\n').length))];
  console.log(`${relative(root, path)}:${lines.join(',')}: ${matches.length} WeChat App ID occurrence(s) ${write ? 'redacted' : 'must be redacted'}.`);
  if (write) {
    await writeFile(path, original.replace(/\bwx[0-9a-f]{16}\b/gi, '[REDACTED_WECHAT_APP_ID]'));
  }
}

if (affected && !write) {
  console.error('Run npm run sanitize:sources before committing source snapshots.');
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked} source snapshots; ${affected} file(s) ${write ? 'sanitized' : 'require redaction'}.`);
}
