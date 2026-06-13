// render-promo.mjs — рендер промо-композиции (HyperFrames-формат) в MP4 БЕЗ ЗВУКА.
// Композиция держит paused GSAP timeline в window.__timelines.root и детерминированный
// canvas (рисуется из t), поэтому покадровый скраб даёт идентичный результат.
// Музыку накладывать НЕ здесь — из библиотеки площадки при заливке (правило проекта).
//
// Запуск: node tools/render-promo.mjs <input.html> [output.mp4] [fps]
//   node tools/render-promo.mjs promo/r2-voice.html promo/raspevka-voice-15s.mp4 24
import { chromium } from 'playwright';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, basename } from 'path';
import { pathToFileURL } from 'url';

const input = process.argv[2];
if (!input) { console.error('usage: node tools/render-promo.mjs <input.html> [output.mp4] [fps]'); process.exit(1); }
const inPath = resolve(input);
const fps = Number(process.argv[4] || 24);
const out = resolve(process.argv[3] || inPath.replace(/\.html$/, `-${fps}fps.mp4`));
const W = 1080, H = 1920;

const tmp = mkdtempSync(join(tmpdir(), 'promo-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('  [pageerror]', e.message.slice(0, 160)));
p.on('requestfailed', (r) => console.log('  [reqfail]', r.url().slice(0, 70)));
await p.goto(pathToFileURL(inPath).href, { waitUntil: 'load' });
// ручной polling таймлайна (без networkidle — Google Fonts не даёт затишья)
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  ready = await p.evaluate(() => !!(window.__timelines && window.__timelines.root));
  if (!ready) await sleep(300);
}
if (!ready) { console.error('timeline не появился — gsap:', await p.evaluate(() => typeof window.gsap)); await b.close(); process.exit(1); }
try { await Promise.race([p.evaluate(() => document.fonts && document.fonts.ready), sleep(2500)]); } catch (e) { /* ok */ }
await sleep(400);

const dur = await p.evaluate(() => window.__timelines.root.duration());
const frames = Math.round(dur * fps);
console.log(`${basename(inPath)} → ${dur}s × ${fps}fps = ${frames} кадров`);

// page.screenshot({clip}) — без actionability-wait (el.screenshot ждёт «стабильности»
// элемента и зависает на постоянно перерисовываемом canvas). JPEG q92 — для H.264 ок.
const clip = { x: 0, y: 0, width: W, height: H };
for (let f = 0; f < frames; f++) {
  const t = f / fps;
  // ВАЖНО: блок-тело → return undefined. tl.time(t) возвращает timeline (циклический
  // объект) — если его вернуть, Playwright виснет на сериализации.
  await p.evaluate((tt) => { window.__timelines.root.time(tt); }, t);
  await p.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92, clip });
  if (f % 30 === 0) { process.stdout.write(`  ${f}/${frames}\n`); }
}
await b.close();

// сборка в MP4 (yuv420p — совместимость; -an — без звука)
const r = spawnSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-framerate', String(fps),
  '-i', join(tmp, 'f%04d.jpg'),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
  out,
], { stdio: 'inherit' });
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) { console.error('ffmpeg failed'); process.exit(1); }
console.log('\nГОТОВО →', out);
