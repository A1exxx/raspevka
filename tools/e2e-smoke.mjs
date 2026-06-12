// _e2e-round4.mjs — сквозной прогон прода после раунда 4 (временный скрипт).
// Проверяет: главную (названия, FAB), программу (блок 2, новые имена),
// объяснение распевки (глиф с паузами), запуск прохода (хайвей), полную
// распевку (ритм с/ш с мелодией-подложкой). Копит ошибки консоли.
import { chromium } from 'playwright';

const OUT = 'D:/vocal-trainer/tools';
const seedProgress = () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('raspevka.progress.v1', JSON.stringify({
      welcomed: true, safetyAccepted: true,
      voice: { key: 'baritone', low: 48, high: 64 },
      streak: 12, lastDate: today, examsPassed: ['b1'], freezes: 1,
      history: [{ date: today, pct: 0.82, stars: 3 }],
    }));
  } catch (e) { /* ok */ }
};
const stubMic = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) AC.prototype.resume = function () { return Promise.resolve(); };
  navigator.mediaDevices.getUserMedia = async () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.frequency.value = 220;
    const d = ctx.createMediaStreamDestination(); o.connect(d); o.start();
    return d.stream;
  };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const errors = [];
const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await p.addInitScript(seedProgress);
await p.addInitScript(stubMic);

await p.goto('https://a1exxx.github.io/raspevka/?e2e=1', { waitUntil: 'networkidle' });
await sleep(3600); // сплэш → меню

// 1) Главная: новые названия плиток + FAB
const homeText = await p.evaluate(() => document.body.innerText);
const namesOk = ['Пять гласных', 'Лесенка гласных', 'Волна гласных', 'Качели на квинте', 'Зигзаг', 'Белт-арпеджио', 'Стаккато-арпеджио', 'Фигура-волчок'].filter((n) => !homeText.includes(n));
console.log('HOME names missing:', namesOk.length ? namesOk.join(', ') : 'none ✓');
console.log('HOME guide-fab:', await p.evaluate(() => { const f = document.querySelector('.guide-fab'); if (!f) return 'MISSING'; const r = f.getBoundingClientRect(); return `x=${Math.round(r.x)} y=${Math.round(r.y)} (viewport h=${innerHeight})`; }));

// 2) Программа → блок 2 «Ясность гласных»
await p.evaluate(() => document.querySelector('[data-path]').click());
await sleep(800);
await p.evaluate(() => { [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Ясность гласных'))?.click(); });
await sleep(800);
await p.screenshot({ path: OUT + '/_e2e-block2.jpg', quality: 80, type: 'jpeg' });
const blockText = await p.evaluate(() => document.body.innerText);
console.log('BLOCK2 has new names:', ['Пять гласных', 'Лесенка гласных', 'Волна гласных', 'Качели на квинте', 'Зигзаг'].every((n) => blockText.includes(n)) ? '✓' : 'FAIL: ' + blockText.slice(0, 200));

// 3) Первое упражнение блока → объяснение (глиф с паузами)
await p.evaluate(() => document.querySelector('.block-item')?.click());
await sleep(1500);
await p.screenshot({ path: OUT + '/_e2e-explain.jpg', quality: 80, type: 'jpeg' });
const explainText = await p.evaluate(() => document.body.innerText);
console.log('EXPLAIN screen:', explainText.includes('Пять гласных') ? '✓ Пять гласных' : 'unexpected: ' + explainText.slice(0, 120));

// 4) Старт прохода → во время образца жмём «Пропустить образец» → отсчёт/проход
await p.evaluate(() => { [...document.querySelectorAll('button')].find((x) => /Начать|Поехали|Старт/.test(x.textContent))?.click(); });
await sleep(4200); // тоника 1.65с + образец пошёл
const skipSeen = await p.evaluate(() => !!document.getElementById('skipref'));
console.log('GAME skip button visible:', skipSeen ? '✓' : 'MISSING');
await p.evaluate(() => document.getElementById('skipref')?.click());
await sleep(3500); // отсчёт 3×600мс → проход
await p.screenshot({ path: OUT + '/_e2e-game.jpg', quality: 80, type: 'jpeg' });
const gameMsg = await p.evaluate(() => document.getElementById('msg')?.textContent || document.body.innerText.slice(0, 80));
console.log('GAME msg after skip:', gameMsg);

// 5) Полная распевка: интерстициал (с «Как») → ритм стартует сразу, с мелодией
await p.goto('https://a1exxx.github.io/raspevka/?e2e=2', { waitUntil: 'networkidle' });
await sleep(3600);
await p.evaluate(() => document.getElementById('session')?.click());
await sleep(900);
const inter = await p.evaluate(() => document.body.innerText);
console.log('SESSION interstitial:', inter.includes('Дыхание') ? '✓' : inter.slice(0, 100), '| «Как» в интерстициале:', inter.includes('Как.') ? '✓' : 'нет');
await p.evaluate(() => document.getElementById('go')?.click());
await sleep(4000); // ритм должен идти СРАЗУ (без второго «Начать»)
await p.screenshot({ path: OUT + '/_e2e-rhythm.jpg', quality: 80, type: 'jpeg' });
console.log('RHYTHM label:', await p.evaluate(() => document.getElementById('lbl')?.textContent || 'нет lbl (FAIL)'));

console.log('CONSOLE/PAGE ERRORS:', errors.length ? errors.join(' | ') : 'none ✓');
await b.close();
