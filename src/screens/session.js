// session.js — полная распевка: цепочка упражнений в методически верном порядке.
// Порядок (по вокальной педагогике): разогрев → дыхание/гибкость → резонаторы →
// интонация → беглость → охлаждение. Между упражнениями — короткая заставка.
import { renderGame } from './game.js';
import { renderRhythm, RHYTHM } from './rhythm.js';
import { hum3, lipTrill } from '../theory/exercises.js';
import { getVoiceType } from '../theory/voice-types.js';
import * as progress from '../state/progress.js';

export function renderSession(app, mic, tracker, { onExit }) {
  // Корневой тон из центра типа голоса (иначе C4).
  const v = progress.getVoice();
  const t = v && getVoiceType(v.key);
  const root = t ? t.center : 60;

  // Порядок по запросу: дыхание/артикуляция (с/ш) → мычание → губной тренаж.
  const seq = [
    { title: 'Дыхание: длинные с / ш', tip: 'Ровный длинный выдох в такт.', rhythm: RHYTHM.air1 },
    { title: 'Дыхание: короткий с + 5 ш', tip: 'Активный выдох, вдох носом после серии.', rhythm: RHYTHM.air2 },
    { title: 'Артикуляция: 15 с + 15 ш', tip: 'Чётко и ровно с метрономом.', rhythm: RHYTHM.air3 },
    { title: 'Мычание по гамме «М»', tip: 'Мягко, в маску. Сначала прозвучит тоника.', ex: hum3(root) },
    { title: 'Губной тренаж «brrr»', tip: 'Губами «brrr» или на «Р», ровно.', ex: lipTrill(root) },
  ];

  let i = 0;
  const results = [];

  function next() {
    if (i >= seq.length) return finishSession();
    const step = seq[i];
    interstitial(step, i, () => {
      const onComplete = (res) => { results.push(res); i += 1; next(); };
      if (step.rhythm) renderRhythm(app, mic, root, step.rhythm, { onExit, onComplete });
      else renderGame(app, mic, tracker, step.ex, { onExit, onComplete });
    });
  }

  function interstitial(step, idx, go) {
    app.innerHTML = `
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${idx + 1} из ${seq.length}</div>
        <div class="brand"><h1>${step.title}</h1><p>${step.tip}</p></div>
        <div class="progress-dots">
          ${seq.map((_, k) => `<span class="dot ${k < idx ? 'done' : k === idx ? 'now' : ''}"></span>`).join('')}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `;
    document.getElementById('go').addEventListener('click', go);
    document.getElementById('quit').addEventListener('click', onExit);
  }

  function finishSession() {
    const scored = results.filter((r) => r && typeof r.pct === 'number');
    const avgPct = scored.length ? scored.reduce((a, r) => a + r.pct, 0) / scored.length : 1;
    const stars = avgPct >= 0.85 ? 3 : avgPct >= 0.6 ? 2 : avgPct >= 0.35 ? 1 : 0;
    const { streak } = progress.recordSession({ pct: avgPct, stars });
    const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    const pct = Math.round(avgPct * 100);
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">${starStr}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${pct}<span>%</span></div>
        <p class="hint">средняя точность по ${scored.length} ${scored.length === 1 ? 'распевке' : 'распевкам'} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${streak} ${streak === 1 ? 'день' : 'дн.'}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `;
    document.getElementById('menu').addEventListener('click', onExit);
  }

  next();
}
