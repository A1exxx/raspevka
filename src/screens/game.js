// game.js — экран упражнения: слушаем эталон → отсчёт → проход по хайвею → итог.
import { Scorer } from '../game/scoring.js';
import { NoteHighway } from '../game/note-highway.js';
import { playSequence, playClick, playTone, playChord, playDrone } from '../audio/reference-tone.js';
import { referenceFreqs } from '../theory/exercises.js';
import { startGroove } from '../audio/backing.js';
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

  // Повторы с транспозицией: opts.reps — массив смещений (полутоны), opts.repIndex — текущий.
  const reps = opts.reps;
  const repIndex = opts.repIndex || 0;
  const step = (reps && reps.length) ? (reps[repIndex] || 0) : 0;
  const baseTonic = exercise.root != null ? exercise.root : exercise.notes[0].midi;
  const ex = step
    ? { ...exercise, root: baseTonic + step, notes: exercise.notes.map((n) => ({ ...n, midi: n.midi + step })) }
    : exercise;
  const repLabel = (reps && reps.length > 1) ? ` · ${repIndex + 1}/${reps.length}` : '';

  app.innerHTML = `
    <div class="screen game">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${ex.name} · <span class="syl">«${ex.syllable}»</span>${repLabel}</div>
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
  const exRun = { ...ex, tempo: Math.max(40, Math.round(ex.tempo * factor)) };
  const highway = new NoteHighway(canvas, exRun);
  const scorer = new Scorer(ex.notes.length);
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

  // 0) Аккорд тоники → 1) эталон-мелодия → 2) отсчёт
  const tonic = ex.root != null ? ex.root : ex.notes[0].midi;
  const freqs = referenceFreqs(ex);
  const timbre = progress.getTimbre();
  highway.draw(0, null, false);
  if (repIndex === 0) {
    msg.textContent = 'Слушай тонику…';
    playChord(mic.ctx, tonic, 0, 1.4, 0.14, timbre);
    later(() => {
      msg.textContent = 'Образец…';
      const refDur = playSequence(mic.ctx, freqs, 0.34, timbre);
      later(countIn, refDur * 1000 + 250);
    }, 1650);
  } else {
    // Повтор выше/ниже — короткое интро: новая тоника + один клик.
    msg.textContent = (step > 0 ? '↑ выше' : '↓ ниже') + ` · повтор ${repIndex + 1}/${reps.length}`;
    playChord(mic.ctx, tonic, 0, 0.8, 0.14, timbre);
    later(() => { playClick(mic.ctx, 0, true); later(startRun, 480); }, 950);
  }

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
        guideHandles.push(playTone(mic.ctx, seg.hz, Math.max(0.2, seg.dur * 0.92), seg.start, 0.10, timbre));
      });
    } else if (mode === 'prehear') {
      highway.timed.forEach((seg) => {
        const cue = Math.min(0.4, seg.dur);
        guideHandles.push(playTone(mic.ctx, seg.hz, cue, Math.max(0, seg.start - cue), 0.18, timbre));
      });
    }
    // Гармонический фон (drone) для ладовых упражнений — тихая опора тоники (по ТЗ Игоря).
    if (ex.drone) guideHandles.push(playDrone(mic.ctx, tonic, highway.totalTime + 0.5, 0.05));
    // Грув-подложка (ритм для драйва, поднимается на полутон вместе с тоникой повтора).
    const groove = progress.getGroove();
    if (groove !== 'off') guideHandles.push(startGroove(mic.ctx, { rootMidi: tonic, tempo: exRun.tempo, dur: highway.totalTime, style: groove, gain: 0.45 }));
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
      // Гейт по громкости: очень низкий порог, чтобы уверенно ловить тихий голос.
      voiced = r.voiced && mic.rms() > 0.0025;
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
      // Подсказку «не слышу» показываем редко: только если есть активная нота
      // и долго (>5с) нет голоса — чтобы не нудеть в паузах/между нотами.
      if (active && nowMs - lastVoicedMs > 5000) {
        cueEl.textContent = 'не слышу голос — спой громче';
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
    const acc = opts._acc || [];
    acc.push(res);
    // Ещё есть повторы (транспозиция) — продолжаем выше/ниже, итог не показываем.
    if (reps && reps.length > 1 && repIndex < reps.length - 1) {
      renderGame(app, mic, tracker, exercise, { ...opts, repIndex: repIndex + 1, _acc: acc });
      return;
    }
    // Агрегат по всем повторам.
    const avgPct = acc.reduce((a, r) => a + (r.pct || 0), 0) / acc.length;
    const agg = {
      pct: avgPct,
      stars: avgPct >= 0.85 ? 3 : avgPct >= 0.6 ? 2 : avgPct >= 0.35 ? 1 : 0,
      notesHit: res.notesHit, notesTotal: res.notesTotal, avgCents: res.avgCents, perNote: res.perNote,
      repsDone: acc.length,
    };
    if (onComplete) { onComplete(agg); return; }
    // Энергия/жизни (по ТЗ): <50% нот → упражнение заново со списанием энергии; ≥50% → пополнение.
    if (avgPct < 0.5) {
      if (progress.getEnergy() > 0) { progress.addEnergy(-1); renderFailRetry(agg); return; }
    } else {
      progress.addEnergy(avgPct >= 0.8 ? 2 : 1);
    }
    renderSummary(agg);
  }

  function renderSummary(agg) {
    const stars = '★'.repeat(agg.stars) + '☆'.repeat(3 - agg.stars);
    const pct = Math.round(agg.pct * 100);
    const verdict = agg.stars >= 3 ? 'Отлично!' : agg.stars === 2 ? 'Хорошо!' : agg.stars === 1 ? 'Неплохо' : 'Ещё разок';
    const tip = diagnose(agg, exercise);
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">${stars}</div>
        <div class="verdict">${verdict}</div>
        <div class="big-pct">${pct}<span>%</span></div>
        <p class="hint">средняя точность${agg.repsDone > 1 ? ` за ${agg.repsDone} повтор${agg.repsDone < 5 ? 'а' : 'ов'}` : ''}</p>
        ${energyRow(progress.getEnergy(), progress.getMaxEnergy())}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${tip}</p></div>
        ${controlsBlock()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `;
    wireControls(app, () => renderSummary(agg));
    document.getElementById('again').addEventListener('click', onAgain);
    document.getElementById('menu').addEventListener('click', onExit);
  }

  // <50% нот → упражнение начинается заново (энергия уже списана). Авто-рестарт + кнопки.
  function renderFailRetry(agg) {
    const pct = Math.round(agg.pct * 100);
    app.innerHTML = `
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Меньше половины — ещё разок!</div>
        <div class="big-pct" style="color:var(--coral)">${pct}<span>%</span></div>
        ${energyRow(progress.getEnergy(), progress.getMaxEnergy())}
        <p class="hint">Упражнение начинается заново. Энергия −1. Пройди чисто — энергия вернётся.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Заново</button>
        </div>
      </div>`;
    const go = () => renderGame(app, mic, tracker, exercise, { ...opts, explain: false, repIndex: 0, _acc: undefined });
    const t = setTimeout(go, 2000);
    document.getElementById('menu').addEventListener('click', () => { clearTimeout(t); onExit(); });
    document.getElementById('again').addEventListener('click', () => { clearTimeout(t); go(); });
  }
}

