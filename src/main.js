// main.js — точка входа. MVP: приветствие → меню → (тюнер | упражнение) → итог.
import { MicEngine } from './audio/mic.js';
import { PitchTracker } from './audio/pitch-detector.js';
import { hzToNoteInfo, hzToY, centsZone, midiToHz } from './theory/note-map.js';
import { renderGame } from './screens/game.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump, hum3, lipTrill, transposePlan, vowelChain, jumpToFifth, ladVocalise, vibratoHold, vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles, vibratoWobble, timbreVocalise, timbreShift, registerArp, registerOctave, beltScale, beltOctave, articStaccato, articGroups, resistTurn, resistRun } from './theory/exercises.js';
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
import { renderCatalog, renderBlockDetail } from './screens/catalog.js';
import { renderRecorder } from './screens/recorder.js';
import { renderBackingSong } from './screens/backing-song.js';
import { renderLeadForm } from './screens/lead-form.js';
import { BLOCKS, EX_MAKERS } from './theory/curriculum.js';
import { renderSettings } from './screens/settings.js';
import { renderCalibrate } from './screens/calibrate.js';
import { renderDevPanel } from './screens/dev-panel.js';
import { renderPaywall } from './screens/paywall.js';
import { renderGuide } from './screens/guide.js';
import { setOutputVolume } from './audio/reference-tone.js';
import { getMode } from './theory/modes.js';
import { contourGlyph } from './ui/illustrations.js';
import * as progress from './state/progress.js';
import * as clock from './state/clock.js';

const app = document.getElementById('app');
const mic = new MicEngine({ fftSize: 2048 });
let tracker = null;
let rafId = null;

// Корневой тон по умолчанию (C4) — если тип голоса не задан.
const DEFAULT_ROOT = 60;

