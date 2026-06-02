// main.js — точка входа. MVP: приветствие → меню → (тюнер | упражнение) → итог.
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, hzToY, centsZone } from './theory/note-map.js';
import { renderGame } from './screens/game.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump } from './theory/exercises.js';
import { renderSession } from './screens/session.js';
import { renderOnboarding } from './screens/onboarding-range.js';
import { renderBreathing, BREATHING } from './screens/breathing.js';
import * as progress from './state/progress.js';

const app = document.getElementById('app');
const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let rafId = null;

// Корневой тон по умолчанию (C4). На Фазе 3 берётся из диапазона пользователя.
const DEFAULT_ROOT = 60;

const EXERCISES = [
  { label: 'Удержание ноты', sub: 'держать ровный звук', make: () => sustain(DEFAULT_ROOT, 8) },
  { label: 'Гамма «Ма-Мэ»', sub: 'попадать в ноты гаммы', make: () => fiveNoteScale(DEFAULT_ROOT) },
  { label: 'Беглость «Ма»', sub: 'быстрые ноты — как в рекламе', make: () => agilityRun(DEFAULT_ROOT) },
  { label: 'Октавный скачок', sub: 'прыжок на октаву и назад', make: () => octaveJump(DEFAULT_ROOT) },
];

// ---------- Экран 1: приветствие + запрос микрофона ----------
function renderWelcome() {
  stopRaf();
  app.innerHTML = `
    <div class="screen">
      <div class="brand">
        <h1>Распевка</h1>
        <p>Игровой вокальный тренажёр. Пой в микрофон — приложение слышит высоту твоего голоса в реальном времени.</p>
      </div>
      <div class="card">
        <p class="hint" style="margin-bottom:18px">
          Разреши доступ к микрофону. Лучше в тихой комнате, без наушников с шумоподавлением.
        </p>
        <button class="btn btn-primary" id="start" style="width:100%">🎙 Разрешить микрофон</button>
      </div>
      <p class="hint" id="err"></p>
    </div>
  `;
  document.getElementById('start').addEventListener('click', async () => {
    const err = document.getElementById('err');
    err.textContent = '';
    try {
      const { sampleRate } = await mic.start();
      tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.9 });
      renderMenu();
    } catch (e) {
      err.textContent = 'Не удалось получить доступ к микрофону: ' + (e?.message || e) +
        '. Проверь разрешения браузера. На телефоне нужен HTTPS.';
    }
  });
}

// ---------- Экран 2: меню ----------
function renderMenu() {
  stopRaf();
  const items = EXERCISES.map((e, i) => `
    <button class="list-item" data-ex="${i}">
      <span class="li-main">${e.label}</span>
      <span class="li-sub">${e.sub}</span>
    </button>
  `).join('');
  const breathItems = Object.entries(BREATHING).map(([k, b]) => `
    <button class="list-item" data-breath="${k}">
      <span class="li-main">🫁 ${b.title}</span>
      <span class="li-sub">${b.kind === 'exhale' ? 'замер ровного выдоха' : 'ведомое дыхание'}</span>
    </button>
  `).join('');
  const streak = progress.getStreak();
  const range = progress.getRange();
  app.innerHTML = `
    <div class="screen">
      <div class="brand"><h1>Распевка</h1>
        ${streak > 0 ? `<p class="streak-line">🔥 Стрик: ${streak} ${streak === 1 ? 'день' : 'дн.'}</p>` : ''}
      </div>
      <button class="btn btn-primary" id="session" style="width:100%">▶ Полная распевка (5 упражнений)</button>
      <div class="card list">
        <button class="list-item" data-onboard="1">
          <span class="li-main">🎚 Настроить диапазон</span>
          <span class="li-sub">${range ? 'диапазон записан · перенастроить' : 'найди свои низ и верх — упражнения подстроятся'}</span>
        </button>
        <button class="list-item" data-tuner="1">
          <span class="li-main">🎯 Живой тюнер</span>
          <span class="li-sub">проверь, как тебя слышит микрофон</span>
        </button>
        <div class="list-sep">Дыхание</div>
        ${breathItems}
        <div class="list-sep">Отдельные упражнения</div>
        ${items}
      </div>
      <p class="hint">Совет: начни с дыхания и диапазона, потом — полная распевка. Она разогреет голос по правильному порядку.</p>
    </div>
  `;
  document.getElementById('session').addEventListener('click', () => {
    const p = progress.load();
    if (p.safetyAccepted) {
      renderSession(app, mic, tracker, { onExit: renderMenu });
    } else {
      renderSafety(() => renderSession(app, mic, tracker, { onExit: renderMenu }));
    }
  });
  app.querySelector('[data-onboard]').addEventListener('click', () => {
    renderOnboarding(app, mic, tracker, { onDone: renderMenu, onExit: renderMenu });
  });
  app.querySelector('[data-tuner]').addEventListener('click', renderTuner);
  app.querySelectorAll('[data-ex]').forEach((btn) => {
    btn.addEventListener('click', () => startExercise(Number(btn.dataset.ex)));
  });
  app.querySelectorAll('[data-breath]').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderBreathing(app, mic, btn.dataset.breath, { onExit: renderMenu });
    });
  });
}

