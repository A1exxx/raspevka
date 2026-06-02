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

    if (this.smoothed == null) {
      this.smoothed = hz;
    } else if (Math.abs(centsBetween(hz, this.smoothed)) > CENTS_SNAP_THRESHOLD) {
      this.smoothed = hz; // настоящий скачок ноты — снапим мгновенно
    } else {
      this.smoothed = this.smoothed + this.k * (hz - this.smoothed);
    }

    return { hz, clarity, smoothedHz: this.smoothed, voiced: true };
  }

  reset() {
    this.smoothed = null;
  }
}
