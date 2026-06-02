// session.js — полная распевка: цепочка упражнений в методически верном порядке.
// Порядок (по вокальной педагогике): разогрев → дыхание/гибкость → резонаторы →
// интонация → беглость → охлаждение. Между упражнениями — короткая заставка.
import { renderGame } from './game.js';
import { sustain, siren, fiveNoteScale, agilityRun } from '../theory/exercises.js';
import { getVoiceType } from '../theory/voice-types.js';
import * as progress from '../state/progress.js';

export function renderSession(app, mic, tracker, { onExit }) {
  // Корневой тон из центра типа голоса (иначе C4).
  const v = progress.getVoice();
  const t = v && getVoiceType(v.key);
  const root = t ? t.center : 60;

  const seq = [
    { title: 'Разогрев — мычание', tip: 'Тяни ровно, мягко, на «м-м-м».', ex: sustain(root, 6) },
    { title: 'Гибкость — сирена', tip: 'Плавно, как сирена, без рывков.', ex: siren(root) },
    { title: 'Интонация — гамма «Ма-Мэ»', tip: 'Чётко попадай в каждую ступеньку.', ex: fiveNoteScale(root) },
    { title: 'Беглость «Ма»', tip: 'Лёгко и быстро, не зажимайся.', ex: agilityRun(root) },
    { title: 'Охлаждение — долгая нота', tip: 'Спокойно отпусти голос на «А».', ex: sustain(root, 8) },
  ];
  // Масштаб темпа под выбранную сложность.
  const f = progress.difficultyFactor();
  seq.forEach((s) => { s.ex.tempo = Math.max(40, Math.round(s.ex.tempo * f)); });

  let i = 0;
  const results = [];

  function next() {
    if (i >= seq.length) return finishSession();
    interstitial(seq[i], i, () => {
      renderGame(app, mic, tracker, seq[i].ex, {
        onExit,
        onComplete: (res) => { results.push(res); i += 1; next(); },
      });
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
    const avgPct = results.reduce((a, r) => a + r.pct, 0) / (results.length || 1);
    const stars = avgPct >= 0.85 ? 3 : avgPct >= 0.6 ? 2 : avgPct >= 0.35 ? 1 : 0;
    const { streak } = progress.recordSession({ pct: avgPct, stars });
    const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    const pct = Math.round(avgPct * 100);
    app.innerHTML = `
      <div class="screen summary">
        <div class="stars">${starStr}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${pct}<span>%</span></div>
        <p class="hint">средняя точность за ${results.length} упражнений</p>
        <div class="streak-badge">🔥 Стрик: ${streak} ${streak === 1 ? 'день' : 'дн.'}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `;
    document.getElementById('menu').addEventListener('click', onExit);
  }

  next();
}
