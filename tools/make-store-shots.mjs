// make-store-shots.mjs — скриншоты ключевых экранов для RuStore/Google Play.
// Телефонный кадр 1080×1920 (стандарт сторов). Сидируем прогресс + стаб микрофона.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'store-screens');
mkdirSync(OUT, { recursive: true });
const APP = 'https://a1exxx.github.io/raspevka/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seed = () => {
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
    const o = ctx.createOscillator(); o.frequency.value = 196;
    const d = ctx.createMediaStreamDestination(); o.connect(d); o.start();
    return d.stream;
  };
};

const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.addInitScript(seed);
await p.addInitScript(stubMic);

async function shot(name) { await p.screenshot({ path: join(OUT, name + '.png'), type: 'png' }); console.log('shot', name); }

// 1. Главная
await p.goto(APP, { waitUntil: 'networkidle' });
await sleep(3600);
await shot('1-home');

// 2. Программа обучения
await p.evaluate(() => document.querySelector('[data-path]')?.click());
await sleep(900);
await shot('2-program');

// 3. Дашборд прогресса
await p.goto(APP, { waitUntil: 'networkidle' }); await sleep(3400);
await p.evaluate(() => document.querySelector('[data-dash]')?.click());
await sleep(900);
await shot('3-progress');

// 4. Упражнение (хайвей) — запускаем распевку из практики и ловим проход
await p.goto(APP, { waitUntil: 'networkidle' }); await sleep(3400);
await p.evaluate(() => document.querySelector('[data-ex]')?.click());
await sleep(1400);
await p.evaluate(() => { [...document.querySelectorAll('button')].find((x) => /Начать|Поехали/.test(x.textContent))?.click(); });
await sleep(4200);
await p.evaluate(() => document.getElementById('skipref')?.click());
await sleep(3500);
await shot('4-highway');

await b.close();
console.log('DONE — docs/store-screens/');
