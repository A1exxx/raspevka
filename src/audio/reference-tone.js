// reference-tone.js — проигрывание эталонного тона на ТОМ ЖЕ AudioContext, что и
// микрофон (контекст уже разрешён пользовательским жестом). Без внешних зависимостей.
// Мягкая огибающая + лёгкие обертоны → приятный «вокальный» тембр, не резкий синус.

// Тембр поводыря/эталона: 'piano' | 'guitar' | 'soft'. По умолчанию пиано (узнаваемо).
export function playTone(ctx, hz, dur = 0.6, when = 0, gain = 0.22, timbre = 'piano') {
  const t = ctx.currentTime + when;
  const out = ctx.createGain();
  out.connect(ctx.destination);
  const oscs = [];
  const mk = (type, freq, amp, dest) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = amp;
    o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.06); oscs.push(o);
  };

  if (timbre === 'piano') {
    // партиалы + перкуссивное затухание
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.35, dur));
    [[1, 1], [2, 0.5], [3, 0.25], [4, 0.12]].forEach(([m, a]) => mk('sine', hz * m, a, out));
  } else if (timbre === 'guitar') {
    // пиццикато: пила через затухающий low-pass
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3800, t);
    lp.frequency.exponentialRampToValueAtTime(800, t + Math.max(0.4, dur));
    lp.connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.45, dur));
    [[1, 1], [2, 0.32]].forEach(([m, a]) => mk('sawtooth', hz * m, a, lp));
  } else {
    // soft — мягкий «вокальный» тон (как было), ровная огибающая
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.025);
    out.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.1));
    out.gain.linearRampToValueAtTime(0, t + dur);
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
  osc.connect(g).connect(ctx.destination);
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
