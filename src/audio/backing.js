// backing.js — ритмичная подложка-грув под распевку (синтез, без сэмплов).
// Барабаны (кик/снэр/хэт) + бас + аккорд-стэбы. Акцент на слабую долю (backbeat) —
// чтобы хотелось двигаться. Тоника = root упражнения → грув сам поднимается на полутон
// вместе с транспозицией повторов. Аккорды — «пустые» (квинты), гармоничны с любым ладом.
import { midiToHz } from '../theory/note-map.js';

function noiseBuf(ctx) {
  if (ctx.__noise) return ctx.__noise;
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  ctx.__noise = b;
  return b;
}

// 8 восьмых на такт (4/4). Сильные доли: 0,2,4,6. Слабые (off-beat): 1,3,5,7.
// Басовые ноты = смещения в полутонах от баса (root-12). Берём только консонансы,
// безопасные в любом ладу: 0 (тоника), 5 (кварта), 7 (квинта), 12 (октава) — басовый
// риф звучит «своей мелодией», но не конфликтует с минором/ладами распевки.
const STYLES = {
  pop:    { kick: [0, 4], snare: [2, 6], hatOpen: [7], bass: [[0, 0], [3, 0], [4, 7]], stab: [3, 7], swing: 0 },
  funk:   { kick: [0, 3, 6], snare: [2, 6], hatOpen: [3, 7], bass: [[0, 0], [1, 7], [4, 0], [6, 7]], stab: [1, 3, 5, 7], swing: 0.18 },
  soft:   { kick: [0, 4], snare: [6], hatOpen: [], bass: [[0, 0], [4, 7]], stab: [3], swing: 0 },
  drive:  { kick: [0, 2, 4, 6], snare: [2, 6], hatOpen: [], bass: [[0, 0], [2, 0], [4, 7], [6, 7]], stab: [4], swing: 0 },
  march:  { kick: [0, 2, 4, 6], snare: [4], hatOpen: [0, 4], bass: [[0, 0], [2, 7], [4, 0], [6, 7]], stab: [], swing: 0 },
  swing:  { kick: [0, 4], snare: [2, 6], hatOpen: [3, 7], bass: [[0, 0], [3, 5], [4, 7], [6, 12]], stab: [3, 7], swing: 0.34 },
  ballad: { kick: [0], snare: [4], hatOpen: [], bass: [[0, 0], [4, 7]], stab: [2, 6], swing: 0 },
  latin:  { kick: [0, 3, 6], snare: [2, 7], hatOpen: [5], bass: [[0, 0], [3, 7], [6, 5]], stab: [2, 5], swing: 0 },
};

export function startGroove(ctx, { rootMidi = 60, tempo = 100, dur = 16, style = 'pop', gain = 0.5, when = 0 } = {}) {
  const cfg = STYLES[style] || STYLES.pop;
  const t0 = ctx.currentTime + when;
  const spb = 60 / tempo;       // сек/долю
  const eighth = spb / 2;
  const bar = spb * 4;
  const nbars = Math.ceil(dur / bar) + 1;

  const out = ctx.createGain(); out.gain.value = gain;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.ratio.value = 4;
  out.connect(comp).connect(ctx.destination);
  const nodes = [];

  const kick = (t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.2); nodes.push(o);
  };
  const snare = (t) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    s.connect(bp).connect(g).connect(out); s.start(t); s.stop(t + 0.16); nodes.push(s);
  };
  const hat = (t, open) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); const d = open ? 0.12 : 0.035;
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(hp).connect(g).connect(out); s.start(t); s.stop(t + d + 0.02); nodes.push(s);
  };
  const bass = (t, midi, d) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = midiToHz(midi);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + 0.01);
    g.gain.setValueAtTime(0.4, t + d * 0.5); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(out); o.start(t); o.stop(t + d + 0.02); nodes.push(o);
  };
  const stab = (t) => {
    [rootMidi, rootMidi + 7, rootMidi + 12].forEach((m) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = midiToHz(m);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.2); nodes.push(o);
    });
  };

  const bassRoot = rootMidi - 12;
  for (let b = 0; b < nbars; b++) {
    const bt = t0 + b * bar;
    const slot = (i) => bt + i * eighth + (i % 2 ? cfg.swing * eighth : 0); // свинг на слабую долю
    cfg.kick.forEach((i) => kick(slot(i)));
    cfg.snare.forEach((i) => snare(slot(i)));
    for (let i = 0; i < 8; i++) hat(slot(i), cfg.hatOpen.includes(i)); // хэт на каждую восьмую — драйв
    cfg.bass.forEach(([i, off]) => bass(slot(i), bassRoot + off, eighth * 1.6));
    cfg.stab.forEach((i) => stab(slot(i)));
  }

  return {
    // На динамике грув протекает в микрофон и портит детекцию высоты. Пока пользователь
    // поёт — приглушаем подложку (duck), в паузах возвращаем полную громкость.
    duck(on) {
      const target = on ? gain * 0.25 : gain;
      try { out.gain.setTargetAtTime(target, ctx.currentTime, 0.04); } catch (e) { /* ok */ }
    },
    stop() {
      try { nodes.forEach((n) => { try { n.stop(); } catch (e) { /* уже остановлен */ } n.disconnect && n.disconnect(); }); out.disconnect(); comp.disconnect(); }
      catch (e) { /* ok */ }
    },
  };
}
