// game.js — экран упражнения: слушаем эталон → отсчёт → проход по хайвею → итог.
import { Scorer } from '../game/scoring.js';
import { NoteHighway } from '../game/note-highway.js';
import { playSequence, playClick } from '../audio/reference-tone.js';
import { referenceFreqs } from '../theory/exercises.js';
import { hzToNoteInfo } from '../theory/note-map.js';

export function renderGame(app, mic, tracker, exercise, { onExit, onAgain, onComplete } = {}) {
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
      </div>
    </div>
  `;

  const canvas = document.getElementById('hw');
  const ctx = canvas.getContext('2d');
  const msg = document.getElementById('msg');
  const livebar = document.getElementById('livebar');
  const targetEl = document.getElementById('target');
  const yoursEl = document.getElementById('yours');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const highway = new NoteHighway(canvas, exercise);
  const scorer = new Scorer(exercise.notes.length);
  let raf = null, startPerf = 0, lastPerf = 0, finished = false;

  document.getElementById('exit').addEventListener('click', () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    onExit();
  });

  // 1) Эталон
  const freqs = referenceFreqs(exercise);
  const refDur = playSequence(mic.ctx, freqs, 0.34);
  // рисуем статичный хайвей пока играет эталон
  highway.draw(0, null, false);
  setTimeout(countIn, refDur * 1000 + 250);

  // 2) Отсчёт
  function countIn() {
    let n = 3;
    const tick = () => {
      if (n > 0) {
        playClick(mic.ctx);
        msg.textContent = 'Приготовься… ' + n;
        n -= 1;
        setTimeout(tick, 600);
      } else {
        startRun();
      }
    };
    tick();
  }

  // 3) Проход
  function startRun() {
    msg.textContent = 'Пой!';
    tracker.reset();
    startPerf = performance.now();
    lastPerf = startPerf;
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
      voiced = r.voiced;
      sungHz = r.smoothedHz;
    }

    const ev = highway.evaluate(now, voiced ? sungHz : null, voiced);
    if (ev.index >= 0) scorer.record(ev.index, ev.zone, dt, ev.voiced);
    highway.draw(now, voiced ? sungHz : null, voiced);

    // HUD
    const active = highway.activeAt(now);
    targetEl.textContent = active ? noteName(active.seg.midi) : '—';
    if (voiced && sungHz) {
      const info = hzToNoteInfo(sungHz);
      yoursEl.textContent = info ? info.name : '—';
      const color = ev.zone === 'green' ? 'var(--green)' : ev.zone === 'yellow' ? 'var(--yellow)' : 'var(--coral)';
      yoursEl.style.color = active ? color : 'var(--text)';
      livebar.style.width = Math.min(100, mic.rms() * 350) + '%';
    } else {
      yoursEl.textContent = '—';
      yoursEl.style.color = 'var(--text-dim)';
      livebar.style.width = '0%';
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
    window.removeEventListener('resize', resize);
    // Режим сессии: итог не показываем, отдаём результат контроллеру.
    if (onComplete) { onComplete(res); return; }
    const stars = '★'.repeat(res.stars) + '☆'.repeat(3 - res.stars);
    const pct = Math.round(res.pct * 100);
    const verdict = res.stars >= 3 ? 'Отлично!' : res.stars === 2 ? 'Хорошо!' : res.stars === 1 ? 'Неплохо' : 'Ещё разок';
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">${stars}</div>
        <div class="verdict">${verdict}</div>
        <div class="big-pct">${pct}<span>%</span></div>
        <p class="hint">в зелёной зоне · попал ${res.notesHit} из ${res.notesTotal} нот</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `;
    document.getElementById('again').addEventListener('click', onAgain);
    document.getElementById('menu').addEventListener('click', onExit);
  }
}

function noteName(midi) {
  const info = hzToNoteInfo(440 * Math.pow(2, (midi - 69) / 12));
  return info ? info.name : '';
}