function startExercise(i, explain = true) {
  const exercise = EXERCISES[i].make();
  renderGame(app, mic, tracker, exercise, {
    explain,
    onExit: renderMenu,
    onAgain: () => startExercise(i, false),
  });
}

// ---------- Дисклеймер здоровья голоса (один раз) ----------
function renderSafety(onAccept) {
  stopRaf();
  app.innerHTML = `
    <div class="screen">
      <div class="brand"><h1>Береги голос</h1></div>
      <div class="card">
        <ul class="safety-list">
          <li><b>Больно — остановись.</b> Любой дискомфорт в горле = стоп и отдых.</li>
          <li><b>Разогрев обязателен.</b> Не начинай с высоких или быстрых упражнений.</li>
          <li><b>Не форсируй верх.</b> Расширение диапазона — это недели, не один день.</li>
          <li><b>Не пой на больном горле.</b> Связки отекают — высок риск травмы.</li>
          <li><b>Пей воду</b> и делай перерывы — не больше 20–30 минут подряд.</li>
        </ul>
        <p class="hint" style="margin-top:14px">
          Приложение помогает тренироваться, но <b>не заменяет педагога или фониатра</b>.
          При проблемах с голосом обратись к специалисту.
        </p>
        <button class="btn btn-primary" id="accept" style="width:100%;margin-top:18px">Понятно, начать</button>
      </div>
    </div>
  `;
  document.getElementById('accept').addEventListener('click', () => {
    progress.save({ ...progress.load(), safetyAccepted: true });
    onAccept();
  });
}

// ---------- Экран 3: живой тюнер ----------
function renderTuner() {
  stopRaf();
  app.innerHTML = `
    <div class="screen tuner">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="note-display silent" id="note">—</div>
      <div class="cents-row"><span id="centsTxt">центы: 0</span></div>
      <div class="cents-meter"><div class="cents-needle" id="needle"></div></div>
      <div class="readout">
        <span><b id="hz">0</b> Гц</span>
        <span>чистота <b id="clarity">0%</b></span>
      </div>
      <div class="bar"><i id="vol"></i></div>
      <div class="trace-wrap"><canvas class="trace" id="trace"></canvas></div>
      <p class="hint">Спой устойчивую ноту — увидишь её название и точность. Зелёный = ±20 центов.</p>
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

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('back').addEventListener('click', renderMenu);

  const history = [];
  const noteLines = [
    { hz: 65.41, name: 'C2' }, { hz: 130.81, name: 'C3' },
    { hz: 261.63, name: 'C4' }, { hz: 523.25, name: 'C5' }, { hz: 1046.5, name: 'C6' },
  ];
  tracker.reset();

  function loop() {
    const buf = mic.read();
    if (buf) {
      const { smoothedHz, clarity, voiced } = tracker.process(buf);
      volEl.style.width = Math.min(100, mic.rms() * 350) + '%';
      clarityEl.textContent = Math.round(clarity * 100) + '%';
      if (voiced && smoothedHz) {
        const info = hzToNoteInfo(smoothedHz);
        const zone = centsZone(Math.abs(info.cents));
        const m = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
        noteEl.className = 'note-display ' + zone;
        noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
        centsTxt.textContent = `центы: ${info.cents > 0 ? '+' : ''}${info.cents}`;
        hzEl.textContent = smoothedHz.toFixed(1);
        needle.style.left = (50 + Math.max(-50, Math.min(50, info.cents))) + '%';
        needle.style.background = `var(--${zone})`;
        history.push({ y: hzToY(smoothedHz, canvas.clientHeight), zone, voiced: true });
      } else {
        noteEl.className = 'note-display silent';
        noteEl.textContent = '—';
        history.push({ y: null, zone: null, voiced: false });
      }
      while (history.length > canvas.clientWidth) history.shift();
    }
    drawTrace(ctx, canvas, history, noteLines);
    rafId = requestAnimationFrame(loop);
  }
  loop();
}

function drawTrace(ctx, canvas, history, noteLines) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px Inter, sans-serif';
  noteLines.forEach((ln) => {
    const y = hzToY(ln.hz, h);
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillText(ln.name, 6, y - 4);
  });
  const zoneColor = { green: '#34dd98', yellow: '#f3c45c', red: '#ff6f61' };
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

function stopRaf() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

renderWelcome();
