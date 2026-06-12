// breathing.js — дыхательные упражнения. Формат: короткое объяснение → интерактив.
// Не используют высоту тона. Два движка:
//   paced  — ведомое дыхание с дышащим кругом (box breathing, дыхание животом)
//   exhale — замер длительности ровного выдоха на «с-с-с» по громкости (RMS)
import * as progress from '../state/progress.js';
import { bellyDiagram } from '../ui/belly-diagram.js';

export const BREATHING = {
  box: {
    title: 'Дыхание по квадрату',
    kind: 'paced',
    belly: true,
    blurb: 'Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.',
    cycles: 4,
    phases: [
      { label: 'Вдох', sec: 4, from: 0.5, to: 1 },
      { label: 'Задержка', sec: 4, from: 1, to: 1 },
      { label: 'Выдох', sec: 4, from: 1, to: 0.5 },
      { label: 'Пауза', sec: 4, from: 0.5, to: 0.5 },
    ],
  },
  belly: {
    title: 'Дыхание животом',
    kind: 'paced',
    belly: true,
    blurb: 'База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.',
    cycles: 5,
    phases: [
      { label: 'Вдох (живот)', sec: 4, from: 0.5, to: 1 },
      { label: 'Выдох ровно', sec: 6, from: 1, to: 0.5 },
    ],
  },
  hiss: {
    title: 'Долгий выдох «с-с-с»',
    kind: 'exhale',
    blurb: 'Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.',
    goals: [{ sec: 8, label: 'хорошо' }, { sec: 15, label: 'отлично' }, { sec: 20, label: 'превосходно' }],
  },
};

// onExit — выход (назад/меню), onDone — упражнение выполнено (зачёт пункта программы),
// onNext/nextLabel — сопровождение: кнопка «Дальше» к следующему пункту блока.
export function renderBreathing(app, mic, key, { onExit, onNext, nextLabel, onDone }) {
  const ex = BREATHING[key];
  let rafId = null;

  // Кнопки финала: «Дальше» (если есть сопровождение) + Меню/Ещё раз — как в renderGame.
  function finishButtons() {
    return `
      ${onNext ? `<button class="btn btn-primary" id="next" style="width:100%">${nextLabel || 'Дальше'} →</button>` : ''}
      <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
      <button class="btn ${onNext ? 'btn-ghost' : 'btn-primary'}" id="again">Ещё раз</button></div>`;
  }
  function wireFinish(again) {
    document.getElementById('menu').addEventListener('click', onExit);
    document.getElementById('again').addEventListener('click', again);
    const nx = document.getElementById('next');
    if (nx) nx.addEventListener('click', onNext);
  }

  // ---- Экран объяснения ----
  function explain() {
    app.innerHTML = `
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ ${onNext ? 'Назад' : 'Меню'}</button></div>
        <div class="brand"><h1>${ex.title}</h1></div>
        <div class="card"><p class="blurb">${ex.blurb}</p>${ex.belly ? bellyDiagram() : ''}</div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `;
    document.getElementById('back').addEventListener('click', onExit);
    document.getElementById('go').addEventListener('click', ex.kind === 'paced' ? runPaced : runExhale);
  }

  // ---- Интерактив: ведомое дыхание ----
  function runPaced() {
    app.innerHTML = `
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `;
    document.getElementById('quit').addEventListener('click', () => { stop(); onExit(); });
    const core = document.getElementById('core');
    const phaseEl = document.getElementById('phase');
    const countEl = document.getElementById('count');
    const cyclesEl = document.getElementById('cycles');

    const total = ex.cycles * ex.phases.length;
    let cycle = 0, pIdx = 0, phaseStart = performance.now();
    renderDots();

    function renderDots() {
      cyclesEl.innerHTML = Array.from({ length: ex.cycles }, (_, i) =>
        `<span class="dot ${i < cycle ? 'done' : i === cycle ? 'now' : ''}"></span>`).join('');
    }

    function tick() {
      const ph = ex.phases[pIdx];
      const el = (performance.now() - phaseStart) / 1000;
      const t = Math.min(1, el / ph.sec);
      const scale = ph.from + (ph.to - ph.from) * easeInOut(t);
      core.style.transform = `scale(${scale})`;
      phaseEl.textContent = ph.label;
      countEl.textContent = Math.ceil(ph.sec - el);
      if (el >= ph.sec) {
        pIdx += 1;
        if (pIdx >= ex.phases.length) { pIdx = 0; cycle += 1; renderDots(); }
        if (cycle >= ex.cycles) return finishPaced();
        phaseStart = performance.now();
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    function finishPaced() {
      stop();
      if (onDone) onDone();
      app.innerHTML = `
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${ex.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          ${finishButtons()}
        </div>`;
      wireFinish(runPaced);
    }
  }

  // ---- Интерактив: замер ровного выдоха ----
  function runExhale() {
    app.innerHTML = `
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${bestLine()}
      </div>
    `;
    document.getElementById('quit').addEventListener('click', () => { stop(); onExit(); });
    const timerEl = document.getElementById('timer');
    const phaseEl = document.getElementById('phase');
    const volEl = document.getElementById('vol');

    const THRESH = 0.012;       // порог «звук есть»
    const SILENCE_END = 0.6;    // сек тишины → стоп
    let state = 'ready', startMs = 0, lastSound = 0;

    function loop() {
      mic.read();
      const rms = mic.rms();
      volEl.style.width = Math.min(100, rms * 400) + '%';
      const now = performance.now();

      if (state === 'ready') {
        if (rms > THRESH) { state = 'running'; startMs = now; lastSound = now; phaseEl.textContent = 'Тяни ровно!'; }
      } else if (state === 'running') {
        if (rms > THRESH) lastSound = now;
        timerEl.textContent = ((now - startMs) / 1000).toFixed(1);
        if (now - lastSound > SILENCE_END * 1000) return finishExhale((lastSound - startMs) / 1000);
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    function finishExhale(seconds) {
      stop();
      if (onDone) onDone();
      seconds = Math.max(0, Math.round(seconds * 10) / 10);
      const best = progress.recordBreathBest(seconds);
      const goal = [...ex.goals].reverse().find((g) => seconds >= g.sec);
      const verdict = goal ? goal.label[0].toUpperCase() + goal.label.slice(1) + '!' : 'Попробуй ещё';
      app.innerHTML = `
        <div class="screen summary">
          <div class="big-pct">${seconds.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${verdict}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${best.toFixed(1)} сек</b></p>
          ${finishButtons()}
        </div>`;
      wireFinish(runExhale);
    }
  }

  function bestLine() {
    const b = progress.getBreathBest();
    return b ? `<p class="hint">Твой рекорд: <b>${b.toFixed(1)} сек</b></p>` : '<p class="hint">Замерим твой ровный выдох.</p>';
  }

  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  explain();
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
