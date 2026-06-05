// main.js — точка входа. MVP: приветствие → меню → (тюнер | упражнение) → итог.
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, hzToY, centsZone, midiToHz } from './theory/note-map.js';
import { renderGame } from './screens/game.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump, hum3, lipTrill, transposePlan, vowelChain, jumpToFifth, ladVocalise } from './theory/exercises.js';
import { renderSession } from './screens/session.js';
import { renderVoice } from './screens/voice.js';
import { renderDashboard } from './screens/progress-dash.js';
import { renderFreesing } from './screens/freesing.js';
import { getVoiceType } from './theory/voice-types.js';
import { renderBreathing, BREATHING } from './screens/breathing.js';
import { renderRhythm, RHYTHM } from './screens/rhythm.js';
import { renderTheory } from './screens/theory.js';
import { renderEar } from './screens/ear-training.js';
import { renderPath } from './screens/path.js';
import { SONGS, songMidis } from './theory/songs.js';
import { renderModesPicker } from './screens/modes-picker.js';
import { getMode } from './theory/modes.js';
import { contourGlyph } from './ui/illustrations.js';
import * as progress from './state/progress.js';

const app = document.getElementById('app');
const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let rafId = null;

// Корневой тон по умолчанию (C4) — если тип голоса не задан.
const DEFAULT_ROOT = 60;

const EXERCISES = [
  { label: 'Мычание по гамме', sub: '«М» · I-II-III-II-I', ic: 'lips', make: (r) => hum3(r) },
  { label: 'Губной тренаж «brrr»', sub: 'brrr / «Р» · 5 нот + квинта', ic: 'wave', make: (r) => lipTrill(r) },
  { label: 'Удержание ноты', sub: 'держать ровный звук', ic: 'fork', make: (r) => sustain(r, 8) },
  { label: 'Гамма «Ма-Мэ»', sub: 'попадать в ноты гаммы', ic: 'stairs', make: (r) => fiveNoteScale(r) },
  { label: 'Беглость «Ма»', sub: 'быстрые ноты — как в рекламе', ic: 'bolt', make: (r) => agilityRun(r) },
  { label: 'Октавный скачок', sub: 'прыжок на октаву и назад', ic: 'arrows', make: (r) => octaveJump(r) },
  { label: 'Цепочка гласных', sub: 'Ми-Ме-Ма · выравнивание', ic: 'lips', make: (r) => vowelChain(r) },
  { label: 'Скачок к V ступени', sub: 'Ям · атака интервала', ic: 'arrows', make: (r) => jumpToFifth(r) },
  { label: 'Ладовая «ЯМ»', sub: 'гамма лада вверх-вниз', ic: 'stairs', make: (r) => ladVocalise(r, progress.getModeKey()) },
];

// Корень упражнений из центра типа голоса (иначе C4).
function voiceRoot() {
  const v = progress.getVoice();
  const t = v && getVoiceType(v.key);
  return t ? t.center : DEFAULT_ROOT;
}

// Рабочий диапазон голоса (для транспозиции повторов): из теста или из типа.
function voiceRange() {
  const v = progress.getVoice();
  const t = v && getVoiceType(v.key);
  if (v && v.low != null && v.high != null) return { low: v.low, high: v.high };
  if (t) return { low: t.low, high: t.high };
  return { low: 48, high: 72 };
}