// Ладозависимые упражнения берут текущий лад (progress.getModeKey()) → выбор лада
// реально меняет все гаммовые распевки (а не одну), что и даёт ценность тарифу Pro.
// cat — категория для группировки «Свободной практики» на главной.
// ВАЖНО: порядок/индексы НЕ менять — на них ссылаются уроки «Пути» (path.js).
const EXERCISES = [
  { label: 'Мычание по гамме', sub: '«М» · I-II-III-II-I', ic: 'lips', cat: 'warm', make: (r) => hum3(r, progress.getModeKey()) },
  { label: 'Губной тренаж «brrr»', sub: 'brrr / «Р» · 5 нот + квинта', ic: 'wave', cat: 'warm', make: (r) => lipTrill(r, progress.getModeKey()) },
  { label: 'Удержание ноты', sub: 'держать ровный звук', ic: 'fork', cat: 'warm', make: (r) => sustain(r, 8) },
  { label: 'Гамма «Ма-Мэ»', sub: 'попадать в ноты гаммы', ic: 'stairs', cat: 'pitch', make: (r) => fiveNoteScale(r, progress.getModeKey()) },
  { label: 'Беглость «Ма»', sub: 'быстрые ноты — как в рекламе', ic: 'bolt', cat: 'pitch', make: (r) => agilityRun(r, progress.getModeKey()) },
  { label: 'Октавный скачок', sub: 'прыжок на октаву и назад', ic: 'arrows', cat: 'pitch', make: (r) => octaveJump(r) },
  { label: 'Цепочка гласных', sub: 'Ми-Ме-Ма · выравнивание', ic: 'lips', cat: 'vowel', make: (r) => vowelChain(r, progress.getModeKey()) },
  { label: 'Calm Down Vowels', sub: 'И-Э-А-О-У · позиция', ic: 'lips', cat: 'vowel', make: (r) => vowelHold(r) },
  { label: 'Disco Vowels', sub: 'И-Э-А-О-У · точность', ic: 'stairs', cat: 'vowel', make: (r) => vowelScale(r, progress.getModeKey()) },
  { label: 'James Charles Warm Up', sub: 'гласные + Ми-Ме-Ма', ic: 'wave', cat: 'vowel', make: (r) => jamesCharles(r, progress.getModeKey()) },
  { label: 'High Five', sub: 'И-Э-А-О-У · подъём', ic: 'arrows', cat: 'vowel', make: (r) => vowelClimb(r, progress.getModeKey()) },
  { label: 'No Bubble Gum', sub: 'гибкость на гласных', ic: 'bolt', cat: 'vowel', make: (r) => vowelAgility(r, progress.getModeKey()) },
  { label: 'Скачок к V ступени', sub: 'Ям · атака интервала', ic: 'arrows', cat: 'pitch', make: (r) => jumpToFifth(r, progress.getModeKey()) },
  { label: 'Ладовая «ЯМ»', sub: 'гамма лада вверх-вниз', ic: 'stairs', cat: 'pitch', make: (r) => ladVocalise(r, progress.getModeKey()) },
  { label: 'Вибрато', sub: 'ровная волна голосом', ic: 'wave', cat: 'vib', make: (r) => vibratoHold(r) },
  { label: 'Раскачка вибрато', sub: 'А · запуск вибрато', ic: 'wave', cat: 'vib', make: (r) => vibratoWobble(r) },
  { label: 'Тёплый тон', sub: 'Мо · качество тембра', ic: 'fork', cat: 'vib', make: (r) => timbreVocalise(r) },
  { label: 'Ровный тон на двух', sub: 'А · единый тембр', ic: 'fork', cat: 'vib', make: (r) => timbreShift(r) },
  { label: 'Через регистры', sub: 'Но · passaggio', ic: 'arrows', cat: 'reg', make: (r) => registerArp(r) },
  { label: 'Октавная связка', sub: 'А · соединить регистры', ic: 'arrows', cat: 'reg', make: (r) => registerOctave(r) },
  { label: 'Белтинг — гамма', sub: 'Эй · яркая подача', ic: 'bolt', cat: 'reg', make: (r) => beltScale(r) },
  { label: 'Белт — октава', sub: 'Эй · опёртый верх', ic: 'arrows', cat: 'reg', make: (r) => beltOctave(r) },
  { label: 'Чёткое стаккато', sub: 'Та · артикуляция', ic: 'bolt', cat: 'artic', make: (r) => articStaccato(r) },
  { label: 'Слоги по группам', sub: 'Та-Ка · дикция', ic: 'lips', cat: 'artic', make: (r) => articGroups(r) },
  { label: 'Стамина-фигура', sub: 'Ма · выносливость', ic: 'stairs', cat: 'artic', make: (r) => resistTurn(r) },
  { label: 'Выносливая гамма', sub: 'Ма · длинный пробег', ic: 'stairs', cat: 'artic', make: (r) => resistRun(r) },
];