function noteName(midi) {
  const info = hzToNoteInfo(440 * Math.pow(2, (midi - 69) / 12));
  return info ? info.name : '';
}

function boltIcon() {
  return '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>';
}
function energyRow(e, max) {
  const pips = Array.from({ length: max }, (_, i) => `<span class="en-pip ${i < e ? 'on' : ''}"></span>`).join('');
  return `<div class="energy-row"><span class="en-ic">${boltIcon()}</span><div class="energy-pips">${pips}</div></div>`;
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
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
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
  const tb = progress.getTimbre();
  const b = (k, l) => `<button data-diff="${k}" class="${diff === k ? 'on' : ''}">${l}</button>`;
  const tbtn = (k, l) => `<button data-timbre="${k}" class="${tb === k ? 'on' : ''}">${l}</button>`;
  const gr = progress.getGroove();
  const gbtn = (k, l) => `<button data-groove="${k}" class="${gr === k ? 'on' : ''}">${l}</button>`;
  return `
    <div class="settings inline-settings">
      <div class="seg-label">Темп</div>
      <div class="seg">${b('easy', 'Медл.')}${b('medium', 'Средне')}${b('fast', 'Быстро')}</div>
      <div class="seg-label">Звук подсказки</div>
      <div class="seg">${tbtn('piano', 'Пиано')}${tbtn('guitar', 'Гитара')}${tbtn('soft', 'Мягкий')}</div>
      <div class="seg-label">Грув (ритм-подложка · лучше в наушниках)</div>
      <div class="seg">${gbtn('off', 'Выкл')}${gbtn('pop', 'Поп')}${gbtn('funk', 'Фанк')}${gbtn('soft', 'Мягкий')}</div>
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
  root.querySelectorAll('[data-timbre]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setTimbre(btn.dataset.timbre); rerender(); });
  });
  root.querySelectorAll('[data-groove]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setGroove(btn.dataset.groove); rerender(); });
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
