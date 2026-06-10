// voice.js — определение/выбор типа голоса.
// Вход: либо выбрать тип вручную, либо «определить» — спеть низ и верх,
// мы усредняем устойчивый тон и классифицируем по диапазону.
import { VOICE_TYPES, classifyVoice, getVoiceType, rangeLabel, midiName } from '../theory/voice-types.js';
import { hzToNoteInfo } from '../theory/note-map.js';
import { miniKeyboard } from '../ui/illustrations.js';
import * as progress from '../state/progress.js';
import { celebrate, haptic } from '../ui/celebrate.js';

export function renderVoice(app, mic, tracker, { onDone, onExit, canSkip = false }) {
  let rafId = null;
  const stop = () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; };

  // ---------- Экран выбора ----------
  function intro() {
    stop();
    tracker.reset();
    const cur = progress.getVoice();
    const curType = cur && getVoiceType(cur.key);
    let gender = curType ? curType.group : 'муж';
    app.innerHTML = `
      <div class="screen">
        <div class="game-top">
          <button class="icon-btn" id="back">${canSkip ? 'Пропустить' : '‹ Меню'}</button>
        </div>
        <div class="brand"><h1>Твой голос</h1>
          <p>Знаешь свой тип — выбери. Не знаешь — определим за минуту.</p></div>
        <button class="btn btn-primary" id="detect" style="width:100%">Определить мой голос</button>
        <div class="settings">
          <div class="seg-label">Тембр голоса</div>
          <div class="seg" id="genderSeg">
            <button data-gender="муж" class="${gender === 'муж' ? 'on' : ''}">Мужские</button>
            <button data-gender="жен" class="${gender === 'жен' ? 'on' : ''}">Женские</button>
          </div>
        </div>
        <div class="card list">
          <div class="list-sep">Или выбери сам</div>
          <div id="voiceCards"></div>
        </div>
      </div>
    `;
    document.getElementById('back').addEventListener('click', onExit);
    document.getElementById('detect').addEventListener('click', explainTest);

    function renderCards() {
      const curV = progress.getVoice();
      document.getElementById('voiceCards').innerHTML = VOICE_TYPES
        .filter((v) => v.group === gender)
        .map((v) => `
          <button class="list-item voice-card" data-pick="${v.key}">
            <span class="li-main">${v.name}${curV && curV.key === v.key ? ' ·  выбран' : ''}</span>
            <span class="li-sub">${v.group === 'муж' ? 'мужской' : 'женский'} · ${rangeLabel(v)}</span>
          </button>`).join('');
      document.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
        progress.setVoice(b.dataset.pick);
        onDone(progress.getVoice());
      }));
    }
    document.querySelectorAll('[data-gender]').forEach((b) => b.addEventListener('click', () => {
      gender = b.dataset.gender;
      document.querySelectorAll('[data-gender]').forEach((x) => x.classList.toggle('on', x.dataset.gender === gender));
      renderCards();
    }));
    renderCards();
  }

  // ---------- Объяснение теста ----------
  function explainTest() {
    stop();
    app.innerHTML = `
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тип.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `;
    document.getElementById('back').addEventListener('click', intro);
    document.getElementById('go').addEventListener('click', () => capture('low'));
  }

  // ---------- Захват ноты (усреднение + стабильность) ----------
  function capture(step, lowMidi = null) {
    stop();
    const isLow = step === 'low';
    app.innerHTML = `
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${isLow ? 'Нижняя нота' : 'Верхняя нота'}</h1>
          <p>${isLow ? 'Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.' : 'Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>.'}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${lowMidi != null ? `<p class="hint">Низ записан: <b>${midiName(lowMidi)}</b></p>` : ''}
      </div>
    `;
    document.getElementById('back').addEventListener('click', () => (isLow ? explainTest() : capture('low')));

    const noteEl = document.getElementById('note');
    const statusEl = document.getElementById('status');
    const stabEl = document.getElementById('stab');

    const buf = [];           // последние смягчённые частоты
    const WIN = 24;           // ~0.4 c при 60fps
    const HOLD_MS = 1200;     // держать стабильно
    let holdStart = 0;
    let countdownShown = 0;

    function centsSpread(arr) {
      const min = Math.min(...arr), max = Math.max(...arr);
      return 1200 * Math.log2(max / min);
    }
    function median(arr) {
      const s = [...arr].sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)];
    }

    tracker.reset();
    // На время теста диапазона детекция должна быть широкой (ищем края голоса).
    if (tracker.setRange) tracker.setRange(55, 1300);
    function loop() {
      const b = mic.read();
      if (b) {
        const { smoothedHz, voiced } = tracker.process(b);
        if (voiced && smoothedHz) {
          const info = hzToNoteInfo(smoothedHz);
          const m = info.name.match(/^([A-G]#?)(-?\d+)$/);
          noteEl.className = 'note-display green';
          noteEl.innerHTML = m ? `${m[1]}<span class="oct">${m[2]}</span>` : info.name;
          buf.push(smoothedHz);
          if (buf.length > WIN) buf.shift();

          const stable = buf.length >= WIN && centsSpread(buf) < 110;
          if (stable) {
            if (!holdStart) holdStart = performance.now();
            const held = performance.now() - holdStart;
            stabEl.style.width = Math.min(100, (held / HOLD_MS) * 100) + '%';
            const secLeft = Math.ceil((HOLD_MS - held) / 1000);
            if (secLeft !== countdownShown) { countdownShown = secLeft; }
            statusEl.textContent = held < HOLD_MS ? `Держи… ${Math.max(1, secLeft)}` : 'Готово!';
            if (held >= HOLD_MS) return done(Math.round(hzToNoteInfo(median(buf)).midi));
          } else {
            holdStart = 0;
            stabEl.style.width = '0%';
            statusEl.textContent = 'Держи ровнее…';
          }
        } else {
          noteEl.className = 'note-display silent';
          noteEl.textContent = '—';
          holdStart = 0;
          stabEl.style.width = '0%';
          if (buf.length) buf.length = 0;
          statusEl.textContent = 'Пой и держи ровно…';
        }
      }
      rafId = requestAnimationFrame(loop);
    }
    loop();

    function done(midi) {
      stop();
      if (isLow) {
        capture('high', midi);
      } else {
        let low = lowMidi, high = midi;
        if (high <= low) high = low + 7;
        result(low, high);
      }
    }
  }

  // ---------- Результат ----------
  function result(low, high) {
    stop();
    const v = classifyVoice(low, high);
    progress.setVoice(v.key, low, high);
    celebrate(2); haptic(25); // «вау»-момент: голос определён
    app.innerHTML = `
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${v.name}</div>
        <p class="hint">${v.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${midiName(low)} – ${midiName(high)}</p>
          ${miniKeyboard(low, high)}
          <p class="how"><b>Типичный для ${v.name.toLowerCase()}:</b> ${rangeLabel(v)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `;
    document.getElementById('redo').addEventListener('click', explainTest);
    document.getElementById('ok').addEventListener('click', () => onDone(progress.getVoice()));
  }

  intro();
}
