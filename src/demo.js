// demo.js — встраиваемый демо-виджет «короткая распевка» для сайта школы.
// Отдельная Vite-точка входа: тянет только ядро детекции (mic + pitch + note-map),
// свой компактный реактивный нотный хайвей и лёгкий синтез эталона — маленький бандл,
// мгновенный «вау» без зависимости от полного приложения.
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, midiToHz } from './theory/note-map.js';

const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let raf = null;
const timers = [];
let osc = [];

// Простая распевка: до-ре-ми-фа-соль-фа-ми-ре-до на «Ма» (классическая 5-нотная гамма).
const ROOT = 60; // C4 — удобно почти для всех; мужской голос ловим октавой ниже (см. foldHz)
const SCALE = [0, 2, 4, 5, 7, 5, 4, 2, 0];
const BEAT = 0.62;          // сек на ноту
const LEAD = 1.8;           // въезд до первой ноты
const PXS = 150;            // скорость хайвея
const HIT_FRAC = 0.3;       // позиция линии попадания
const CENTER_HZ = midiToHz(ROOT + 3); // центр свёртки октав (~Eb4)

const el = (id) => document.getElementById(id);
const startBtn = el('start'), poster = el('poster'), stage = el('stage'), result = el('result');
const noteEl = el('note'), statusEl = el('status'), targetEl = el('target'), centsEl = el('cents');
const canvas = el('hw'), ctx = canvas.getContext('2d');

const NOTES = (() => { // тайминги нот
  let t = LEAD; const arr = [];
  for (const deg of SCALE) {
    const midi = ROOT + deg;
    arr.push({ midi, hz: midiToHz(midi), start: t, end: t + BEAT });
    t += BEAT;
  }
  return arr;
})();
const TOTAL = LEAD + SCALE.length * BEAT + 0.6;
const MIN_M = ROOT - 2, MAX_M = ROOT + 9;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

// Свернуть частоту в октаву около центра распевки — чтобы голос (в т.ч. на октаву
// ниже у мужчин) рисовался у целевых нот, а не улетал за край.
function foldHz(hz) {
  let r = hz / CENTER_HZ;
  while (r > 1.41421) r /= 2;
  while (r < 0.70711) r *= 2;
  return CENTER_HZ * r;
}
// Центы до цели с учётом октавы (попадание не зависит от октавы голоса).
function octCents(sungHz, targetHz) {
  let r = sungHz / targetHz;
  while (r > 1.41421) r /= 2;
  while (r < 0.70711) r *= 2;
  return 1200 * Math.log2(r);
}
function yFor(hz) {
  const minHz = midiToHz(MIN_M), maxHz = midiToHz(MAX_M);
  const c = Math.max(minHz, Math.min(maxHz, hz));
  const f = Math.log2(c / minHz) / Math.log2(maxHz / minHz);
  const h = canvas.clientHeight;
  return h - f * h;
}
function noteName(midi) { const i = hzToNoteInfo(midiToHz(midi)); return i ? i.name : ''; }

// Лёгкий синтез эталонного тона (мягкое «пиано»).
function tone(hz, dur, when = 0, gain = 0.16) {
  const c = mic.ctx; if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'triangle'; o.frequency.value = hz;
  o.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0); o.stop(t0 + dur + 0.05);
  osc.push(o);
}
function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
function clearAll() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  timers.forEach(clearTimeout); timers.length = 0;
  osc.forEach((o) => { try { o.stop(); } catch (e) { /* ok */ } }); osc = [];
}

const trail = [];
let startPerf = 0, voicedFrames = 0, greenFrames = 0, scoredFrames = 0;

function show(which) {
  poster.classList.toggle('hidden', which !== 'poster');
  stage.classList.toggle('hidden', which !== 'stage');
  result.classList.toggle('hidden', which !== 'result');
}

startBtn.addEventListener('click', begin);
el('stop').addEventListener('click', () => { clearAll(); show('poster'); startBtn.classList.remove('hidden'); startBtn.textContent = '▶ Спеть ещё раз'; });
el('retry').addEventListener('click', begin);

async function begin() {
  startBtn.classList.add('hidden');
  startBtn.textContent = '▶ Подключаю микрофон…';
  try {
    if (!mic.ready) {
      const { sampleRate } = await mic.start();
      tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.85 });
      tracker.setRange(midiToHz(MIN_M - 10), midiToHz(MAX_M + 14));
    }
  } catch (e) {
    show('poster'); startBtn.classList.remove('hidden');
    startBtn.textContent = 'Микрофон не доступен — разреши и попробуй ещё';
    return;
  }
  show('stage'); resize();
  trail.length = 0; voicedFrames = 0; greenFrames = 0; scoredFrames = 0;
  noteEl.textContent = '—'; noteEl.style.color = '#2a3442'; targetEl.textContent = '—'; centsEl.textContent = '';
  tracker.reset();
  draw(0);
  // 1) образец-мелодия
  statusEl.textContent = '🔊 Слушай образец…';
  tone(midiToHz(ROOT), 0.9, 0, 0.12); // тоника-опора
  NOTES.forEach((n, i) => tone(n.hz, BEAT * 0.85, 0.5 + i * BEAT * 0.6));
  // 2) отсчёт → 3) проход
  later(countIn, 0.5 * 1000 + SCALE.length * BEAT * 0.6 * 1000 + 350);
}

