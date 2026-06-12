// game.js — экран упражнения: слушаем эталон → отсчёт → проход по хайвею → итог.
import { Scorer } from '../game/scoring.js';
import { NoteHighway } from '../game/note-highway.js';
import { playSequence, playClick, playTone, playChord, playDrone, setOutputVolume } from '../audio/reference-tone.js';
import { referenceFreqs } from '../theory/exercises.js';
import { startGroove } from '../audio/backing.js';
import { hzToNoteInfo, centsOff } from '../theory/note-map.js';
import * as progress from '../state/progress.js';
import { logEvent } from '../state/analytics.js';
import { MODES, modeUnlocked } from '../theory/modes.js';
import { contourGlyph } from '../ui/illustrations.js';
import { celebrate, haptic } from '../ui/celebrate.js';

// Открыт ли блок «продвинутых» настроек (тембр/грув/наушники) — сохраняем между перерисовками.
let moreSettingsOpen = false;

export function renderGame(app, mic, tracker, exercise, opts = {}) {
  const { onExit, onAgain, onComplete, onResult, onNext, nextLabel, explain } = opts;
  // Громкость подсказки/эталона — применяем при входе (регулятор в настройках/панели).
  setOutputVolume(progress.getVolumeMult());
  // Первый вход в упражнение — короткое объяснение, потом сам интерактив.
  if (explain) {
    renderExplain(app, exercise, {
      onExit,
      onStart: () => renderGame(app, mic, tracker, exercise, { ...opts, explain: false }),
      // смена лада прямо здесь → пересобираем упражнение с новым ладом и заново показываем объяснение
      onModeChange: opts.rebuild ? () => renderGame(app, mic, tracker, opts.rebuild(), { ...opts, explain: true }) : null,
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
    <div class="screen game ${progress.getDarkStage() ? 'stage-dark' : ''}">
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
  const highway = new NoteHighway(canvas, exRun, { theme: progress.getDarkStage() ? 'dark' : 'light' });
  const scorer = new Scorer(ex.notes.length);
  // Компенсация задержки — из калибровки/маршрута вывода (Bluetooth опаздывает сильнее).
  const latency = progress.getLatency();
  // На динамике (не наушники/не BT) грув протекает в микрофон → будем приглушать на голос.
  const noBleed = progress.getHeadphones() || progress.getRouteKey() !== 'speaker';
  let grooveHandle = null;
  let raf = null, startPerf = 0, lastPerf = 0, finished = false, pausedAbort = false, lastVoicedMs = 0, lastHapticIndex = -1;
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
  wireControls(document.getElementById('gsettings'), restart, mic);

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
    // 'auto' → своя подложка под каждую распевку (ex.grooveStyle), иначе явный выбор.
    const grooveSet = progress.getGroove();
    const grooveStyle = grooveSet === 'auto' ? (ex.grooveStyle || 'pop') : grooveSet;
    if (grooveStyle && grooveStyle !== 'off') {
      grooveHandle = startGroove(mic.ctx, { rootMidi: tonic, tempo: exRun.tempo, dur: highway.totalTime, style: grooveStyle, gain: 0.45 });
      guideHandles.push(grooveHandle);
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
      // Гейт по громкости: очень низкий порог, чтобы уверенно ловить тихий голос.
      voiced = r.voiced && mic.rms() > 0.0025;
      sungHz = r.smoothedHz;
    }

    // Грув на динамике приглушаем, пока поёшь (иначе барабаны/бас портят детекцию).
    if (grooveHandle && !noBleed) grooveHandle.duck(voiced);

    // Скоринг — с учётом задержки голоса; отрисовка — по «настоящему» времени.
    const ev = highway.evaluate(now - latency, voiced ? sungHz : null, voiced);
    if (ev.index >= 0) {
      let cents = null;
      if (ev.voiced && sungHz && highway.timed[ev.index]) cents = centsOff(sungHz, highway.timed[ev.index].hz);
      scorer.record(ev.index, ev.zone, dt, ev.voiced, cents);
      // Короткая вибрация при первом точном попадании в КАЖДУЮ ноту (тактильная награда).
      if (ev.zone === 'green' && ev.voiced && ev.index !== lastHapticIndex) {
        haptic(12);
        lastHapticIndex = ev.index;
      }
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
      stability: res.stability, vibrato: res.vibrato,
      repsDone: acc.length,
    };
    // Локальная аналитика: чем закончилось упражнение (улучшать по фактам).
    logEvent('exercise_done', { id: exercise.id, pct: Math.round(avgPct * 100), stability: Math.round(res.stability || 0), reps: acc.length });
    // Сообщаем результат вызывающему (напр. «Путь» засчитывает урок только при успехе).
    if (onResult) onResult(agg);
    if (onComplete) { onComplete(agg); return; }
    // Одиночная распевка ≥50% — засчитываем день (стрик/дневная цель).
    // Полная распевка и экзамены идут через onComplete и записываются своим флоу.
    if (avgPct >= 0.5) progress.recordSession({ pct: avgPct, stars: agg.stars });
    // Энергия/жизни (по ТЗ, смягчено): <40% → разбор и предложение заново со списанием
    // энергии (без авто-рестарта — выбор за тобой); ≥50% → пополнение. Энергия восстанавливается со временем.
    if (avgPct < 0.4) {
      if (progress.getEnergy() > 0) { progress.addEnergy(-1); renderFailRetry(agg); return; }
    } else if (avgPct >= 0.5) {
      progress.addEnergy(avgPct >= 0.8 ? 2 : 1);
    }
    renderSummary(agg);
  }

  function renderSummary(agg) {
    // Празднование: 2★ — скромно, 3★ — ярко (+haptic). Уважает reduced-motion.
    if (agg.stars >= 2) { celebrate(agg.stars >= 3 ? 2 : 1); haptic(agg.stars >= 3 ? 30 : 15); }
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
        ${statsRow(agg)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${tip}</p></div>
        ${controlsBlock()}
        ${onNext ? `<button class="btn btn-primary" id="next" style="width:100%">${nextLabel || 'Дальше'} →</button>` : ''}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${onNext ? 'btn-ghost' : 'btn-primary'}" id="again">Ещё раз</button>
        </div>
      </div>
    `;
    wireControls(app, () => renderSummary(agg), mic);
    document.getElementById('again').addEventListener('click', onAgain);
    document.getElementById('menu').addEventListener('click', onExit);
    const nextBtn = document.getElementById('next');
    if (nextBtn) nextBtn.addEventListener('click', onNext);
  }

  // <40% нот → разбор и предложение пройти заново (энергия уже списана). Выбор за пользователем,
  // без авто-рестарта — чтобы не «выкидывало» в цикл. Энергия восстанавливается со временем.
  function renderFailRetry(agg) {
    const pct = Math.round(agg.pct * 100);
    const tip = diagnose(agg, exercise);
    app.innerHTML = `
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${pct}<span>%</span></div>
        ${energyRow(progress.getEnergy(), progress.getMaxEnergy())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${tip}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${controlsBlock()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
        ${onNext ? `<button class="btn btn-ghost" id="next" style="width:100%">${nextLabel || 'Дальше'} →</button>` : ''}
      </div>`;
    const go = () => renderGame(app, mic, tracker, exercise, { ...opts, explain: false, repIndex: 0, _acc: undefined });
    wireControls(app, () => renderFailRetry(agg), mic);
    document.getElementById('menu').addEventListener('click', onExit);
    document.getElementById('again').addEventListener('click', go);
    const nextBtn = document.getElementById('next');
    if (nextBtn) nextBtn.addEventListener('click', onNext); // сопровождение по программе не обрывается даже при неудаче
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

// Глубокий разбор: ровность высоты (СКО центов) + вибрато.
function statsRow(agg) {
  if (agg.stability == null) return '';
  const st = agg.stability;
  const evenLabel = st < 15 ? 'ровно' : st < 30 ? 'почти ровно' : 'дрожит';
  const evenColor = st < 15 ? 'var(--green)' : st < 30 ? 'var(--amber)' : 'var(--coral)';
  const vib = agg.vibrato && agg.vibrato.present;
  const vibTxt = vib ? `есть · ${agg.vibrato.rateHz.toFixed(1)} Гц` : 'нет';
  return `<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${evenColor}">${evenLabel}</b></span>
    <span class="stat-chip">вибрато: <b>${vibTxt}</b></span>
  </div>`;
}

// Выпадающий выбор лада прямо перед распевкой (для ладозависимых упражнений).
function modeSelectBlock(exercise) {
  if (exercise.modeKey === undefined) return '';
  const cur = progress.getModeKey();
  const tier = progress.getTier();
  const opts = MODES.map((m) => {
    const locked = !modeUnlocked(m.key, tier);
    return `<option value="${m.key}" ${m.key === cur ? 'selected' : ''} ${locked ? 'disabled' : ''}>${m.name}${locked ? ' 🔒' : ''}</option>`;
  }).join('');
  return `<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${opts}</select>
    </div>`;
}

// Экран-объяснение перед упражнением: что тренирует + как делать + как работает игра.
function renderExplain(app, exercise, { onExit, onStart, onModeChange }) {
  app.innerHTML = `
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${exercise.name}</h1>
        <p>Слог: <b>«${exercise.syllable}»</b></p></div>
      <div class="card">
        ${exercise.desc ? `<p class="blurb">${exercise.desc}</p>` : ''}
        ${exercise.how ? `<p class="how"><b>Как делать.</b> ${exercise.how}</p>` : ''}
        <div class="ex-glyph preview-contour" title="Форма распевки: выше плашка — выше нота, длиннее — дольше">${contourGlyph(exercise.notes)}</div>
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
      </div>
      ${modeSelectBlock(exercise)}
      ${controlsBlock()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('go').addEventListener('click', onStart);
  wireControls(app, () => renderExplain(app, exercise, { onExit, onStart, onModeChange }));
  const sel = document.getElementById('modeSel');
  if (sel) sel.addEventListener('change', () => {
    progress.setModeKey(sel.value);
    // пересобрать упражнение с новым ладом (если можем) — иначе просто запомнить лад
    if (onModeChange) onModeChange();
    else renderExplain(app, exercise, { onExit, onStart, onModeChange });
  });
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
  const vol = progress.getVolumeKey();
  const vbtn = (k, l) => `<button data-vol="${k}" class="${vol === k ? 'on' : ''}">${l}</button>`;
  return `
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${vbtn('quiet', 'Тихо')}${vbtn('normal', 'Норм')}${vbtn('loud', 'Громко')}${vbtn('max', 'Макс')}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${b('easy', 'Медл.')}${b('medium', 'Средне')}${b('fast', 'Быстро')}</div>
      <div class="toggle-row">
        <button class="toggle ${guideOn ? 'on' : ''}" data-guidetoggle="1">Подсказка тоном: ${guideOn ? 'вкл' : 'выкл'}</button>
      </div>
      <details class="more-settings" ${moreSettingsOpen ? 'open' : ''}>
        <summary>Ещё настройки звука: тембр, грув, наушники</summary>
        <div class="seg-label">Звук подсказки</div>
        <div class="seg">${tbtn('piano', 'Пиано')}${tbtn('guitar', 'Гитара')}${tbtn('soft', 'Мягкий')}</div>
        <div class="seg-label">Грув (ритм-подложка · лучше в наушниках)</div>
        <div class="seg">${gbtn('off', 'Выкл')}${gbtn('auto', 'Авто')}${gbtn('pop', 'Поп')}${gbtn('funk', 'Фанк')}${gbtn('soft', 'Мягкий')}</div>
        <div class="toggle-row">
          <button class="toggle ${hp ? 'on' : ''}" data-hptoggle="1">Наушники: ${hp ? 'да' : 'нет'}</button>
        </div>
      </details>
    </div>
  `;
}

function wireControls(root, rerender, micEngine) {
  root.querySelectorAll('[data-diff]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setDifficulty(btn.dataset.diff); rerender(); });
  });
  root.querySelectorAll('[data-timbre]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setTimbre(btn.dataset.timbre); rerender(); });
  });
  root.querySelectorAll('[data-groove]').forEach((btn) => {
    btn.addEventListener('click', () => { progress.setGroove(btn.dataset.groove); rerender(); });
  });
  root.querySelectorAll('[data-vol]').forEach((btn) => {
    btn.addEventListener('click', () => {
      progress.setVolume(btn.dataset.vol);
      setOutputVolume(progress.getVolumeMult());
      // короткий тест-«дин», чтобы сразу услышать выбранную громкость
      if (micEngine && micEngine.ctx) { try { playTone(micEngine.ctx, 523.25, 0.5, 0, 0.22, progress.getTimbre()); } catch (e) { /* ok */ } }
      rerender();
    });
  });
  const g = root.querySelector('[data-guidetoggle]');
  if (g) g.addEventListener('click', () => { progress.setGuide(!progress.getGuide()); rerender(); });
  const h = root.querySelector('[data-hptoggle]');
  if (h) h.addEventListener('click', () => { progress.setHeadphones(!progress.getHeadphones()); rerender(); });
  // Запоминаем, открыт ли блок продвинутых настроек, чтобы перерисовка его не схлопывала.
  const more = root.querySelector('.more-settings');
  if (more) more.addEventListener('toggle', () => { moreSettingsOpen = more.open; });
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
