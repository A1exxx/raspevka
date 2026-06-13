// stamp-version.mjs — пишет dist/version.json при сборке (баннер «Доступна новая версия»).
import { writeFileSync } from 'fs';
const out = new URL('../dist/version.json', import.meta.url);
writeFileSync(out, JSON.stringify({ v: String(Date.now()) }));
console.log('version stamped ->', out.pathname);
