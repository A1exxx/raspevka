// capture.mjs — реальные скриншоты приложения и сайта для инвест-питча (Playwright).
// Снимает: главную app, программу (10 блоков), нотный хайвей (демо со стаб-микрофоном),
// hero сайта, секцию live-демо сайта. Сохраняет JPEG в docs/pitch-assets/.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'pitch-assets');
mkdirSync(OUT, { recursive: true });

const APP = 'https://a1exxx.github.io/raspevka/';
const DEMO = 'https://a1exxx.github.io/raspevka/demo.html';
const SITE = 'https://a1exxx.github.io/proyavi-landing/';

const seedProgress = () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('raspevka.progress.v1', JSON.stringify({
      welcomed: true, safetyAccepted: true,
      voice: { key: 'baritone', low: 48, high: 64 },
      streak: 12, lastDate: today, examsPassed: ['b1', 'b2', 'b3'], freezes: 1,
      history: [{ date: today, pct: 0.82, stars: 3 }],
    }));
  } catch (e) { /* ok */ }
};

const stubMic = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) AC.prototype.resume = function () { return Promise.resolve(); };
  navigator.mediaDevices.getUserMedia = async () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.frequency.value = 262;
    const d = ctx.createMediaStreamDestination(); o.connect(d); o.start();
    return d.stream;
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

  // ---- APP: главная ----
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  let p = await m.newPage();
  await p.addInitScript(seedProgress);
  await p.goto(APP, { waitUntil: 'networkidle' });
  await sleep(3600); // сплэш → меню
  await p.screenshot({ path: join(OUT, 'app-home.jpg'), quality: 82, type: 'jpeg' });
  console.log('ok app-home');

  // ---- APP: программа (10 блоков) ----
  await p.evaluate(() => { const b = document.querySelector('[data-path]'); if (b) b.click(); });
  await sleep(900);
  await p.screenshot({ path: join(OUT, 'app-program.jpg'), quality: 82, type: 'jpeg' });
  console.log('ok app-program');
  await p.close();

  // ---- APP: нотный хайвей (демо со стаб-микрофоном) ----
  const p2 = await m.newPage();
  await p2.addInitScript(stubMic);
  await p2.goto(DEMO, { waitUntil: 'networkidle' });
  await sleep(700);
  await p2.evaluate(() => { const s = document.getElementById('start'); if (s) s.click(); });
  await sleep(7000); // образец(~3.7с)+отсчёт(~1.8с)+проход → ловим хвост на проходе
  await p2.screenshot({ path: join(OUT, 'app-highway.jpg'), quality: 82, type: 'jpeg' });
  console.log('ok app-highway');
  await p2.close();
  await m.close();

  // ---- SITE: hero ----
  const d = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1.5 });
  const s = await d.newPage();
  await s.goto(SITE, { waitUntil: 'networkidle' });
  await sleep(1500);
  await s.screenshot({ path: join(OUT, 'site-hero.jpg'), quality: 80, type: 'jpeg' });
  console.log('ok site-hero');

  // ---- SITE: секция live-демо ----
  const found = await s.evaluate(() => {
    const el = document.getElementById('livedemo');
    if (!el) return false; el.scrollIntoView(); return true;
  });
  await sleep(1200);
  if (found) {
    const el = await s.$('#livedemo');
    await el.screenshot({ path: join(OUT, 'site-demo.jpg'), quality: 82, type: 'jpeg' });
    console.log('ok site-demo');
  } else { console.log('!! #livedemo not found'); }
  await s.close();
  await d.close();

  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