// Категории «Свободной практики» (порядок показа на главной).
const CATS = [
  ['warm', 'Разогрев'],
  ['vowel', 'Гласные'],
  ['pitch', 'Точность и гибкость'],
  ['vib', 'Вибрато и тембр'],
  ['reg', 'Регистры и сила'],
  ['artic', 'Дикция и выносливость'],
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

// ---------- Экран загрузки: приободряющие фразы (как в играх) ----------
const SPLASH_TIPS = [
  'Голос — это мышца. Сегодня сделаем её сильнее.',
  'Дыши животом — и звук польётся сам.',
  'Чисто — не значит громко. Решает точность.',
  'Каждая распевка чуть-чуть расширяет диапазон.',
  'Расслабь челюсть и плечи — голос любит свободу.',
  'Лучшие певцы тоже начинали с простого «мычания».',
  'Тёплый голос начинается с тёплого дыхания.',
  'Не тянись за верхней нотой горлом — она придёт сама.',
  '5 минут каждый день дают больше, чем час раз в неделю.',
  'Улыбнись — и тембр станет светлее.',
  'Зевни перед распевкой — гортань скажет спасибо.',
  'Пой так, будто тебя уже любят слушать.',
];

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Приложение открывается СРАЗУ — без гейта микрофона. Микрофон включается внутри
// яркой плавающей кнопкой (или автоматически при входе в поющий экран — это жест).
function renderSplash() {
  stopRaf();
  const tips = shuffled(SPLASH_TIPS);
  app.innerHTML = `
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${tips[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;
  // Одна спокойная фраза на запуск (разная каждый раз) — чтобы глаз успел прочитать,
  // без мельтешения. Сама фраза мягко появляется вместе со сплэшем.
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(bootToMenu, reduced ? 1600 : 2800);
}

function bootToMenu() {
  setupMicFab();
  // Тест-режим по URL (?dev=1) — для QA-прогонов.
  try { if (new URLSearchParams(location.search).has('dev')) progress.setDevMode(true); } catch (e) { /* ok */ }
  // Первый запуск: «магия за минуту» — определить голос до меню (главное первое впечатление).
  if (!progress.getVoice() && !progress.load().welcomed) { renderWelcome(); return; }
  renderMenu();
}

// ---------- Приветствие первого запуска (magic-demo) ----------
function renderWelcome() {
  stopRaf();
  app.innerHTML = `
    <div class="screen welcome">
      <div class="brand">
        <div class="eq eq-static" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1>Привет! Это «Распевка»</h1>
        <p>Игровой тренажёр голоса: пой — и смотри, как твой голос попадает в ноты. Начнём с волшебного: за минуту узнаем твой тембр голоса и диапазон.</p>
      </div>
      <button class="btn btn-primary" id="wlc-go" style="width:100%">🎤 Определить мой голос · 1 минута</button>
      <button class="btn btn-ghost" id="wlc-skip" style="width:100%">Сначала осмотрюсь</button>
      <p class="hint">Понадобится доступ к микрофону — мы слушаем только высоту тона, ничего не записываем и не отправляем.</p>
    </div>
  `;
  const markWelcomed = () => progress.save({ ...progress.load(), welcomed: true });
  document.getElementById('wlc-skip').addEventListener('click', () => { markWelcomed(); renderMenu(); });
  document.getElementById('wlc-go').addEventListener('click', () => {
    markWelcomed();
    enterMic(() => renderVoice(app, mic, tracker, {
      onDone: () => { applyTrackerRange(); renderFirstExercise(); },
      onExit: renderMenu,
    }));
  });
}

// После определения голоса — сразу первая распевка (момент успеха, не возврат в меню).
function renderFirstExercise() {
  stopRaf();
  app.innerHTML = `
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `;
  document.getElementById('fe-go').addEventListener('click', () => startExercise(0));
  document.getElementById('fe-guide').addEventListener('click', renderGuideScreen);
  document.getElementById('fe-menu').addEventListener('click', renderMenu);
}

// ---------- Микрофон: ленивое включение + постоянная кнопка ----------
let micState = 'off'; // 'off' | 'listening' | 'denied'

async function ensureMic() {
  try {
    if (!mic.ready) {
      mic.setAGC(progress.getMicAGC()); // применится в start()
      const { sampleRate } = await mic.start();
      if (!tracker) tracker = new PitchTracker(sampleRate, { fftSize: 2048, minClarity: 0.85 });
      mic.setSensitivity(progress.getSensitivity());
      setOutputVolume(progress.getVolumeMult());
      applyTrackerRange();
    }
    micState = 'listening';
    setMicFab();
    return true;
  } catch (e) {
    micState = 'denied';
    setMicFab();
    return false;
  }
}

async function toggleMic() {
  if (micState === 'listening') {
    try { await mic.suspend(); } catch (e) { /* ok */ }
    micState = 'off';
    setMicFab();
  } else {
    await ensureMic();
  }
}

function setupMicFab() {
  const fab = document.getElementById('mic-fab');
  if (!fab) return;
  fab.hidden = false;
  if (!fab.__wired) { fab.addEventListener('click', toggleMic); fab.__wired = true; }
  setMicFab();
}

function setMicFab() {
  const fab = document.getElementById('mic-fab');
  if (!fab) return;
  fab.className = 'mic-fab ' + micState;
  const txt = fab.querySelector('.mic-fab-txt');
  if (txt) txt.textContent = micState === 'listening' ? 'Слушаю' : micState === 'denied' ? 'Нет доступа · нажми' : 'Включить микрофон';
  fab.setAttribute('aria-pressed', micState === 'listening' ? 'true' : 'false');
}

// Войти в «поющий» экран: гарантируем микрофон (клик — это жест), иначе мягкий экран-подсказка.
async function enterMic(fn) {
  const ok = await ensureMic();
  if (!ok) { renderMicGate(fn); return; }
  fn();
}

function renderMicGate(retry) {
  stopRaf();
  app.innerHTML = `
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `;
  document.getElementById('back').addEventListener('click', renderMenu);
  document.getElementById('grant').addEventListener('click', () => enterMic(retry));
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
  // Распевки — карточки с РИСУНКОМ МЕЛОДИИ, сгруппированы по категориям
  // в горизонтальные ленты (главная остаётся короткой, а выбор — большим).
  const exTile = (e, i) => {
    const notes = e.make(60).notes; // форма от фикс. тоники (root не влияет на рисунок)
    return `
    <button class="ex-tile" data-ex="${i}">
      ${contourGlyph(notes)}
      <span class="ex-tile-main">${e.label}</span>
      <span class="ex-tile-sub">${e.sub}</span>
    </button>`;
  };
  const practiceRows = CATS.map(([key, title]) => {
    const tiles = EXERCISES.map((e, i) => (e.cat === key ? exTile(e, i) : '')).join('');
    return `<div class="cat-title">${title}</div><div class="ex-row">${tiles}</div>`;
  }).join('');
  // Программа обучения — главный путь: куда идти дальше.
  const examsPassed = progress.getExamsPassed();
  const nextBlockIdx = BLOCKS.findIndex((b) => !examsPassed.includes(b.id));
  const progPct = Math.round((examsPassed.length / BLOCKS.length) * 100);
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
  // «Сегодня»: сделана ли тренировка сегодня + ротация «фокуса дня» (время — через clock,
  // чтобы тест-режим мог перематывать дни).
  const todayDone = progress.isDailyDone();
  const _d = clock.today();
  const focusIdx = (_d.getDate() + _d.getMonth()) % EXERCISES.length;
  const focus = EXERCISES[focusIdx];
  const modeName = getMode(progress.getModeKey()).name;
  const energy = progress.getEnergy();
  const maxE = progress.getMaxEnergy();
  app.innerHTML = `
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${energy}/${maxE}</div>
          ${streak > 0 ? `<div class="streak-chip" title="Стрик: ${streak} ${dayWord(streak)} подряд">${flameSvg()} ${streak}</div>` : ''}
          ${progress.getFreezes() > 0 ? `<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${progress.getFreezes()}</div>` : ''}
          ${progress.getDevMode() ? '<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>' : ''}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${todayDone ? `Сегодня выполнено ✓${streak > 0 ? ` · стрик ${streak} ${dayWord(streak)}` : ''} — возвращайся завтра` : 'Дыхание → распевка · ~10 минут'}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="hero-card program-card" data-path>
        <div class="hero-eyebrow">Программа обучения</div>
        <div class="hero-title pc-title">${nextBlockIdx === -1 ? 'Все блоки пройдены! 🏆' : `Блок ${nextBlockIdx + 1} · ${BLOCKS[nextBlockIdx].title}`}</div>
        <div class="prog-bar pc-bar"><i style="width:${progPct}%"></i></div>
        <div class="hero-sub">${examsPassed.length} / ${BLOCKS.length} блоков · каждый завершается экзаменом</div>
        <span class="hero-arrow">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${icon('wave')}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${icon('mic')}<span class="tile-main">Мой голос</span><span class="tile-sub">${vType ? vType.name : 'определить'}</span></button>
        <button class="tile" data-dash="1">${icon('chart')}<span class="tile-main">Прогресс</span><span class="tile-sub">${streak > 0 ? streak + ' ' + dayWord(streak) + ' подряд' : 'статистика'}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${focus.label}</b></span>
        <span class="fc-go">→</span>
      </button>

      <section class="home-sec">
        <div class="sec-title">Свободная практика</div>
        ${practiceRows}
      </section>
      <section class="home-sec">
        <div class="sec-title">Дыхание и ритм</div>
        <div class="thin-list">${rhythmThin}${breathThin}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Песни</div>
        <div class="ex-row">${songCards}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Инструменты</div>
        <div class="thin-list">
          <button class="thin-item" data-ear><span>Спой за мной</span><span class="thin-sub">тренировка слуха</span></button>
          <button class="thin-item" data-theory><span>Теория голоса</span><span class="thin-sub">карточки</span></button>
          <button class="thin-item" data-record><span>Запись голоса</span><span class="thin-sub">послушай себя</span></button>
          <button class="thin-item" data-backing><span>Пой под фонограмму</span><span class="thin-sub">распевка с повышением</span></button>
          <button class="thin-item" data-modes><span>Лад распевок</span><span class="thin-sub">${modeName}</span></button>
        </div>
      </section>
      <button class="thin-item thin-cta" data-teacher style="width:100%"><span>Урок с живым педагогом</span><span class="thin-sub">бесплатный пробный →</span></button>
      <p class="hint">Темп и «подсказку тоном» настраивай прямо в упражнении — значок ⚙.</p>
    </div>
    <!-- вне .screen: у неё transform от entrance-анимации, который ломает position:fixed -->
    <button class="guide-fab" data-guide aria-label="Подсказки" title="Как тут всё устроено">💡</button>
  `;
  document.getElementById('session').addEventListener('click', () => {
    const go = () => enterMic(() => { applyTrackerRange(); renderSession(app, mic, tracker, { onExit: renderMenu }); });
    if (progress.load().safetyAccepted) go();
    else renderSafety(go);
  });
  const focusBtn = app.querySelector('[data-focus]');
  if (focusBtn) focusBtn.addEventListener('click', () => startExercise(focusIdx));
  app.querySelector('[data-voice]').addEventListener('click', () => {
    enterMic(() => renderVoice(app, mic, tracker, {
      onDone: () => { applyTrackerRange(); renderMenu(); },
      onExit: renderMenu,
    }));
  });
  app.querySelector('[data-dash]').addEventListener('click', () => renderDashboard(app, { onExit: renderMenu }));
  app.querySelector('[data-freesing]').addEventListener('click', () => {
    enterMic(() => {
      const r = voiceRange();
      renderFreesing(app, mic, tracker, {
        onExit: () => { applyTrackerRange(); renderMenu(); },
        lowMidi: r.low, highMidi: r.high,
      });
    });
  });
  app.querySelectorAll('[data-ex]').forEach((btn) => {
    btn.addEventListener('click', () => startExercise(Number(btn.dataset.ex)));
  });
  app.querySelectorAll('[data-breath]').forEach((btn) => {
    btn.addEventListener('click', () => enterMic(() => renderBreathing(app, mic, btn.dataset.breath, { onExit: renderMenu })));
  });
  app.querySelectorAll('[data-rhythm]').forEach((btn) => {
    btn.addEventListener('click', () => renderRhythm(app, mic, voiceRoot(), RHYTHM[btn.dataset.rhythm], { onExit: renderMenu }));
  });
  const pathBtn = app.querySelector('[data-path]');
  if (pathBtn) pathBtn.addEventListener('click', renderCatalogScreen);
  const earBtn = app.querySelector('[data-ear]');
  if (earBtn) earBtn.addEventListener('click', () => enterMic(() => { applyTrackerRange(); renderEar(app, mic, tracker, { onExit: renderMenu, root: voiceRoot() }); }));
  const theoryBtn = app.querySelector('[data-theory]');
  if (theoryBtn) theoryBtn.addEventListener('click', () => renderTheory(app, { onExit: renderMenu }));
  const recBtn = app.querySelector('[data-record]');
  if (recBtn) recBtn.addEventListener('click', () => enterMic(() => renderRecorder(app, mic, { onExit: renderMenu })));
  const backingBtn = app.querySelector('[data-backing]');
  if (backingBtn) backingBtn.addEventListener('click', () => enterMic(() => {
    const r = voiceRange();
    renderBackingSong(app, mic, tracker, { onExit: () => { applyTrackerRange(); renderMenu(); }, lowMidi: r.low, highMidi: r.high });
  }));
  const modesBtn = app.querySelector('[data-modes]');
  if (modesBtn) modesBtn.addEventListener('click', renderModesScreen);
  const setBtn = app.querySelector('[data-settings]');
  if (setBtn) setBtn.addEventListener('click', renderSettingsScreen);
  const teacherBtn = app.querySelector('[data-teacher]');
  if (teacherBtn) teacherBtn.addEventListener('click', () => renderSchoolInfo(renderMenu));
  app.querySelectorAll('[data-song]').forEach((btn) => {
    btn.addEventListener('click', () => startSong(Number(btn.dataset.song)));
  });
  const guideBtn = app.querySelector('[data-guide]');
  if (guideBtn) guideBtn.addEventListener('click', renderGuideScreen);
  // Тест-режим: чип 🧪 (когда включён) или 7 быстрых тапов по заголовку.
  const devBtn = app.querySelector('[data-dev]');
  if (devBtn) devBtn.addEventListener('click', renderDevScreen);
  const logo = app.querySelector('.home-head h1');
  if (logo) {
    let taps = 0, lastTap = 0;
    logo.addEventListener('click', () => {
      const t = Date.now();
      taps = t - lastTap < 600 ? taps + 1 : 1;
      lastTap = t;
      if (taps >= 7) { taps = 0; progress.setDevMode(true); renderDevScreen(); }
    });
  }
}

function renderDevScreen() {
  stopRaf();
  renderDevPanel(app, { onExit: renderMenu });
}

function renderGuideScreen() {
  stopRaf();
  renderGuide(app, { onExit: renderMenu, onSettings: renderSettingsScreen });
}

// Пейволл (показывается только при включённом флаге — см. dev-панель).
function renderPaywallScreen() {
  stopRaf();
  renderPaywall(app, {
    onExit: renderMenu,
    onTrialStarted: renderMenu,
    onTeacher: () => renderSchoolInfo(renderMenu),
  });
}

/** Гейт свободной практики: при включённом пейволле считаем распевки дня и упираемся в лимит. */
function gateUse(fn) {
  if (progress.isPaywalled()) { renderPaywallScreen(); return; }
  if (progress.getPaywallEnabled()) progress.countUse();
  fn();
}

function startExercise(i, explain = true) {
  // Повтор («Ещё раз») лимит не тратит — считаем только новые запуски.
  if (explain) { gateUse(() => startExercise2(i, explain)); return; }
  startExercise2(i, explain);
}
/**
 * Классическая схема распевки (по правке музыканта): начинаем от НИЗА диапазона
 * голоса, поднимаемся по полутонам, пока верхняя нота распевки не дойдёт до верха
 * диапазона, и возвращаемся обратно вниз. Баритон E2–E4 → старт на E2, пик E4, финиш E2.
 */
function fullRangeRun(makeFn) {
  const r = voiceRange();
  const probe = makeFn(60);
  const minOff = Math.min(...probe.notes.map((n) => n.midi)) - 60; // самая низкая нота отн. тоники
  const root = r.low - minOff;            // нижняя нота распевки = низ диапазона
  const ex = makeFn(root);
  const reps = transposePlan(ex, r.low, r.high, 48); // вверх до упора и обратно (без искусственного потолка)
  return { ex, reps };
}

function startExercise2(i, explain) {
  enterMic(() => {
    applyTrackerRange();
    const makeFn = (root) => EXERCISES[i].make(root);
    const { ex, reps } = fullRangeRun(makeFn);
    // Темп применяется внутри renderGame по текущей сложности (динамично).
    // rebuild — пересборка с актуальным ладом (выбор лада прямо на экране объяснения).
    renderGame(app, mic, tracker, ex, {
      explain,
      reps,
      rebuild: () => fullRangeRun(makeFn).ex,
      onExit: renderMenu,
      onAgain: () => startExercise(i, false),
    });
  });
}

function startSong(i, explain = true) {
  if (explain) { gateUse(() => startSong2(i, explain)); return; }
  startSong2(i, explain);
}
function startSong2(i, explain) {
  enterMic(() => {
    const ex = SONGS[i].make(voiceRoot());
    renderGame(app, mic, tracker, ex, {
      explain, reps: [0], onExit: renderMenu, onAgain: () => startSong(i, false),
    });
  });
}

function renderModesScreen() {
  stopRaf();
  renderModesPicker(app, { onExit: renderMenu });
}

// ---------- Учебная программа: каталог → блок → упражнения / экзамен ----------
function renderCatalogScreen() {
  stopRaf();
  renderCatalog(app, {
    blocks: BLOCKS,
    examsPassed: progress.getExamsPassed(),
    onExit: renderMenu,
    onOpenBlock: openBlock,
    onSchool: renderSchoolInfo,
  });
}

function openBlock(index) {
  stopRaf();
  const block = BLOCKS[index];
  renderBlockDetail(app, {
    block, index,
    examsPassed: progress.getExamsPassed(),
    doneItems: progress.getBlockItems(block.id),
    onExit: renderCatalogScreen,
    onRunItem: runBlockItem,
    onExam: runExam,
    onSchool: renderSchoolInfo,
  });
}

function runBlockItem(block, k) {
  const item = block.items[k];
  const idx = BLOCKS.indexOf(block);
  // Сопровождение по этапам (по ОС музыканта): после пункта — сразу кнопка «Дальше»
  // к следующему упражнению блока, а после последнего — к экзамену.
  const next = block.items[k + 1];
  const goNext = () => (next ? runBlockItem(block, k + 1) : runExam(block));
  enterMic(() => {
    applyTrackerRange();
    if (item.t === 'breath') {
      // дыхание не оценивается по высоте — засчитываем за выполнение и ведём дальше
      renderBreathing(app, mic, item.id, { onExit: () => { progress.markBlockItem(block.id, item.id); goNext(); } });
      return;
    }
    const exMake = (root) => EX_MAKERS[item.id](root, progress.getModeKey());
    const { ex, reps } = fullRangeRun(exMake);
    renderGame(app, mic, tracker, ex, {
      explain: true, reps,
      rebuild: () => fullRangeRun(exMake).ex,
      onResult: (agg) => { if (agg.pct >= 0.5) progress.markBlockItem(block.id, item.id); },
      onExit: () => openBlock(idx),
      onAgain: () => runBlockItem(block, k),
      nextLabel: next ? `Дальше: ${next.name}` : 'К экзамену блока',
      onNext: goNext,
    });
  });
}

function runExam(block) {
  enterMic(() => {
    applyTrackerRange();
    const ex = EX_MAKERS[block.exam.exId](voiceRoot(), progress.getModeKey());
    const r = voiceRange();
    const reps = transposePlan(ex, r.low, r.high, 2);
    renderGame(app, mic, tracker, ex, {
      explain: true, reps,
      rebuild: () => EX_MAKERS[block.exam.exId](voiceRoot(), progress.getModeKey()),
      onComplete: (agg) => renderExamResult(block, agg), // свой результат-экран экзамена
      onExit: () => openBlock(BLOCKS.indexOf(block)),
      onAgain: () => runExam(block),
    });
  });
}

function renderExamResult(block, agg) {
  stopRaf();
  const pct = Math.round(agg.pct * 100);
  const passed = agg.pct >= block.exam.pass;
  if (passed) progress.markExamPassed(block.id);
  else if (progress.getEnergy() > 0) progress.addEnergy(-1);
  const idx = BLOCKS.indexOf(block);
  const nextUnlocked = passed && idx + 1 < BLOCKS.length;
  const col = passed ? 'var(--green)' : 'var(--coral)';
  app.innerHTML = `
    <div class="screen summary">
      <div class="verdict" style="color:${col}">${passed ? 'Экзамен сдан!' : 'Пока не сдан'}</div>
      <div class="big-pct" style="color:${col}">${pct}<span>%</span></div>
      <p class="hint">${passed
        ? `Блок «${block.title}» пройден.${nextUnlocked ? ' Открыт следующий блок.' : ''}`
        : `Нужно ${Math.round(block.exam.pass * 100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${passed ? (nextUnlocked ? 'Следующий блок' : 'К программе') : 'Пересдать'}</button>
      </div>
    </div>`;
  document.getElementById('toBlock').addEventListener('click', () => openBlock(idx));
  document.getElementById('toSchool').addEventListener('click', renderSchoolInfo);
  document.getElementById('primary').addEventListener('click', () => {
    if (!passed) runExam(block);
    else if (nextUnlocked) openBlock(idx + 1);
    else renderCatalogScreen();
  });
}

function renderSchoolInfo(back) {
  stopRaf();
  // back может прийти НЕ функцией (например, event из addEventListener('click', renderSchoolInfo)) —
  // тогда «Назад» вызывал event и не работал. Принимаем только функцию.
  const exit = typeof back === 'function' ? back : renderMenu;
  renderLeadForm(app, { onExit: exit });
}

function renderSettingsScreen() {
  stopRaf();
  renderSettings(app, mic, {
    onExit: renderMenu,
    onVoice: () => enterMic(() => renderVoice(app, mic, tracker, {
      onDone: () => { applyTrackerRange(); renderSettingsScreen(); },
      onExit: renderSettingsScreen,
    })),
    onCalibrate: () => enterMic(() => renderCalibrate(app, mic, { onExit: renderSettingsScreen })),
  });
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
  enterMic(() => _launchLesson(lesson));
}
function _launchLesson(lesson) {
  applyTrackerRange();
  // Урок засчитывается только при реальном прохождении (≥50% точности), а не на любом выходе.
  const PASS = 0.5;
  const markPass = (agg) => { if (agg && agg.pct >= PASS) progress.markLessonDone(lesson.id); };
  if (lesson.type === 'breath') {
    // Дыхательные не оцениваются по высоте — засчитываем за выполнение (дошёл до конца/вышел).
    renderBreathing(app, mic, lesson.key, { onExit: () => { progress.markLessonDone(lesson.id); renderPathScreen(); } });
  } else if (lesson.type === 'ex') {
    const ex = EXERCISES[lesson.key].make(voiceRoot());
    renderGame(app, mic, tracker, ex, { explain: true, reps: [0], rebuild: () => EXERCISES[lesson.key].make(voiceRoot()), onResult: markPass, onExit: renderPathScreen, onAgain: () => launchLesson(lesson) });
  } else if (lesson.type === 'song') {
    const ex = SONGS[lesson.key].make(voiceRoot());
    renderGame(app, mic, tracker, ex, { explain: true, reps: [0], onResult: markPass, onExit: renderPathScreen, onAgain: () => launchLesson(lesson) });
  }
}

// ---------- Дисклеймер здоровья голоса (один раз) ----------
function renderSafety(onAccept) {
  stopRaf();
  app.innerHTML = `
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="safety-back">‹ Меню</button></div>
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
  document.getElementById('safety-back').addEventListener('click', renderMenu);
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
  const zoneColor = { green: '#2fab84', yellow: '#e0a64a', red: '#e0544b' };
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

// PWA-офлайн: регистрируем service worker только в проде (в dev/preview мешает HMR).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}

renderSplash();
