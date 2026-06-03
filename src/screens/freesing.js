// freesing.js — режим «Распевайся»: мычишь и ВСЕГДА видишь, где твой голос.
// Вертикальная нотная шкала + светящийся шарик (без оценки). Для тех, кто плохо
// слышит свою высоту и хочет просто сориентироваться.
import { hzToNoteInfo, midiToHz } from '../theory/note-map.js';
import * as progress from '../state/progress.js';

const NAT = [0, 2, 4, 5, 7, 9, 11]; // натуральные ступени (без диезов)
const isNatural = (m) => NAT.includes(((m % 12) + 12) % 12);
function nm(midi) { const i = hzToNoteInfo(midiToHz(midi)); return i ? i.name : ''; }

export function renderFreesing(app, mic, tracker, { onExit, lowMidi = 41, highMidi = 81 }) {
  let rafId = null;
  // лёгкий запас по краям
  const loM = lowMidi - 2, hiM = highMidi + 2;
  const minHz = midiToHz(loM), maxHz = midiToHz(hiM);

  app.innerHTML = `
    <div class="screen freesing">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Распевайся</h1><p>Мычи или тяни звук — и смотри, где твой голос. Без оценки.</p></div>
      <div class="fs-note silent" id="note">—</div>
      <div class="cents-row"><span id="cents">центы: —</span></div>
      <div class="bar"><i id="lvl"></i></div>
      <div class="settings" style="margin-top:6px">
        <div class="seg-label">Чувствительность микрофона</div>
        <div class="seg" id="sens"></div>
      </div>
      <div class="trace-wrap"><canvas class="trace fs-canvas" id="fs"></canvas></div>
      <p class="hint">Если индикатор почти не двигается — подними чувствительность. Если дёргается от шума — опусти. Шарик показывает твою ноту.</p>
    </div>
  `;
  document.getElementById('back').addEventListener('click', () => { stop(); onExit(); });

  // регулятор чувствительности (усиление входа) — применяется ко всему приложению
  function renderSens() {
    const cur = progress.getSensitivityKey();
    document.getElementById('sens').innerHTML = [['low', 'Низкая'], ['med', 'Средняя'], ['high', 'Высокая']]
      .map(([k, l]) => `<button data-sens="${k}" class="${cur === k ? 'on' : ''}">${l}</button>`).join('');
    document.querySelectorAll('[data-sens]').forEach((b) => b.addEventListener('click', () => {
      progress.setSensitivity(b.dataset.sens);
      if (mic.setSensitivity) mic.setSensitivity(progress.getSensitivity());
      renderSens();
    }));
  }
  renderSens();

  const noteEl = document.getElementById('note');
  const centsEl = document.getElementById('cents');
  const lvlEl = document.getElementById('lvl');
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

  function yFor(hz, h) {
    const c = Math.max(minHz, Math.min(maxHz, hz));
    const f = Math.log2(c / minHz) / Math.log2(maxHz / minHz);
    return h - f * h;
  }

  const trail = []; // последние позиции шарика
  if (tracker.setRange) tracker.setRange(55, 1300); // широко: показываем любую ноту
  tracker.reset();

  function loop() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // нотная лесенка
    ctx.font = '10px Inter, sans-serif';
    for (let m = Math.ceil(loM); m <= hiM; m++) {
      const y = yFor(midiToHz(m), h);
      const isC = ((m % 12) + 12) % 12 === 0;
      ctx.strokeStyle = isC ? 'rgba(255,255,255,.14)' : isNatural(m) ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.02)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(w, y); ctx.stroke();
      if (isNatural(m)) {
        ctx.fillStyle = isC ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.22)';
        ctx.fillText(nm(m), 4, y + 3);
      }
    }

    const buf = mic.read();
    let voiced = false, hz = null;
    if (buf) { const r = tracker.process(buf); voiced = r.voiced && mic.rms() > 0.006; hz = r.smoothedHz; }

    if (voiced && hz) {
      const info = hzToNoteInfo(hz);
      const mm = (info.name || '').match(/^([A-G]#?)(-?\d+)$/);
      noteEl.innerHTML = mm ? `${mm[1]}<span class="oct">${mm[2]}</span>` : info.name;
      noteEl.classList.remove('silent');
      centsEl.textContent = `центы: ${info.cents > 0 ? '+' : ''}${info.cents}`;
      lvlEl.style.width = Math.min(100, mic.rms() * 350) + '%';
      const y = yFor(hz, h);
      trail.push(y);
    } else {
      noteEl.textContent = '—';
      noteEl.classList.add('silent');
      centsEl.textContent = 'центы: —';
      lvlEl.style.width = '0%';
      trail.push(null);
    }
    while (trail.length > 90) trail.shift();

    // след + шарик на правом столбце
    const bx = w - 28;
    for (let i = 0; i < trail.length; i++) {
      if (trail[i] == null) continue;
      const x = bx - (trail.length - 1 - i) * 2.4;
      const last = i === trail.length - 1;
      ctx.fillStyle = last ? '#34dd98' : 'rgba(52,221,152,.35)';
      if (last) { ctx.shadowColor = '#34dd98'; ctx.shadowBlur = 16; }
      ctx.beginPath(); ctx.arc(x, trail[i], last ? 8 : 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafId = requestAnimationFrame(loop);
  }
  loop();

  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = null; window.removeEventListener('resize', resize); }
}
