// game.js — экран упражнения: слушаем эталон → отсчёт → проход по хайвею → итог.
import { Scorer } from '../game/scoring.js';
import { NoteHighway } from '../game/note-highway.js';
import { playSequence, playClick, playTone } from '../audio/reference-tone.js';
import { referenceFreqs } from '../theory/exercises.js';
import { hzToNoteInfo, centsOff } from '../theory/note-map.js';
import * as progress from '../state/progress.js';

// Компенсация задержки: голос детектится позже, чем нота прошла линию.
const LATENCY_S = 0.09;

export function renderGame(app, mic, tracker, exercise, opts = {}) {
  const { onExit, onAgain, onComplete, explain } = opts;
  // Первый вход в упражнение — короткое объяснение, потом сам интерактив.
  if (explain) {
    renderExplain(app, exercise, {
      onExit,
      onStart: () => renderGame(app, mic, tracker, exercise, { ...opts, explain: false }),
    });
    return;
  }
  app.innerHTML = `
    <div class="screen game">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${exercise.name} · <span class="syl">«${exercise.syllable}»</span></div>
      </div>
      <div class="trace-wrap"><canvas class="trace" id="hw"></canvas></div>
      <div class="hud">
        <div class="hud-msg" id="msg">Слушай эталон…</div>
        <div class="hud-meter"><i id="livebar"></i></div>
        <div class="hud-notes">
          <span>цель: <b id="target">—</b></span>
          <span>ты: <b id="yours">—</b></span>
        </div>
        <div class="cue" id="cue"></div>
      </div>
      <details class="game-settings" id="gsettings">
        <summary>Темп и подсказка тоном</summary>
        ${controlsBlock()}
      </details>
    </div>
  `;

  const canvas = document.getElementById('hw');
  const ctx = canvas.getContext('2d');
  const msg = document.getElementById('msg');
  const livebar = document.getElementById('livebar');
  const targetEl = document.getElementById('target');
  const yoursEl = document.getElementById('yours');
  const cueEl = document.getElementById('cue');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Темп применяется ДИНАМИЧНО при сборке (читаем текущую сложность) —
  // меняешь темп на экране объяснения/итога, и следующий проход уже с ним.
  const factor = progress.difficultyFactor();
  const exRun = { ...exercise, tempo: Math.max(40, Math.round(exercise.tempo * factor)) };
  const highway = new NoteHighway(canvas, exRun);
  const scorer = new Scorer(exercise.notes.length);
  let raf = null, startPerf = 0, lastPerf = 0, finished = false, pausedAbort = false, lastVoicedMs = 0;
  const guideHandles = [];
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

  function stopGuide() { guideHandles.forEach((h) => h && h.stop && h.stop()); guideHandles.length = 0; }
  function cleanup() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    timers.forEach(clearTimeout);
    timers.length = 0;
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    stopGuide();
  }

  // Свернули/заблокировали экран посреди прохода → стоп (без рассинхрона и хвостов звука);
  // при возврате — аккуратный перезапуск упражнения.
  function onVisibility() {
    if (document.hidden) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      stopGuide();
      if (startPerf && !finished) { finished = true; pausedAbort = true; }
    } else if (pausedAbort) {
      pausedAbort = false;
      restart();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  document.getElementById('exit').addEventListener('click', () => { cleanup(); onExit(); });

  // Панель настроек прямо в упражнении: смена темпа/поводыря → мягкий рестарт прохода.
  function restart() {
    cleanup();
    renderGame(app, mic, tracker, exercise, { ...opts, explain: false });
  }
  wireControls(document.getElementById('gsettings'), restart);

  // 1) Эталон
  const freqs = referenceFreqs(exercise);
  const refDur = playSequence(mic.ctx, freqs, 0.34);
  // рисуем статичный хайвей пока играет эталон
  highway.draw(0, null, false);
  later(countIn, refDur * 1000 + 250);

  // 2) Отсчёт
  function countIn() {
    let n = 3;
    const tick = () => {
      if (n > 0) {
        playClick(mic.ctx);
        msg.textContent = 'Приготовься… ' + n;
        n -= 1;
        later(tick, 600);
      } else {
        startRun();
      }
    };
    tick();
  }

  // 3) Проход
  function startRun() {
    const mode = progress.getGuideMode();
    msg.textContent = mode === 'continuous' ? 'Пой за подсказкой!'
      : mode === 'prehear' ? 'Слушай тон и повторяй!' : 'Пой!';
    tracker.reset();
    startPerf = performance.now();
    lastPerf = startPerf;
    lastVoicedMs = startPerf;
    // Поводырь. 'continuous' — тон звучит весь шаг (для наушников).
    // 'prehear' — короткий тон ЗАКАНЧИВАЕТСЯ к моменту, когда нота у линии,
    // и молчит пока ты поёшь → не протекает в микрофон на динамике.
    if (mode === 'continuous') {
      highway.timed.forEach((seg) => {
        guideHandles.push(playTone(mic.ctx, seg.hz, Math.max(0.2, seg.dur * 0.92), seg.start, 0.10));
      });
    } else if (mode === 'prehear') {
      highway.timed.forEach((seg) => {
        const cue = Math.min(0.4, seg.dur);
        guideHandles.push(playTone(mic.ctx, seg.hz, cue, Math.max(0, seg.start - cue), 0.18));
      });
    }
    loop();
  }

  function loop() {
    const nowMs = performance.now();
    const now = (nowMs - startPerf) / 1000;
    const dt = nowMs - lastPerf;
    lastPerf = nowMs;

    const buf = mic.read();
    let voiced = false, sungHz = null;
    if (buf) {
      const r = tracker.process(buf);
      // Гейт по громкости: тихий фон/шум не должен засчитываться как пение.
      voiced = r.voiced && mic.rms() > 0.01;
      sungHz = r.smoothedHz;
    }

    // Скоринг — с учётом задержки голоса; отрисовка — по «настоящему» времени.
    const ev = highway.evaluate(now - LATENCY_S, voiced ? sungHz : null, voiced);
    if (ev.index >= 0) {
      let cents = null;
      if (ev.voiced && sungHz && highway.timed[ev.index]) cents = centsOff(sungHz, highway.timed[ev.index].hz);
      scorer.record(ev.index, ev.zone, dt, ev.voiced, cents);
    }
    highway.draw(now, voiced ? sungHz : null, voiced);

    // HUD
    const active = highway.activeAt(now);
    targetEl.textContent = active ? noteName(active.seg.midi) : '—';
    if (voiced && sungHz) {
      lastVoicedMs = nowMs;
      const info = hzToNoteInfo(sungHz);
      yoursEl.textContent = info ? info.name : '—';
      const color = ev.zone === 'green' ? 'var(--green)' : ev.zone === 'yellow' ? 'var(--yellow)' : 'var(--coral)';
      yoursEl.style.color = active ? color : 'var(--text)';
      livebar.style.width = Math.min(100, mic.rms() * 350) + '%';
      // Живая подсказка «выше/ниже»
      if (active) {
        const c = centsOff(sungHz, active.seg.hz);
        if (Math.abs(c) <= 20) { cueEl.textContent = 'в точку'; cueEl.style.color = 'var(--green)'; }
        else if (c < 0) { cueEl.textContent = '↑ выше'; cueEl.style.color = 'var(--amber)'; }
        else { cueEl.textContent = '↓ ниже'; cueEl.style.color = 'var(--amber)'; }
      } else cueEl.textContent = '';
    } else {
      yoursEl.textContent = '—';
      yoursEl.style.color = 'var(--text-dim)';
      livebar.style.width = '0%';
      // Долго не слышим голос во время прохода — мягкая подсказка.
      if (now > 0.5 && nowMs - lastVoicedMs > 2500) {
        cueEl.textContent = 'не слышу голос — громче / ближе к телефону';
        cueEl.style.color = 'var(--coral)';
      } else {
        cueEl.textContent = '';
      }
    }

    if (now < highway.totalTime) {
      raf = requestAnimationFrame(loop);
    } else if (!finished) {
      finished = true;
      finish();
    }
  }

  // 4) Итог
  function finish() {
    const res = scorer.result();
    cleanup();
    // Режим сессии: итог не показываем, отдаём результат контроллеру.
    if (onComplete) { onComplete(res); return; }
    const stars = '★'.repeat(res.stars) + '☆'.repeat(3 - res.stars);
    const pct = Math.round(res.pct * 100);
    const verdict = res.stars >= 3 ? 'Отлично!' : res.stars === 2 ? 'Хорошо!' : res.stars === 1 ? 'Неплохо' : 'Ещё разок';
    const tip = diagnose(res, exercise);
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">${stars}</div>
        <div class="verdict">${verdict}</div>
        <div class="big-pct">${pct}<span>%</span></div>
        <p class="hint">в зелёной зоне · попал ${res.notesHit} из ${res.notesTotal} нот</p>
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${tip}</p></div>
        ${controlsBlock()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `;
    wireControls(app, finish);
    document.getElementById('again').addEventListener('click', onAgain);
    document.getElementById('menu').addEventListener('click', onExit);
  }
}

function noteName(midi) {
  const info = hzToNoteInfo(440 * Math.pow(2, (midi - 69) / 12));
  return info ? info.name : '';
}

// Экран-объяснение перед упражнением: что тренирует + как делать + как работает игра.
function renderExplain(app, exercise, { onExit, onStart }) {
  app.innerHTML = `
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${exercise.name}</h1>
        <p>Слог: <b>«${exercise.syllable}»</b></p></div>
      <div class="card">
        ${exercise.desc ? `<p class="blurb">${exercise.desc}</p>` : ''}
        ${exercise.how ? `<p class="how"><b>Как делать.</b> ${exercise.how}</p>` : ''}
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит образец.</p>
      </div>
      ${controlsBlock()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('go').addEventListener('click', onStart);
  wireControls(app, () => renderExplain(app, exercise, { onExit, onStart }));
}

// Динамические настройки темпа и поводыря (на экранах объяснения и итога).
function controlsBlock() {
  const diff = progress.getDifficulty();
  const guideOn = progress.getGuide();
  const hp = progress.getHeadphones();
  const b = (k, l) => `<button data-diff="${k}" class="${diff === k ? 'on' : ''}">${l}</button>`;
  return `
    <div class="settings inline-settings">
      <div class="seg-label">Темп</div>
      <div class="seg">${b('easy', 'Медл.')}${b('medium', 'Средне')}${b('fast', 'Быстро')}</div>
      <div class="toggle-row">
        <button class="toggle ${guideOn ? 'on' : ''}" data-guidetoggle="1">Подсказка тоном: ${guideOn ? 'вкл' : 'выкл'}</button>
        <button class="toggle ${hp ? 'on' : ''}" data-hptoggle="1">Наушники: ${hp ? 'да' : 'нет'}</button>
      </div>
    </div>
  `;
}

function wireControls(root, rerender) {
  root.querySelectorAll('[data-diff]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setDifficulty(btn.dataset.diff); rerender(); });
  });
  const g = root.querySelector('[data-guidetoggle]');
  if (g) g.addEventListener('click', () => { progress.setGuide(!progress.getGuide()); rerender(); });
  const h = root.querySelector('[data-hptoggle]');
  if (h) h.addEventListener('click', () => { progress.setHeadphones(!progress.getHeadphones()); rerender(); });
}

// «Почему» — короткий разбор по итогам: тенденция занижения/завышения + слабые ноты.
function diagnose(res, exercise) {
  if (res.stars >= 3) return 'Чисто и точно! Можно прибавить темп или взять упражнение посложнее.';
  const tips = [];
  const a = res.avgCents;
  if (a <= -18) tips.push('Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота).');
  else if (a >= 18) tips.push('Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.');
  // Слабее ли даются верхние ноты (верхняя треть по высоте)?
  const n = res.perNote.length;
  if (n >= 3) {
    const order = exercise.notes.map((nt, i) => ({ i, midi: nt.midi })).sort((x, y) => y.midi - x.midi);
    const top = order.slice(0, Math.max(1, Math.round(n / 3)));
    const topAvg = top.reduce((s, o) => s + (res.perNote[o.i] || 0), 0) / top.length;
    if (topAvg < res.pct - 0.15) tips.push('Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.');
  }
  if (!tips.length) tips.push('Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче.');
  return tips.join(' ');
}
