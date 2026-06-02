// onboarding-range.js — определение комфортного диапазона голоса.
// Шаг 1: спеть самую низкую удобную ноту и «поймать».
// Шаг 2: спеть самую высокую удобную (без напряжения!) и «поймать».
// Результат сохраняется в progress; тип голоса НЕ определяем (нужен педагог).
import { hzToNoteInfo } from '../theory/note-map.js';
import * as progress from '../state/progress.js';

export function renderOnboarding(app, mic, tracker, { onDone, onExit }) {
  let step = 'low';
  let lowMidi = null;
  let lastVoicedMidi = null;
  let rafId = null;

  function paint() {
    const isLow = step === 'low';
    app.innerHTML = `
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Твой диапазон</h1>
          <p>${isLow
            ? 'Спой свою <b>самую низкую удобную</b> ноту и тяни её ровно.'
            : 'Теперь — <b>самую высокую</b>, но <b>без напряжения</b>. Не форсируй верх!'}</p>
        </div>
        <div class="note-display silent" id="note">—</div>
        <p class="hint" id="status">Пой — поймаю ноту, когда зазвучит ровно.</p>
        <button class="btn btn-primary" id="catch" style="width:100%" disabled>
          ${isLow ? 'Поймать нижнюю ноту' : 'Поймать верхнюю ноту'}
        </button>
        ${lowMidi != null ? `<p class="hint">Низ записан: <b>${nm(lowMidi)}</b></p>` : ''}
      </div>
    `;
    document.getElementById('back').addEventListener('click', () => { stop(); onExit(); });
    document.getElementById('catch').addEventListener('click', capture);
  }

  const noteId = () => document.getElementById('note');

  function loop() {
    const buf = mic.read();
    const noteEl = noteId();
    const catchBtn = document.getElementById('catch');
    if (buf && noteEl) {
      const { smoothedHz, voiced } = tracker.process(buf);
      if (voiced && smoothedHz) {
        const info = hzToNoteInfo(smoothedHz);
        lastVoicedMidi = info.nearestMidi;
        const m = info.name.match(/^([A-G]#?)(-?\d+)$/);
        noteEl.className = 'note-display green';
        noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
        if (catchBtn) catchBtn.disabled = false;
      } else {
        noteEl.className = 'note-display silent';
        noteEl.textContent = '—';
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  function capture() {
    if (lastVoicedMidi == null) return;
    if (step === 'low') {
      lowMidi = lastVoicedMidi;
      step = 'high';
      paint();
    } else {
      let highMidi = lastVoicedMidi;
      if (highMidi <= lowMidi) highMidi = lowMidi + 7; // защита от перепутанного порядка
      stop();
      const range = progress.setRange(lowMidi, highMidi);
      onDone(range);
    }
  }

  function stop() { if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  tracker.reset();
  paint();
  loop();
}

function nm(midi) {
  const info = hzToNoteInfo(440 * Math.pow(2, (midi - 69) / 12));
  return info ? info.name : '';
}
