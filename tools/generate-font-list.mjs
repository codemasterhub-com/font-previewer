import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const fontsDir = path.join(root, 'fonts');
const output = path.join(root, 'fonts.js');
const supported = new Set(['.ttf', '.otf', '.woff', '.woff2']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(full));
      continue;
    }

    if (entry.isFile() && supported.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }

  return files;
}

await fs.mkdir(fontsDir, { recursive: true });
const files = (await walk(fontsDir)).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

const manifest = files.map(full => {
  const relative = path.relative(fontsDir, full).split(path.sep).join('/');
  return {
    file: relative,
    name: path.basename(full, path.extname(full))
  };
});

const content = `// Auto-generated during deployment.\nwindow.FONT_FILES = ${JSON.stringify(manifest, null, 2)};\n`;
await fs.writeFile(output, content, 'utf8');

console.log(`Generated fonts.js with ${manifest.length} font${manifest.length === 1 ? '' : 's'}.`);
