// ear-training.js — «Спой за мной»: слышишь ноту → повторяешь голосом. Тренирует слух
// и связь «слышу высоту → воспроизвожу». Переиспользует детектор тона и эталонный тон.
import { midiToHz, centsOff, hzToNoteInfo } from '../theory/note-map.js';
import { playTone } from '../audio/reference-tone.js';
import * as progress from '../state/progress.js';

const OFFS = [0, 2, 4, 5, 7, 9, 12];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function nm(midi) { const i = hzToNoteInfo(midiToHz(midi)); return i ? i.name : ''; }

export function renderEar(app, mic, tracker, { onExit, root = 60 }) {
  const total = 8;
  let round = 0, score = 0, rafId = null, phase = 'idle', target = root, hold = 0, timer = null;
  const timbre = progress.getTimbre ? progress.getTimbre() : 'piano';

  app.innerHTML = `
    <div class="screen ear">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Спой за мной</h1><p>Слушай ноту и повтори её голосом. Имя ноты скрыто — тренируем слух.</p></div>
      <div class="ear-status" id="status">Раунд 1 / ${total}</div>
      <div class="ear-target silent" id="bigq">?</div>
      <div class="cents-row"><span id="cue">Нажми «Слушать»</span></div>
      <div class="bar"><i id="lvl"></i></div>
      <div class="row">
        <button class="btn btn-ghost" id="replay">Слушать</button>
        <button class="btn btn-ghost" id="skip">Пропустить</button>
      </div>
      <div class="ear-score" id="score">Верно: 0 / ${total}</div>
    </div>`;

  const statusEl = document.getElementById('status');
  const bigq = document.getElementById('bigq');
  const cue = document.getElementById('cue');
  const lvl = document.getElementById('lvl');
  const scoreEl = document.getElementById('score');

  document.getElementById('back').addEventListener('click', () => { stop(); onExit(); });
  document.getElementById('replay').addEventListener('click', playTarget);
  document.getElementById('skip').addEventListener('click', () => { reveal('Пропущено'); next(1300); });

  if (tracker.setRange) tracker.setRange(55, 1300);
  tracker.reset();

  function playTarget() {
    if (mic.ctx) playTone(mic.ctx, midiToHz(target), 1.3, 0, 0.3, timbre);
    cue.textContent = 'Слушай…';
    phase = 'wait';
    clearTimeout(timer);
    timer = setTimeout(() => { phase = 'sing'; cue.textContent = 'Теперь спой эту ноту'; }, 1350);
  }

  function startRound() {
    round++;
    target = root + pick(OFFS);
    hold = 0;
    bigq.textContent = '?'; bigq.classList.add('silent');
    statusEl.textContent = `Раунд ${round} / ${total}`;
    playTarget();
  }

  function reveal(text) {
    bigq.textContent = nm(target);
    bigq.classList.remove('silent');
    if (text) cue.textContent = text;
    phase = 'done';
  }

  function correct() {
    score++;
    scoreEl.textContent = `Верно: ${score} / ${total}`;
    reveal('Верно! Бра-во.');
    bigq.classList.add('hit');
    next(1300);
  }

  function next(delay) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      bigq.classList.remove('hit');
      if (round >= total) finish(); else startRound();
    }, delay);
  }

  function finish() {
    stop();
    app.innerHTML = `
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${score}<span>/${total}</span></div>
        <p class="verdict">${score >= 7 ? 'Отличный слух!' : score >= 4 ? 'Хорошо, продолжай!' : 'Слух тренируется — ещё раз!'}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`;
    document.getElementById('again').addEventListener('click', () => renderEar(app, mic, tracker, { onExit, root }));
    document.getElementById('menu').addEventListener('click', onExit);
  }

  function loop() {
    const buf = mic.read();
    let voiced = false, hz = null;
    if (buf) { const r = tracker.process(buf); voiced = r.voiced && mic.rms() > 0.0025; hz = r.smoothedHz; }
    lvl.style.width = (voiced ? Math.min(100, mic.rms() * 350) : 0) + '%';
    if (phase === 'sing' && voiced && hz) {
      const c = Math.abs(centsOff(hz, midiToHz(target)));
      if (c < 45) hold++; else hold = Math.max(0, hold - 2);
      cue.textContent = c < 45 ? 'Держи…' : (hz < midiToHz(target) ? '↑ выше' : '↓ ниже');
      if (hold >= 22) correct();
    }
    rafId = requestAnimationFrame(loop);
  }

  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = null; clearTimeout(timer); }

  startRound();
  loop();
}
