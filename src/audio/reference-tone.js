// reference-tone.js — проигрывание эталонного тона на ТОМ ЖЕ AudioContext, что и
// микрофон (контекст уже разрешён пользовательским жестом). Без внешних зависимостей.
// Мягкая огибающая + лёгкие обертоны → приятный «вокальный» тембр, не резкий синус.

// На телефоне динамик тише → бустим общий выход. Лимитер (компрессор) не даёт клиппинга.
const _MOBILE = (() => {
  try { return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints || 0) > 1; }
  catch (e) { return false; }
})();
const OUTPUT_GAIN = _MOBILE ? 2.8 : 1.8;

// Пользовательский множитель громкости выхода (регулятор в настройках/упражнении).
// По умолчанию — дефолт устройства; setOutputVolume меняет на лету (и на уже открытом контексте).
let _userVol = OUTPUT_GAIN;
let _lastCtx = null;
export function setOutputVolume(mult) {
  if (!Number.isFinite(mult) || mult <= 0) return;
  _userVol = mult;
  if (_lastCtx && _lastCtx.__rtGain) {
    try { _lastCtx.__rtGain.gain.setTargetAtTime(mult, _lastCtx.currentTime, 0.02); } catch (e) { /* ok */ }
  }
}

/** Общий мастер-выход на контексте: тоны → компрессор-лимитер → усиление → колонки. */
function masterIn(ctx) {
  if (ctx.__rtMaster) { _lastCtx = ctx; return ctx.__rtMaster; }
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10; comp.knee.value = 24; comp.ratio.value = 4;
  comp.attack.value = 0.003; comp.release.value = 0.25;
  const g = ctx.createGain(); g.gain.value = _userVol;
  comp.connect(g).connect(ctx.destination);
  ctx.__rtMaster = comp; ctx.__rtGain = g; _lastCtx = ctx;
  return comp;
}

// Тембр поводыря/эталона: 'piano' | 'guitar' | 'soft'. По умолчанию пиано (узнаваемо).
export function playTone(ctx, hz, dur = 0.6, when = 0, gain = 0.22, timbre = 'piano') {
  const t = ctx.currentTime + when;
  const out = ctx.createGain();
  out.connect(masterIn(ctx));
  const oscs = [];
  let ring = dur; // фактическая длина звучания (нота «звенит» и затухает)
  const mk = (type, freq, amp, dest) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = amp;
    o.connect(g).connect(dest); o.start(t); o.stop(t + ring + 0.08); oscs.push(o);
  };

  if (timbre === 'piano') {
    // фортепиано: ударная атака + долгий естественный звон/затухание
    ring = Math.max(1.6, dur);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + ring);
    [[1, 1], [2, 0.5], [3, 0.25], [4, 0.12]].forEach(([m, a]) => mk('sine', hz * m, a, out));
  } else if (timbre === 'guitar') {
    // струна: щипок + звон с затуханием
    ring = Math.max(1.3, dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3800, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + ring);
    lp.connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, t + ring);
    [[1, 1], [2, 0.32]].forEach(([m, a]) => mk('sawtooth', hz * m, a, lp));
  } else {
    // soft — мягкий «вокальный» тон (ровная огибающая, тянется на dur)
    ring = Math.max(0.2, dur);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.025);
    out.gain.setValueAtTime(gain, t + Math.max(0.05, ring - 0.1));
    out.gain.linearRampToValueAtTime(0, t + ring);
    mk('triangle', hz, 1, out); mk('triangle', hz * 2, 0.18, out);
  }
  return {
    dur,
    stop() { try { oscs.forEach((o) => { o.stop(); o.disconnect(); }); out.disconnect(); } catch (e) { /* ok */ } },
  };
}

/** Аккорд тоники (мажорное трезвучие от rootMidi) — даёт ученику опору тональности. */
export function playChord(ctx, rootMidi, when = 0, dur = 1.4, gain = 0.14, timbre = 'piano') {
  [0, 4, 7].forEach((s) => {
    const hz = 440 * Math.pow(2, (rootMidi + s - 69) / 12);
    playTone(ctx, hz, dur, when, gain, timbre);
  });
  return dur;
}

/** Проиграть последовательность опорных нот. */
export function playSequence(ctx, freqs, secPerNote = 0.42, timbre = 'piano') {
  freqs.forEach((hz, i) => playTone(ctx, hz, secPerNote * 0.9, i * secPerNote, 0.22, timbre));
  return freqs.length * secPerNote;
}

/** Образец-мелодия в РЕАЛЬНОМ ритме упражнения: длительности и паузы (gap) как в нотах.
 *  Раньше образец играл все ноты ровными — музыкант слышал «неправильный ритм». */
export function playMelody(ctx, notes, tempo, timbre = 'piano', gain = 0.22) {
  const spb = 60 / (tempo || 90);
  let t = 0;
  for (const n of notes) {
    const hz = 440 * Math.pow(2, (n.midi - 69) / 12);
    playTone(ctx, hz, Math.max(0.18, n.beats * spb * 0.92), t, gain, timbre);
    t += (n.beats + (n.gap || 0)) * spb;
  }
  return t;
}

/** Короткий метроном-«тик». accent=true — выше и громче (сильная доля). */
export function playClick(ctx, when = 0, accent = false) {
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.value = accent ? 1600 : 1050;
  const peak = accent ? 0.4 : 0.26;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(g).connect(masterIn(ctx));
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Подложка-дрон (тоника: основа + квинта + октава), тихо, на всё упражнение.
 *  Возвращает хэндл со stop(). */
export function playDrone(ctx, rootMidi, dur, gain = 0.05) {
  const handles = [0, 7, 12].map((s) => {
    const hz = 440 * Math.pow(2, (rootMidi + s - 69) / 12);
    return playTone(ctx, hz, dur, 0, gain, 'soft'); // дрон должен тянуться
  });
  return { stop() { try { handles.forEach((h) => h.stop()); } catch (e) { /* ok */ } } };
}