function countIn() {
  let n = 3;
  const tick = () => {
    if (n > 0) { statusEl.textContent = `Приготовься… ${n}`; tone(880, 0.08, 0, 0.06); n--; later(tick, 600); }
    else { statusEl.textContent = 'Пой за нотами! 🎤'; startRun(); }
  };
  tick();
}

function startRun() {
  startPerf = performance.now();
  // Страховка: если кадры затормозили (слабое устройство/фон) — гарантированно
  // завершаем распевку и показываем итог, не подвисая на сцене.
  later(() => { if (raf || stage && !stage.classList.contains('hidden')) finish(); }, (TOTAL + 1.5) * 1000);
  const loop = () => {
    const now = (performance.now() - startPerf) / 1000;
    const buf = mic.read();
    let voiced = false, hz = null;
    if (buf) { const r = tracker.process(buf); voiced = r.voiced && mic.rms() > 0.004; hz = r.smoothedHz; }

    // активная нота
    let active = null;
    for (const seg of NOTES) if (now >= seg.start && now < seg.end) { active = seg; break; }
    targetEl.textContent = active ? noteName(active.midi) : '—';

    let zone = null;
    if (voiced && hz) {
      const info = hzToNoteInfo(hz);
      const m = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
      noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
      if (active) {
        const c = octCents(hz, active.hz);
        const a = Math.abs(c);
        zone = a < 25 ? 'green' : a < 55 ? 'yellow' : 'red';
        centsEl.textContent = `${c > 0 ? '+' : ''}${Math.round(c)} центов`;
        scoredFrames++; voicedFrames++; if (zone === 'green') greenFrames++;
      } else { centsEl.textContent = ''; }
      noteEl.style.color = zone === 'green' ? '#3ee6a8' : zone === 'yellow' ? '#ffc24d' : zone === 'red' ? '#ff6b61' : '#3de5c9';
    } else {
      noteEl.style.color = '#2a3442'; if (active) centsEl.textContent = '';
    }
    trail.push(voiced && hz ? { y: yFor(foldHz(hz)), zone } : null);
    while (trail.length > 80) trail.shift();
    draw(now);

    if (now < TOTAL) raf = requestAnimationFrame(loop);
    else finish();
  };
  loop();
}

function draw(now) {
  const w = canvas.clientWidth, h = canvas.clientHeight, hitX = w * HIT_FRAC;
  ctx.clearRect(0, 0, w, h);
  // сетка полутонов
  for (let m = MIN_M; m <= MAX_M; m++) {
    const y = yFor(midiToHz(m));
    ctx.strokeStyle = (m - ROOT) % 12 === 0 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  // линия попадания
  ctx.strokeStyle = 'rgba(61,229,201,.7)'; ctx.lineWidth = 3; ctx.setLineDash([6, 7]);
  ctx.beginPath(); ctx.moveTo(hitX, 0); ctx.lineTo(hitX, h); ctx.stroke(); ctx.setLineDash([]);
  // ноты-плашки
  let activeIdx = -1;
  NOTES.forEach((seg, i) => { if (now >= seg.start && now < seg.end) activeIdx = i; });
  NOTES.forEach((seg, i) => {
    const x = hitX + (seg.start - now) * PXS, ww = BEAT * PXS - 8, y = yFor(seg.hz);
    if (x + ww < -30 || x > w + 30) return;
    const act = i === activeIdx;
    ctx.fillStyle = act ? 'rgba(61,229,201,.95)' : 'rgba(61,229,201,.22)';
    if (act) { ctx.shadowColor = 'rgba(61,229,201,.9)'; ctx.shadowBlur = 20; }
    roundRect(x, y - 8, Math.max(ww, 12), 16, 8); ctx.fill(); ctx.shadowBlur = 0;
  });
  // след голоса
  const n = trail.length, dx = 3.0;
  for (let i = 0; i < n; i++) {
    const p = trail[i]; if (!p) continue;
    const x = hitX - (n - 1 - i) * dx, last = i === n - 1;
    const col = p.zone === 'green' ? '#3ee6a8' : p.zone === 'yellow' ? '#ffc24d' : p.zone === 'red' ? '#ff6b61' : '#3de5c9';
    ctx.globalAlpha = 0.12 + (i / n) * 0.6; ctx.fillStyle = col;
    if (last) { ctx.shadowColor = col; ctx.shadowBlur = 16; }
    ctx.beginPath(); ctx.arc(x, p.y, last ? 7 : 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}
function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath(); ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
}

function finish() {
  clearAll();
  const pct = scoredFrames ? greenFrames / scoredFrames : 0;
  const sang = scoredFrames > 8; // реально ли пел
  const stars = !sang ? 0 : pct >= 0.6 ? 3 : pct >= 0.35 ? 2 : 1;
  el('stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  el('verdict').textContent = !sang ? 'Кажется, ты не пел 🙂'
    : stars === 3 ? 'Отлично — чисто!' : stars === 2 ? 'Хорошо! Уже близко' : 'Неплохо для начала!';
  el('res-sub').textContent = !sang ? 'Включи микрофон и спой за нотами «Ма».'
    : `Попадание в ноту: ${Math.round(pct * 100)}%. В приложении — 26 распевок и программа из 10 блоков.`;
  show('result');
}

document.addEventListener('visibilitychange', () => { if (document.hidden) { clearAll(); } });
