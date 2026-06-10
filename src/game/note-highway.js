// note-highway.js — рендер «нотного хайвея»: целевые ноты-плашки едут справа налево
// к вертикальной линии попадания; голос игрока — светящийся шарик на этой линии.
// Сам определяет активную ноту и зону попадания для скоринга.

import { midiToHz, centsOff, centsZone } from '../theory/note-map.js';
import { Note } from 'tonal';

// Цветовые темы хайвея. Тёмная — «премиум-сцена»: светящиеся ноты и след голоса
// на почти чёрном фоне (фон рисует CSS .stage-dark, тут только цвета элементов).
const THEMES = {
  light: {
    grid: 'rgba(27,36,48,.07)', gridC: 'rgba(27,36,48,.18)', label: 'rgba(27,36,48,.42)',
    hitLine: 'rgba(14,141,127,.6)', note: 'rgba(14,141,127,.26)', noteActive: 'rgba(14,141,127,.95)',
    noteGlow: 'rgba(14,141,127,.5)', green: '#2fab84', yellow: '#e0a64a', red: '#e0544b',
    free: '#0e8d7f', glow: 0,
  },
  dark: {
    grid: 'rgba(255,255,255,.055)', gridC: 'rgba(255,255,255,.14)', label: 'rgba(255,255,255,.45)',
    hitLine: 'rgba(61,229,201,.7)', note: 'rgba(61,229,201,.2)', noteActive: 'rgba(61,229,201,.95)',
    noteGlow: 'rgba(61,229,201,.85)', green: '#3ee6a8', yellow: '#ffc24d', red: '#ff6b61',
    free: '#3de5c9', glow: 10,
  },
};

export class NoteHighway {
  constructor(canvas, exercise, opts = {}) {
    this.theme = THEMES[opts.theme] || THEMES.light;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ex = exercise;
    this.secPerBeat = 60 / (exercise.tempo || 90);
    // Пороги зон (центы). Для вибрато расширяем зелёную — колебание не штрафуем.
    this.greenCents = exercise.greenCents || 20;
    this.yellowCents = exercise.yellowCents || 40;
    this.pxPerSec = opts.pxPerSec || 150;
    this.hitFrac = opts.hitFrac ?? 0.26; // позиция линии попадания (доля ширины)
    this.leadIn = opts.leadIn ?? 2.2; // сек до первой ноты

    // тайминг нот
    let t = this.leadIn;
    this.timed = exercise.notes.map((n) => {
      const dur = n.beats * this.secPerBeat;
      const seg = { midi: n.midi, hz: midiToHz(n.midi), start: t, end: t + dur, dur };
      t += dur;
      return seg;
    });
    this.totalTime = t + 0.6;

    // вертикальный диапазон с запасом ±3 полутона
    const mids = exercise.notes.map((n) => n.midi);
    this.minMidi = Math.min(...mids) - 3;
    this.maxMidi = Math.max(...mids) + 3;

    this.trail = []; // последние позиции голоса (хвост — видно траекторию вверх/вниз)
  }

  // лог-шкала по локальному midi-диапазону (Hz -> Y)
  yFor(hz, h) {
    const minHz = midiToHz(this.minMidi);
    const maxHz = midiToHz(this.maxMidi);
    const clamped = Math.max(minHz, Math.min(maxHz, hz));
    const f = Math.log2(clamped / minHz) / Math.log2(maxHz / minHz);
    return h - f * h;
  }

  /** Активная нота в момент now (или null). */
  activeAt(now) {
    for (let i = 0; i < this.timed.length; i++) {
      if (now >= this.timed[i].start && now < this.timed[i].end) {
        return { index: i, seg: this.timed[i] };
      }
    }
    return null;
  }

  /**
   * Оценить кадр. Возвращает {index, zone, voiced} для скоринга.
   */
  evaluate(now, sungHz, voiced) {
    const active = this.activeAt(now);
    if (!active) return { index: -1, zone: null, voiced: false };
    if (!voiced || !sungHz) return { index: active.index, zone: 'red', voiced: false };
    const cents = Math.abs(centsOff(sungHz, active.seg.hz));
    return { index: active.index, zone: centsZone(cents, this.greenCents, this.yellowCents), voiced: true };
  }

  draw(now, sungHz, voiced) {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const hitX = w * this.hitFrac;
    ctx.clearRect(0, 0, w, h);

    const T = this.theme;
    // горизонтальные ориентиры по полутонам + подписи нот
    for (let m = Math.ceil(this.minMidi); m <= this.maxMidi; m++) {
      const y = this.yFor(midiToHz(m), h);
      const name = Note.fromMidi(m);
      const isC = name && name.startsWith('C');
      ctx.strokeStyle = isC ? T.gridC : T.grid;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      if (isC) {
        ctx.fillStyle = T.label;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(name, 4, y - 3);
      }
    }

    // линия попадания
    ctx.strokeStyle = T.hitLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.beginPath(); ctx.moveTo(hitX, 0); ctx.lineTo(hitX, h); ctx.stroke();
    ctx.setLineDash([]);

    // ноты-плашки
    const active = this.activeAt(now);
    const activeIdx = active ? active.index : -1;
    const noteH = 16;
    for (let i = 0; i < this.timed.length; i++) {
      const seg = this.timed[i];
      const x = hitX + (seg.start - now) * this.pxPerSec;
      const wgt = seg.dur * this.pxPerSec;
      if (x + wgt < -20 || x > w + 20) continue;
      const y = this.yFor(seg.hz, h);
      const isActive = i === activeIdx;
      const r = 8;
      ctx.fillStyle = isActive ? T.noteActive : T.note;
      roundRect(ctx, x, y - noteH / 2, Math.max(wgt, 10), noteH, r);
      ctx.fill();
      if (isActive) {
        ctx.shadowColor = T.noteGlow;
        ctx.shadowBlur = 18 + T.glow;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // голос: шарик на линии попадания + ХВОСТ (история — видно куда ведёшь голос)
    let curY = null, color = '#5e6b7a';
    if (voiced && sungHz) {
      curY = this.yFor(sungHz, h);
      if (active) {
        const z = centsZone(Math.abs(centsOff(sungHz, active.seg.hz)), this.greenCents, this.yellowCents);
        color = z === 'green' ? T.green : z === 'yellow' ? T.yellow : T.red;
      } else {
        color = T.free;
      }
    }
    this.trail.push(curY);
    while (this.trail.length > 70) this.trail.shift(); // длинный хвост — видно вибрато/траекторию

    const n = this.trail.length;
    const dx = 2.2; // история уходит влево от линии попадания (плотнее = дольше «живёт»)
    // линия хвоста — её наклон показывает направление (вверх/вниз)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.45;
    if (T.glow) { ctx.shadowColor = color; ctx.shadowBlur = T.glow; } // светящийся след на тёмной сцене
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < n; i++) {
      const y = this.trail[i];
      if (y == null) { started = false; continue; }
      const x = hitX - (n - 1 - i) * dx;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    // затухающие точки хвоста
    for (let i = 0; i < n; i++) {
      const y = this.trail[i];
      if (y == null) continue;
      const x = hitX - (n - 1 - i) * dx;
      ctx.globalAlpha = 0.12 + (i / n) * 0.5;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // текущий шарик
    if (curY != null) {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(hitX, curY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
