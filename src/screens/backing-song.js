// backing-song.js — «Пой под фонограмму»: проигрывает записанную распевку-с-повышением
// и показывает твой голос вживую (как в «Распевайся»). Поёшь вместе с мелодией.
// Лучше в наушниках — иначе фонограмма из динамика попадает в микрофон.
import { hzToNoteInfo, midiToHz } from '../theory/note-map.js';

const SRC = import.meta.env.BASE_URL + 'backing/raspevka-rise.mp3';
const NAT = [0, 2, 4, 5, 7, 9, 11];
const isNatural = (m) => NAT.includes(((m % 12) + 12) % 12);
function nm(midi) { const i = hzToNoteInfo(midiToHz(midi)); return i ? i.name : ''; }
function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

export function renderBackingSong(app, mic, tracker, { onExit, lowMidi = 40, highMidi = 76 }) {
  let rafId = null;
  const loM = lowMidi - 2, hiM = highMidi + 2;
  const minHz = midiToHz(loM), maxHz = midiToHz(hiM);
  const audio = new Audio(SRC);
  audio.preload = 'auto';

  app.innerHTML = `
    <div class="screen freesing backing">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Пой под фонограмму</h1><p>Твоя распевка-с-повышением. Пой вместе с мелодией — и смотри, где твой голос. Лучше в наушниках.</p></div>
      <div class="player">
        <button class="btn btn-primary" id="play" style="width:auto;padding:12px 22px">▶ Слушать</button>
        <div class="player-time"><span id="cur">0:00</span> / <span id="dur">…</span></div>
      </div>
      <div class="bar"><i id="seek"></i></div>
      <div class="fs-note silent" id="note">—</div>
      <div class="trace-wrap"><canvas class="trace fs-canvas" id="fs"></canvas></div>
      <p class="hint" id="hint">Нажми «Слушать» и пой за мелодией. Шарик показывает твою ноту.</p>
    </div>
  `;

  const backBtn = document.getElementById('back');
  const playBtn = document.getElementById('play');
  const curEl = document.getElementById('cur');
  const durEl = document.getElementById('dur');
  const seek = document.getElementById('seek');
  const noteEl = document.getElementById('note');
  const canvas = document.getElementById('fs');
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
  audio.addEventListener('ended', () => { playBtn.textContent = '▶ Слушать'; });
  playBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().catch(() => {}); playBtn.textContent = '⏸ Пауза'; }
    else { audio.pause(); playBtn.textContent = '▶ Слушать'; }
  });
  backBtn.addEventListener('click', () => { stop(); onExit(); });

  function yFor(hz, h) {
    const c = Math.max(minHz, Math.min(maxHz, hz));
    const f = Math.log2(c / minHz) / Math.log2(maxHz / minHz);
    return h - f * h;
  }

  const trail = [];
  if (tracker.setRange) tracker.setRange(55, 1300);
  tracker.reset();

  function loop() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    // нотная лесенка
    ctx.font = '10px Inter, sans-serif';
    for (let m = Math.ceil(loM); m <= hiM; m++) {
      const y = yFor(midiToHz(m), h);
      const isC = ((m % 12) + 12) % 12 === 0;
      ctx.strokeStyle = isC ? 'rgba(27,36,48,.20)' : isNatural(m) ? 'rgba(27,36,48,.08)' : 'rgba(27,36,48,.03)';
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(w, y); ctx.stroke();
      if (isNatural(m)) { ctx.fillStyle = isC ? 'rgba(27,36,48,.55)' : 'rgba(27,36,48,.32)'; ctx.fillText(nm(m), 4, y + 3); }
    }
    // прогресс фонограммы
    if (audio.duration) {
      seek.style.width = Math.min(100, (audio.currentTime / audio.duration) * 100) + '%';
      curEl.textContent = fmt(audio.currentTime);
    }
    // голос
    const buf = mic.read();
    let voiced = false, hz = null;
    if (buf) { const r = tracker.process(buf); voiced = r.voiced && mic.rms() > 0.0025; hz = r.smoothedHz; }
    if (voiced && hz) {
      const info = hzToNoteInfo(hz);
      const mm = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
      noteEl.innerHTML = mm ? `${mm[1]}<span class="oct">${mm[2]}</span>` : info.name;
      noteEl.classList.remove('silent');
      trail.push(yFor(hz, h));
    } else { noteEl.textContent = '—'; noteEl.classList.add('silent'); trail.push(null); }
    while (trail.length > 90) trail.shift();
    // длинный хвост (как договаривались — для наглядности/вибрато)
    const bx = w - 28;
    for (let i = 0; i < trail.length; i++) {
      if (trail[i] == null) continue;
      const x = bx - (trail.length - 1 - i) * 2.4;
      const last = i === trail.length - 1;
      ctx.fillStyle = last ? '#2fab84' : 'rgba(47,171,132,.35)';
      if (last) { ctx.shadowColor = '#2fab84'; ctx.shadowBlur = 16; }
      ctx.beginPath(); ctx.arc(x, trail[i], last ? 8 : 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    rafId = requestAnimationFrame(loop);
  }
  loop();

  function stop() {
    if (rafId) cancelAnimationFrame(rafId); rafId = null;
    window.removeEventListener('resize', resize);
    try { audio.pause(); audio.src = ''; } catch (e) { /* ok */ }
  }
}
