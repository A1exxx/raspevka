// main.js — точка входа. MVP Фаза 1: экран разрешения + живой тюнер.
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, hzToY, centsZone } from './theory/note-map.js';

const app = document.getElementById('app');
const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let rafId = null;

// ---------- Экран 1: приветствие + запрос микрофона ----------
function renderWelcome() {
  app.innerHTML = `
    <div class="screen">
      <div class="brand">
        <h1>Распевка</h1>
        <p>Игровой вокальный тренажёр. Пой в микрофон — приложение слышит высоту твоего голоса в реальном времени.</p>
      </div>
      <div class="card">
        <p class="hint" style="margin-bottom:18px">
          Для начала разреши доступ к микрофону. Лучше всего — в тихой комнате,
          без наушников с шумоподавлением.
        </p>
        <button class="btn btn-primary" id="start" style="width:100%">
          🎙 Разрешить микрофон
        </button>
      </div>
      <p class="hint" id="err"></p>
    </div>
  `;
  // ВАЖНО (iOS): mic.start() строго внутри обработчика клика.
  document.getElementById('start').addEventListener('click', async () => {
    const err = document.getElementById('err');
    err.textContent = '';
    try {
      const { sampleRate } = await mic.start();
      tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.9 });
      renderTuner();
    } catch (e) {
      err.textContent = 'Не удалось получить доступ к микрофону: ' + (e?.message || e) +
        '. Проверь разрешения браузера. На телефоне нужен HTTPS.';
    }
  });
}

// ---------- Экран 2: живой тюнер ----------
function renderTuner() {
  app.innerHTML = `
    <div class="screen tuner">
      <div class="note-display silent" id="note">—</div>
      <div class="cents-row">
        <span id="centsTxt">центы: 0</span>
      </div>
      <div class="cents-meter"><div class="cents-needle" id="needle"></div></div>
      <div class="readout">
        <span><b id="hz">0</b> Гц</span>
        <span>чистота <b id="clarity">0%</b></span>
      </div>
      <div class="bar"><i id="vol"></i></div>
      <div class="trace-wrap"><canvas class="trace" id="trace"></canvas></div>
      <p class="hint">Спой устойчивую ноту — увидишь её название и насколько точно ты в неё попал.<br/>Зелёный = ±20 центов.</p>
      <button class="btn btn-ghost" id="stop">Остановить</button>
    </div>
  `;

  const noteEl = document.getElementById('note');
  const centsTxt = document.getElementById('centsTxt');
  const needle = document.getElementById('needle');
  const hzEl = document.getElementById('hz');
  const clarityEl = document.getElementById('clarity');
  const volEl = document.getElementById('vol');
  const canvas = document.getElementById('trace');
  const ctx = canvas.getContext('2d');

  // Канвас под devicePixelRatio
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.getElementById('stop').addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    mic.suspend();
    renderWelcome();
  });

  // История тона для следа (px-колонки справа налево)
  const history = []; // {y, zone, voiced}
  const NOTE_LINES = buildNoteLines(); // горизонтальные линии-ориентиры (октавы C)

  function loop() {
    const buf = mic.read();
    if (buf) {
      const { hz, smoothedHz, clarity, voiced } = tracker.process(buf);
      const rms = mic.rms();
      volEl.style.width = Math.min(100, rms * 350) + '%';
      clarityEl.textContent = Math.round(clarity * 100) + '%';

      if (voiced && smoothedHz) {
        const info = hzToNoteInfo(smoothedHz);
        const zone = centsZone(Math.abs(info.cents));
        const m = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
        noteEl.className = 'note-display ' + zone;
        noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
        centsTxt.textContent = `центы: ${info.cents > 0 ? '+' : ''}${info.cents}`;
        hzEl.textContent = smoothedHz.toFixed(1);
        // стрелка центов: -50..+50 -> 0..100%
        const pos = 50 + Math.max(-50, Math.min(50, info.cents));
        needle.style.left = pos + '%';
        needle.style.background = `var(--${zone})`;
        history.push({ y: hzToY(smoothedHz, canvas.clientHeight), zone, voiced: true });
      } else {
        noteEl.className = 'note-display silent';
        noteEl.textContent = '—';
        history.push({ y: null, zone: null, voiced: false });
      }
      while (history.length > canvas.clientWidth) history.shift();
    }
    drawTrace(ctx, canvas, history, NOTE_LINES);
    rafId = requestAnimationFrame(loop);
  }
  loop();
}

// Линии-ориентиры: ноты C2..C6 на лог-шкале
function buildNoteLines() {
  const lines = [];
  const cFreqs = [65.41, 130.81, 261.63, 523.25, 1046.5]; // C2..C6
  const names = ['C2', 'C3', 'C4', 'C5', 'C6'];
  cFreqs.forEach((f, i) => lines.push({ hz: f, name: names[i] }));
  return lines;
}

function drawTrace(ctx, canvas, history, noteLines) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  // фон-линии нот
  ctx.font = '11px Inter, sans-serif';
  noteLines.forEach((ln) => {
    const y = hzToY(ln.hz, h);
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillText(ln.name, 6, y - 4);
  });

  // след тона
  const zoneColor = { green: '#4cd6a0', yellow: '#f3c969', red: '#ff6b5e' };
  for (let i = 0; i < history.length; i++) {
    const p = history[i];
    if (!p.voiced || p.y == null) continue;
    const x = w - history.length + i;
    ctx.fillStyle = zoneColor[p.zone] || '#888';
    ctx.beginPath();
    ctx.arc(x, p.y, i === history.length - 1 ? 4.5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

renderWelcome();
