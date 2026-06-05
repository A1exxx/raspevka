// calibrate.js — экран калибровки задержки. Акустический loopback: динамик играет
// щелчки, микрофон ловит эхо → измеряем реальную аудио-латентность. Плюс ручной
// слайдер тонкой подстройки. Требует включённый микрофон (оборачивается enterMic).
import { playClick } from '../audio/reference-tone.js';
import { findEchoDelay, reduceDelays } from '../audio/latency-calibrate.js';
import * as progress from '../state/progress.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function renderCalibrate(app, mic, { onExit }) {
  let measuring = false;
  let note = '';

  function render() {
    const ms = Math.round(progress.getLatency() * 1000);
    app.innerHTML = `
      <div class="screen calibrate">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Калибровка задержки</h1>
          <p>Звук с динамика доходит до микрофона не мгновенно — особенно по Bluetooth. Измерим задержку, чтобы счёт был честным.</p></div>

        <div class="card">
          <div class="cal-big"><b id="curms">${ms}</b> мс <span class="set-hint">текущая компенсация</span></div>
          <p class="hint" style="margin:6px 0 14px">Положи телефон перед собой, без наушников, в тишине. Нажми «Измерить» — прозвучат 3 щелчка, приложение поймает их эхо.</p>
          <button class="btn btn-primary" id="measure" style="width:100%" ${measuring ? 'disabled' : ''}>${measuring ? 'Измеряю…' : 'Измерить задержку'}</button>
          ${note ? `<p class="hint" id="note" style="margin-top:12px">${note}</p>` : ''}
        </div>

        <div class="card">
          <div class="seg-label">Тонкая подстройка вручную</div>
          <input type="range" id="slider" min="30" max="400" step="5" value="${ms}" class="cal-slider" />
          <div class="cal-slider-row"><span>30 мс</span><span id="slval">${ms} мс</span><span>400 мс</span></div>
          <p class="hint" style="margin-top:8px">Если в упражнении кажется, что счёт «опаздывает» — увеличь; если «спешит» — уменьши.</p>
        </div>
      </div>
    `;
    document.getElementById('back').addEventListener('click', onExit);
    document.getElementById('measure').addEventListener('click', measure);
    const slider = document.getElementById('slider');
    slider.addEventListener('input', () => {
      const v = Number(slider.value);
      document.getElementById('slval').textContent = v + ' мс';
      document.getElementById('curms').textContent = v;
      progress.setLatencyManual(v / 1000);
    });
  }

  // Один замер: щелчок + захват громкости по кадрам → задержка эха.
  function oneRound() {
    return new Promise((resolve) => {
      const ctx = mic.ctx;
      if (!ctx) { resolve(null); return; }
      const samples = [];
      const start = ctx.currentTime;
      const wallStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const clickTime = start + 0.15;
      playClick(ctx, 0.15, true);
      const loop = () => {
        mic.read();
        samples.push({ t: ctx.currentTime, rms: mic.rms() });
        const ctxElapsed = ctx.currentTime - start;
        const wallElapsed = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - wallStart) / 1000;
        // защита: если часы контекста «замёрзли» (suspended) — выходим по реальному времени, не зависаем
        // setTimeout (а не rAF): не зависает, если вкладка не на переднем плане
        if (ctxElapsed < 0.7 && wallElapsed < 1.3) setTimeout(loop, 16);
        else resolve(findEchoDelay(samples, clickTime));
      };
      loop();
    });
  }

  async function measure() {
    if (measuring) return;
    measuring = true; note = ''; render();
    const delays = [];
    for (let r = 0; r < 3; r++) {
      note = `Замер ${r + 1} из 3…`; render();
      delays.push(await oneRound());
      await sleep(300);
    }
    const med = reduceDelays(delays);
    measuring = false;
    if (med == null) {
      note = 'Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.';
    } else {
      progress.setLatencyManual(med);
      note = `Готово: задержка ≈ ${Math.round(med * 1000)} мс — сохранено.`;
    }
    render();
  }

  render();
}
