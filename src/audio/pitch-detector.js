// pitch-detector.js — обёртка над pitchy (алгоритм McLeod/MPM).
// pitchy.findPitch -> [hz, clarity]. clarity (0..1) отсекает шум/придыхание.
// Сглаживаем частоту EMA, но НЕ через скачки (октавные прыжки не "размазываем").

import { PitchDetector } from 'pitchy';

const CENTS_SNAP_THRESHOLD = 150; // если новый тон дальше — снапим, а не сглаживаем

function centsBetween(a, b) {
  return 1200 * Math.log2(a / b);
}

export class PitchTracker {
  constructor(sampleRate, {
    fftSize = 2048,
    minClarity = 0.9,
    minHz = 60,
    maxHz = 1200,
    smoothing = 0.2,
  } = {}) {
    this.detector = PitchDetector.forFloat32Array(fftSize);
    this.sampleRate = sampleRate;
    this.minClarity = minClarity;
    this.minHz = minHz;
    this.maxHz = maxHz;
    this.k = smoothing;
    this.smoothed = null;
    this.win = []; // окно последних измерений (медиана давит одиночные выбросы)
  }

  /**
   * @param {Float32Array} buf буфер временной области
   * @returns {{hz:number|null, clarity:number, smoothedHz:number|null, voiced:boolean}}
   */
  process(buf) {
    const [hz, clarity] = this.detector.findPitch(buf, this.sampleRate);
    const voiced = clarity >= this.minClarity && hz >= this.minHz && hz <= this.maxHz;

    if (!voiced) {
      // тишина/шум: держим последнее сглаженное немного, но помечаем как невокализованное
      return { hz: null, clarity, smoothedHz: this.smoothed, voiced: false };
    }

    // Октавный гард: одиночный скачок ровно на ~октаву от текущего тона — почти всегда
    // ошибка детектора (поймал гармонику/субгармонику), а не реальное пение. Подтягиваем.
    let measured = hz;
    if (this.smoothed) {
      const c = centsBetween(measured, this.smoothed);
      if (Math.abs(Math.abs(c) - 1200) < 70) measured = c > 0 ? measured / 2 : measured * 2;
    }

    // Медиана окна из 5 измерений — убивает одиночные выбросы (щелчки, шум), почти без лага.
    this.win.push(measured);
    if (this.win.length > 5) this.win.shift();
    const sorted = [...this.win].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];

    if (this.smoothed == null) {
      this.smoothed = med;
    } else if (Math.abs(centsBetween(med, this.smoothed)) > CENTS_SNAP_THRESHOLD) {
      this.smoothed = med; // настоящий скачок ноты — снапим мгновенно
    } else {
      this.smoothed = this.smoothed + this.k * (med - this.smoothed);
    }

    return { hz, clarity, smoothedHz: this.smoothed, voiced: true };
  }

  reset() {
    this.smoothed = null;
    this.win = [];
  }

  /** Сузить рабочий диапазон (Hz) — кламп по голосу режет октавные ошибки и шум. */
  setRange(minHz, maxHz) {
    this.minHz = minHz;
    this.maxHz = maxHz;
  }
}
