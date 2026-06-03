// reference-tone.js — проигрывание эталонного тона на ТОМ ЖЕ AudioContext, что и
// микрофон (контекст уже разрешён пользовательским жестом). Без внешних зависимостей.
// Мягкая огибающая + лёгкие обертоны → приятный «вокальный» тембр, не резкий синус.

export function playTone(ctx, hz, dur = 0.6, when = 0, gain = 0.22) {
  const t = ctx.currentTime + when;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(gain, t + 0.025);
  out.gain.setValueAtTime(gain, t + Math.max(0.05, dur - 0.1));
  out.gain.linearRampToValueAtTime(0, t + dur);
  out.connect(ctx.destination);

  // основной тон + тихая октава для теплоты
  const oscs = [];
  [[hz, 1], [hz * 2, 0.18]].forEach(([f, amp]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    g.gain.value = amp;
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.03);
    oscs.push(osc);
  });
  // Хэндл для немедленной остановки (выход/рестарт/сворачивание).
  return {
    dur,
    stop() {
      try { oscs.forEach((o) => { o.stop(); o.disconnect(); }); out.disconnect(); } catch (e) { /* уже остановлен */ }
    },
  };
}

/** Аккорд тоники (мажорное трезвучие от rootMidi) — даёт ученику опору тональности. */
export function playChord(ctx, rootMidi, when = 0, dur = 1.4, gain = 0.14) {
  [0, 4, 7].forEach((s) => {
    const hz = 440 * Math.pow(2, (rootMidi + s - 69) / 12);
    playTone(ctx, hz, dur, when, gain);
  });
  return dur;
}

/** Проиграть последовательность опорных нот. Возвращает общую длительность (сек). */
export function playSequence(ctx, freqs, secPerNote = 0.42) {
  freqs.forEach((hz, i) => playTone(ctx, hz, secPerNote * 0.9, i * secPerNote));
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
    return playTone(ctx, hz, dur, 0, gain);
  });
  return { stop() { try { handles.forEach((h) => h.stop()); } catch (e) { /* ok */ } } };
}