// Сузить диапазон детекции под голос — режет октавные ошибки и шум.
function applyTrackerRange() {
  if (!tracker) return;
  const v = progress.getVoice();
  const t = v && getVoiceType(v.key);
  if (t) tracker.setRange(midiToHz(t.low - 5), midiToHz(t.high + 5));
  else tracker.setRange(60, 1200);
}

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
        <button class="btn btn-primary" id="start" style="width:100%"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:7px"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>Разрешить микрофон</button>
      </div>
      <p class="hint" id="err"></p>
    </div>
  `;
  document.getElementById('start').addEventListener('click', async () => {
    const err = document.getElementById('err');
    err.textContent = '';
    try {
      const { sampleRate } = await mic.start();
      tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.85 });
      mic.setSensitivity(progress.getSensitivity());
      // Первый запуск без типа голоса — предложим определить (можно пропустить).
      if (progress.getVoice()) {
        applyTrackerRange();
        renderMenu();
      } else {
        renderVoice(app, mic, tracker, {
          onDone: () => { applyTrackerRange(); renderMenu(); },
          onExit: renderMenu,
          canSkip: true,
        });
      }
    } catch (e) {
      err.textContent = 'Не удалось получить доступ к микрофону: ' + (e?.message || e) +
        '. Проверь разрешения браузера. На телефоне нужен HTTPS.';
    }
  });
}

// Маленькие линейные иконки (наследуют currentColor).
function icon(name) {
  const p = {
    mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    tuner: '<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',
    wave: '<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',
    note: '<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',
    lips: '<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',
    fork: '<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',
    stairs: '<path d="M3 19h4v-4h4v-4h4V7h4"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    arrows: '<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>',
  }[name] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}
function flameSvg() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>';
}
const dayWord = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : 'дн.');

// ---------- Экран 2: меню (домашний) ----------
function renderMenu() {
  stopRaf();
  // Распевки — сетка карточек с РИСУНКОМ МЕЛОДИИ (наглядно «куда ведёт» голос).
  const exCards = EXERCISES.map((e, i) => {
    const midis = e.make(60).notes.map((n) => n.midi); // форма от фикс. тоники (root не влияет на рисунок)
    return `
    <button class="ex-tile" data-ex="${i}">
      ${contourGlyph(midis)}
      <span class="ex-tile-main">${e.label}</span>
      <span class="ex-tile-sub">${e.sub}</span>
    </button>`;
  }).join('');
  // Дыхание/артикуляция — тонкие компактные строки.
  const breathThin = Object.entries(BREATHING).map(([k, b]) => `
    <button class="thin-item" data-breath="${k}"><span>${b.title}</span><span class="thin-sub">${b.kind === 'exhale' ? 'выдох' : 'дыхание'}</span></button>
  `).join('');
  const rhythmThin = Object.entries(RHYTHM).map(([k, r]) => `
    <button class="thin-item" data-rhythm="${k}"><span>${r.name}</span><span class="thin-sub">метроном</span></button>
  `).join('');
  const songCards = SONGS.map((s, i) => `
    <button class="ex-tile" data-song="${i}">
      ${contourGlyph(songMidis(s))}
      <span class="ex-tile-main">${s.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join('');
  const streak = progress.getStreak();
  const voice = progress.getVoice();
  const vType = voice && getVoiceType(voice.key);
  // «Сегодня»: сделана ли тренировка сегодня + ротация «фокуса дня»
  const today = new Date().toISOString().slice(0, 10);
  const todayDone = progress.getHistory().some((h) => h.date === today);
  const _d = new Date();
  const focusIdx = (_d.getDate() + _d.getMonth()) % EXERCISES.length;
  const focus = EXERCISES[focusIdx];
  const modeName = getMode(progress.getModeKey()).name;
  app.innerHTML = `
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        ${streak > 0 ? `<div class="streak-chip">${flameSvg()} ${streak} ${dayWord(streak)}</div>` : ''}
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${todayDone ? `Сегодня выполнено ✓${streak > 0 ? ` · стрик ${streak} ${dayWord(streak)}` : ''} — возвращайся завтра` : 'Дыхание → распевка · ~10 минут'}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${focus.label}</b></span>
        <span class="fc-go">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${icon('wave')}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${icon('mic')}<span class="tile-main">Мой голос</span><span class="tile-sub">${vType ? vType.name : 'определить'}</span></button>
        <button class="tile" data-dash="1">${icon('chart')}<span class="tile-main">Прогресс</span><span class="tile-sub">${streak > 0 ? streak + ' ' + dayWord(streak) + ' подряд' : 'статистика'}</span></button>
      </div>

      <section class="home-sec">
        <div class="sec-title">Распевки</div>
        <div class="ex-grid">${exCards}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Дыхание и артикуляция</div>
        <div class="thin-list">${rhythmThin}${breathThin}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Курс и развитие</div>
        <div class="thin-list">
          <button class="thin-item" data-path><span>Путь обучения</span><span class="thin-sub">по шагам</span></button>
          <button class="thin-item" data-ear><span>Спой за мной</span><span class="thin-sub">тренировка слуха</span></button>
          <button class="thin-item" data-theory><span>Теория голоса</span><span class="thin-sub">карточки</span></button>
          <button class="thin-item" data-modes><span>Лад распевок</span><span class="thin-sub">${modeName}</span></button>
        </div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Песни</div>
        <div class="ex-grid">${songCards}</div>
      </section>
      <p class="hint">Темп и «подсказку тоном» настраивай прямо в упражнении — значок ⚙.</p>
    </div>
  `;
  document.getElementById('session').addEventListener('click', () => {
    applyTrackerRange();
    const go = () => renderSession(app, mic, tracker, { onExit: renderMenu });
    if (progress.load().safetyAccepted) go();
    else renderSafety(go);
  });
  const focusBtn = app.querySelector('[data-focus]');
  if (focusBtn) focusBtn.addEventListener('click', () => startExercise(focusIdx));
  app.querySelector('[data-voice]').addEventListener('click', () => {
    renderVoice(app, mic, tracker, {
      onDone: () => { applyTrackerRange(); renderMenu(); },
      onExit: renderMenu,
    });
  });
  app.querySelector('[data-dash]').addEventListener('click', () => renderDashboard(app, { onExit: renderMenu }));
  app.querySelector('[data-freesing]').addEventListener('click', () => {
    const r = voiceRange();
    renderFreesing(app, mic, tracker, {
      onExit: () => { applyTrackerRange(); renderMenu(); },
      lowMidi: r.low, highMidi: r.high,
    });
  });
  app.querySelectorAll('[data-ex]').forEach((btn) => {
    btn.addEventListener('click', () => startExercise(Number(btn.dataset.ex)));
  });
  app.querySelectorAll('[data-breath]').forEach((btn) => {
    btn.addEventListener('click', () => renderBreathing(app, mic, btn.dataset.breath, { onExit: renderMenu }));
  });
  app.querySelectorAll('[data-rhythm]').forEach((btn) => {
    btn.addEventListener('click', () => renderRhythm(app, mic, voiceRoot(), RHYTHM[btn.dataset.rhythm], { onExit: renderMenu }));
  });
  const pathBtn = app.querySelector('[data-path]');
  if (pathBtn) pathBtn.addEventListener('click', renderPathScreen);
  const earBtn = app.querySelector('[data-ear]');
  if (earBtn) earBtn.addEventListener('click', () => { applyTrackerRange(); renderEar(app, mic, tracker, { onExit: renderMenu, root: voiceRoot() }); });
  const theoryBtn = app.querySelector('[data-theory]');
  if (theoryBtn) theoryBtn.addEventListener('click', () => renderTheory(app, { onExit: renderMenu }));
  const modesBtn = app.querySelector('[data-modes]');
  if (modesBtn) modesBtn.addEventListener('click', renderModesScreen);
  app.querySelectorAll('[data-song]').forEach((btn) => {
    btn.addEventListener('click', () => startSong(Number(btn.dataset.song)));
  });
}

