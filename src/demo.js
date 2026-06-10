// demo.js — встраиваемый демо-виджет «спой ноту — увидь её» для сайта школы.
// Отдельная Vite-точка входа (см. vite.config.js): тянет только ядро детекции,
// без экранов приложения — маленький бандл, мгновенный «вау».
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, hzToY, centsZone } from './theory/note-map.js';

const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let raf = null;

const startBtn = document.getElementById('start');
const stage = document.getElementById('stage');
const noteEl = document.getElementById('note');
const needle = document.getElementById('needle');
const centsEl = document.getElementById('cents');
const canvas = document.getElementById('trace');
const ctx = canvas.getContext('2d');

const ZONE = { green: '#3ee6a8', yellow: '#ffc24d', red: '#ff6b61' };
const history = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  startBtn.textContent = 'Подключаю…';
  try {
    const { sampleRate } = await mic.start();
    tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.85 });
    tracker.setRange(70, 1200);
    startBtn.classList.add('hidden');
    stage.classList.remove('hidden');
    resize();
    loop();
  } catch (e) {
    startBtn.disabled = false;
    startBtn.textContent = 'Микрофон не доступен — разреши и попробуй ещё';
  }
});

function loop() {
  const buf = mic.read();
  if (buf && tracker) {
    const { smoothedHz, voiced } = tracker.process(buf);
    if (voiced && smoothedHz && mic.rms() > 0.003) {
      const info = hzToNoteInfo(smoothedHz);
      const zone = centsZone(Math.abs(info.cents));
      const m = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
      noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
      noteEl.style.color = ZONE[zone];
      needle.style.left = (50 + Math.max(-50, Math.min(50, info.cents))) + '%';
      needle.style.background = ZONE[zone];
      centsEl.textContent = `${smoothedHz.toFixed(1)} Гц · ${info.cents > 0 ? '+' : ''}${info.cents} центов от ${info.name}`;
      history.push({ y: hzToY(smoothedHz, canvas.clientHeight), c: ZONE[zone] });
    } else {
      noteEl.style.color = '#2a3442';
      history.push(null);
    }
    while (history.length > canvas.clientWidth) history.shift();
    draw();
  }
  raf = requestAnimationFrame(loop);
}

function draw() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < history.length; i++) {
    const p = history[i];
    if (!p) continue;
    const last = i === history.length - 1;
    ctx.globalAlpha = 0.25 + (i / history.length) * 0.75;
    ctx.fillStyle = p.c;
    ctx.shadowColor = p.c;
    ctx.shadowBlur = last ? 14 : 5;
    ctx.beginPath();
    ctx.arc(w - history.length + i, p.y, last ? 4.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

// Пауза в фоне — бережём батарею.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
  else if (!document.hidden && tracker && !raf) loop();
});
