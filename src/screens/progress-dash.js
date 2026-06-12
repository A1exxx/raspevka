// progress-dash.js — дашборд прогресса: стрик, сессии, рост диапазона, точность, выдох.
import * as progress from '../state/progress.js';
import { getVoiceType, midiName } from '../theory/voice-types.js';
import { miniKeyboard } from '../ui/illustrations.js';
import { shareCard } from '../ui/share-card.js';

function dayStr(d) { return d.toISOString().slice(0, 10); }

/** Мини-график роста диапазона во времени: линии низа и верха по точкам истории. */
function rangeTimeline(hist) {
  if (!hist || hist.length < 2) return '';
  const n = hist.length;
  const lows = hist.map((p) => p.low), highs = hist.map((p) => p.high);
  const mn = Math.min(...lows) - 1, mx = Math.max(...highs) + 1, span = Math.max(1, mx - mn);
  const W = 300, H = 70, pad = 5;
  const x = (i) => (pad + (i * (W - 2 * pad)) / (n - 1)).toFixed(1);
  const y = (m) => (pad + (1 - (m - mn) / span) * (H - 2 * pad)).toFixed(1);
  const path = (arr) => arr.map((m, i) => `${i ? 'L' : 'M'}${x(i)} ${y(m)}`).join(' ');
  return `
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${path(highs)}" class="tl-high"/>
      <path d="${path(lows)}" class="tl-low"/>
      <circle cx="${x(n - 1)}" cy="${y(highs[n - 1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${x(n - 1)}" cy="${y(lows[n - 1])}" r="3.5" class="tl-dot-l"/>
    </svg>`;
}

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
        ${miniKeyboard(lowHigh.low, lowHigh.high)}
        ${rangeTimeline(rangeHist)}
        ${vType ? `<p class="how">Тембр: ${vType.name}</p>` : ''}
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

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('back2').addEventListener('click', onExit);
  const shareBtn = document.getElementById('share');
  if (shareBtn) shareBtn.addEventListener('click', () => {
    if (lowHigh && lowHigh.low != null) {
      const span = lowHigh.high - lowHigh.low;
      shareCard({ headline: 'Мой диапазон', big: `${midiName(lowHigh.low)}–${midiName(lowHigh.high)}`, sub: `${span} полутонов${streak > 0 ? ` · стрик ${streak}` : ''}` });
    } else {
      shareCard({ headline: 'Мой прогресс', big: `${streak}`, sub: 'дней подряд в Распевке' });
    }
  });
}
