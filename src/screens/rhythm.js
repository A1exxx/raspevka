// rhythm.js — ритмические распевки на «с»/«ш»: метроном + мелодическая подложка.
// Питч не интонируется (согласные) — упражнение ведётся метрономом и визуальным
// пульсом; цель — ровный выдох и артикуляция в такт + вдохи носом между подходами.
import { playClick, playTone } from '../audio/reference-tone.js';
import * as progress from '../state/progress.js';

const N = (s, b) => ({ s, b });
function rep(arr, n) { const out = []; for (let i = 0; i < n; i++) out.push(...arr.map((x) => ({ ...x }))); return out; }

export const RHYTHM = {
  air1: {
    id: 'air1', name: 'Дыхание: длинные с / ш', kind: 'rhythm', tempo: 70,
    desc: 'Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.',
    how: '«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.',
    steps: rep([N('с', 4), N('вдох', 2), N('ш', 4), N('вдох', 2)], 4),
  },
  air2: {
    id: 'air2', name: 'Дыхание: короткий с + 5 ш', kind: 'rhythm', tempo: 80,
    desc: 'Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.',
    how: 'Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.',
    steps: rep([N('с', 0.5), N('rest', 0.5), N('ш', 0.5), N('ш', 0.5), N('ш', 0.5), N('ш', 0.5), N('ш', 0.5), N('вдох', 2)], 6),
  },
  air3: {
    id: 'air3', name: 'Артикуляция: 15 с + 15 ш', kind: 'rhythm', tempo: 80,
    desc: 'Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.',
    how: '15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.',
    steps: [...rep([N('с', 0.5)], 15), N('вдох', 2), ...rep([N('ш', 0.5)], 15)],
  },
};

const LABEL = { 'с': 'С-с-с', 'ш': 'Ш-ш-ш', 'вдох': 'Вдох носом', 'rest': '·' };

// Подложка-мелодия: спокойная пентатоника четвертями, СТРОГО по долям — клики
// метронома совпадают с нотами (правка музыканта: «одна нота вместо мелодии»).
const PAD_LOOP = [0, 4, 7, 9, 12, 9, 7, 4]; // до-ми-соль-ля-до'-ля-соль-ми

export function renderRhythm(app, mic, root, exercise, { onExit, onComplete, skipExplain } = {}) {
  let rafId = null, pausedAbort = false;
  let pad = []; // хэндлы нот подложки (остановить при выходе)
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

  function stopPad() { pad.forEach((h) => h && h.stop && h.stop()); pad = []; }
  function cleanup() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    timers.forEach(clearTimeout); timers.length = 0;
    stopPad();
    document.removeEventListener('visibilitychange', onVisibility);
  }
  function onVisibility() {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      stopPad();
      pausedAbort = true;
    } else if (pausedAbort) { pausedAbort = false; explain(); }
  }

  // ---- Объяснение ----
  function explain() {
    cleanup();
    app.innerHTML = `
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>${exercise.name}</h1></div>
        <div class="card">
          <p class="blurb">${exercise.desc}</p>
          <p class="how"><b>Как.</b> ${exercise.how}</p>
          <p class="how mech">Идёт метроном и тихая подложка. Делай звук в такт щелчкам, между подходами — спокойный вдох носом.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `;
    document.getElementById('back').addEventListener('click', () => { cleanup(); onExit(); });
    document.getElementById('go').addEventListener('click', run);
  }

  // ---- Проход ----
  function run() {
    document.addEventListener('visibilitychange', onVisibility);
    // Дыхательные идут в своём методичном темпе (глобальный «Темп» к ним не применяем).
    const spb = 60 / exercise.tempo;
    let acc = 0;
    const segs = exercise.steps.map((st) => { const s = { ...st, start: acc, end: acc + st.b }; acc += st.b; return s; });
    const totalBeats = acc;
    const totalSec = totalBeats * spb;

    app.innerHTML = `
      <div class="screen breathe">
        <div class="game-top">
          <button class="icon-btn" id="quit">‹ Прервать</button>
          <button class="icon-btn" id="padtgl">♪ подложка ${progress.getRhythmPad() ? 'вкл' : 'выкл'}</button>
        </div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `;
    document.getElementById('quit').addEventListener('click', () => { cleanup(); onExit(); });
    const lbl = document.getElementById('lbl');
    const beat = document.getElementById('beat');
    const prog = document.getElementById('prog');

    // Мелодическая подложка: мягкая нота на каждую долю (та же сетка, что у кликов,
    // поэтому метроном и мелодия совпадают). Тихо — фон, а не солист. Тумблер ♪ отключает.
    if (progress.getRhythmPad()) {
      for (let bi = 0; bi < Math.ceil(totalBeats); bi++) {
        const midi = root + PAD_LOOP[bi % PAD_LOOP.length];
        const hz = 440 * Math.pow(2, (midi - 69) / 12);
        pad.push(playTone(mic.ctx, hz, spb * 0.9, bi * spb, 0.07, 'soft'));
      }
    }
    const padBtn = document.getElementById('padtgl');
    if (padBtn) padBtn.addEventListener('click', () => {
      const on = !progress.getRhythmPad();
      progress.setRhythmPad(on);
      if (!on) stopPad(); // выключение действует сразу; включение — со следующего запуска
      padBtn.textContent = on ? '♪ подложка вкл' : '♪ подложка выкл';
    });
    const startPerf = performance.now();
    let lastBeat = -1, finished = false;

    function loop() {
      const now = (performance.now() - startPerf) / 1000;
      const eb = now / spb;
      const bi = Math.floor(eb);
      if (bi > lastBeat && bi < Math.ceil(totalBeats)) {
        lastBeat = bi;
        playClick(mic.ctx, 0, bi % 4 === 0);
        beat.classList.remove('pulse');
        void beat.offsetWidth; // рестарт анимации
        beat.classList.add('pulse');
      }
      const seg = segs.find((s) => eb >= s.start && eb < s.end);
      if (seg) {
        lbl.textContent = LABEL[seg.s] || '';
        lbl.style.color = seg.s === 'вдох' ? 'var(--gold)' : seg.s === 'rest' ? 'var(--text-dim)' : 'var(--accent-2)';
      }
      prog.style.width = Math.min(100, (now / totalSec) * 100) + '%';
      if (now < totalSec) { rafId = requestAnimationFrame(loop); }
      else if (!finished) { finished = true; finishRhythm(); }
    }
    rafId = requestAnimationFrame(loop);
  }

  function finishRhythm() {
    cleanup();
    if (onComplete) { onComplete({ pct: null, rhythm: true }); return; }
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `;
    document.getElementById('menu').addEventListener('click', onExit);
    document.getElementById('again').addEventListener('click', explain);
  }

  // В составе полной распевки интерстициал уже всё объяснил — сразу к делу.
  if (skipExplain) run(); else explain();
}
