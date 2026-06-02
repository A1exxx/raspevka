// note-highway.js — рендер «нотного хайвея»: целевые ноты-плашки едут справа налево
// к вертикальной линии попадания; голос игрока — светящийся шарик на этой линии.
// Сам определяет активную ноту и зону попадания для скоринга.

import { midiToHz, centsOff, centsZone } from '../theory/note-map.js';
import { Note } from 'tonal';

export class NoteHighway {
  constructor(canvas, exercise, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ex = exercise;
    this.secPerBeat = 60 / (exercise.tempo || 90);
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
    return { index: active.index, zone: centsZone(cents), voiced: true };
  }

  draw(now, sungHz, voiced) {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const hitX = w * this.hitFrac;
    ctx.clearRect(0, 0, w, h);

    // горизонтальные ориентиры по полутонам + подписи нот
    for (let m = Math.ceil(this.minMidi); m <= this.maxMidi; m++) {
      const y = this.yFor(midiToHz(m), h);
      const name = Note.fromMidi(m);
      const isC = name && name.startsWith('C');
      ctx.strokeStyle = isC ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.05)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      if (isC) {
        ctx.fillStyle = 'rgba(255,255,255,.3)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(name, 4, y - 3);
      }
    }

    // линия попадания
    ctx.strokeStyle = 'rgba(255,138,107,.55)';
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
      ctx.fillStyle = isActive
        ? 'rgba(255,107,94,.95)'
        : 'rgba(243,201,105,.40)';
      roundRect(ctx, x, y - noteH / 2, Math.max(wgt, 10), noteH, r);
      ctx.fill();
      if (isActive) {
        ctx.shadowColor = 'rgba(255,107,94,.7)';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // шарик голоса на линии попадания
    if (voiced && sungHz) {
      const y = this.yFor(sungHz, h);
      let color = '#888';
      if (active) {
        const cents = Math.abs(centsOff(sungHz, active.seg.hz));
        const z = centsZone(cents);
        color = z === 'green' ? '#4cd6a0' : z === 'yellow' ? '#f3c969' : '#ff6b5e';
      }
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(hitX, y, 7, 0, Math.PI * 2);
      ctx.fill();
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