function startExercise(i, explain = true) {
  applyTrackerRange();
  const exercise = EXERCISES[i].make(voiceRoot());
  const r = voiceRange();
  const reps = transposePlan(exercise, r.low, r.high, 4); // вверх до верха и вниз
  // Темп применяется внутри renderGame по текущей сложности (динамично).
  renderGame(app, mic, tracker, exercise, {
    explain,
    reps,
    onExit: renderMenu,
    onAgain: () => startExercise(i, false),
  });
}

function startSong(i, explain = true) {
  applyTrackerRange();
  const ex = SONGS[i].make(voiceRoot());
  renderGame(app, mic, tracker, ex, {
    explain, reps: [0], onExit: renderMenu, onAgain: () => startSong(i, false),
  });
}

function renderModesScreen() {
  stopRaf();
  renderModesPicker(app, { onExit: renderMenu });
}

function renderPathScreen() {
  stopRaf();
  renderPath(app, {
    onExit: renderMenu,
    onRun: launchLesson,
    completed: progress.getCompletedLessons(),
  });
}

function launchLesson(lesson) {
  applyTrackerRange();
  const back = () => { progress.markLessonDone(lesson.id); renderPathScreen(); };
  if (lesson.type === 'breath') {
    renderBreathing(app, mic, lesson.key, { onExit: back });
  } else if (lesson.type === 'ex') {
    const ex = EXERCISES[lesson.key].make(voiceRoot());
    renderGame(app, mic, tracker, ex, { explain: true, reps: [0], onExit: back, onAgain: () => launchLesson(lesson) });
  } else if (lesson.type === 'song') {
    const ex = SONGS[lesson.key].make(voiceRoot());
    renderGame(app, mic, tracker, ex, { explain: true, reps: [0], onExit: back, onAgain: () => launchLesson(lesson) });
  }
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
  applyTrackerRange();
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
    ctx.strokeStyle = 'rgba(27,36,48,.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = 'rgba(27,36,48,.4)';
    ctx.fillText(ln.name, 6, y - 4);
  });
  const zoneColor = { green: '#12a36b', yellow: '#d98a00', red: '#e0544b' };
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
