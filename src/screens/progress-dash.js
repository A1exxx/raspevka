// progress-dash.js — дашборд прогресса: стрик, сессии, рост диапазона, точность, выдох.
import * as progress from '../state/progress.js';
import { getVoiceType, midiName } from '../theory/voice-types.js';

function dayStr(d) { return d.toISOString().slice(0, 10); }

export function renderDashboard(app, { onExit }) {
  const history = progress.getHistory();
  const rangeHist = progress.getRangeHistory();
  const streak = progress.getStreak();
  const total = progress.getTotal();
  const breath = progress.getBreathBest();
  const voice = progress.getVoice();
  const vType = voice && getVoiceType(voice.key);

  // ---- Календарь: последние 14 дней ----
  const doneDays = new Set(history.map((h) => h.date));
  const cal = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    cal.push(`<span class="cal-dot ${doneDays.has(dayStr(d)) ? 'done' : ''}"></span>`);
  }

  // ---- Бары точности: последние 12 сессий ----
  const recent = history.slice(-12);
  const bars = recent.length
    ? recent.map((h) => {
        const pct = Math.round((h.pct || 0) * 100);
        const cls = h.stars >= 3 ? 'g' : h.stars === 2 ? 'a' : 'c';
        return `<div class="acc-bar ${cls}" style="height:${Math.max(6, pct)}%" title="${pct}%"></div>`;
      }).join('')
    : '<p class="hint">Пройди распевку — здесь появится история точности.</p>';

  // ---- Рост диапазона ----
  let rangeBlock = '';
  const lowHigh = rangeHist.length ? rangeHist[rangeHist.length - 1] : (voice && voice.low != null ? voice : null);
  if (lowHigh && lowHigh.low != null) {
    const span = lowHigh.high - lowHigh.low;
    let growth = '';
    if (rangeHist.length >= 2) {
      const first = rangeHist[0];
      const g = (lowHigh.high - lowHigh.low) - (first.high - first.low);
      if (g > 0) growth = ` · <span style="color:var(--green)">+${g} пт с начала</span>`;
    }
    rangeBlock = `
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${midiName(lowHigh.low)} – ${midiName(lowHigh.high)}</b> · ${span} полутонов${growth}</p>
        ${vType ? `<p class="how">Тип: ${vType.name}</p>` : ''}
      </div>`;
  }

  app.innerHTML = `
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Прогресс</h1></div>

      <div class="stat-row">
        <div class="stat-tile"><div class="stat-num">${streak}</div><div class="stat-lbl">стрик, дн.</div></div>
        <div class="stat-tile"><div class="stat-num">${total}</div><div class="stat-lbl">сессий</div></div>
        <div class="stat-tile"><div class="stat-num">${breath ? breath.toFixed(0) : '—'}</div><div class="stat-lbl">выдох, сек</div></div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Последние 14 дней</div>
        <div class="cal-row">${cal.join('')}</div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Точность последних занятий</div>
        <div class="acc-chart">${bars}</div>
      </div>

      ${rangeBlock}

      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('back2').addEventListener('click', onExit);
}
