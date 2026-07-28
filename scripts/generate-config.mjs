import { writeFile } from 'node:fs/promises';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'MAPBOX_TOKEN'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.warn(`Configuration publique manquante : ${missing.join(', ')}`);
}

const config = Object.fromEntries(
  required.map((name) => [name, process.env[name] || ''])
);

const output = `window.NEWRIDE_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
await writeFile(new URL('../config.js', import.meta.url), output, 'utf8');
console.log('config.js généré.');
