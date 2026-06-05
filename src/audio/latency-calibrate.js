// latency-calibrate.js — чистая математика калибровки задержки (acoustic loopback).
// Динамик играет щелчок, микрофон ловит его эхо; задержка = время от щелчка до всплеска
// громкости. Это реальная аудио-латентность (выход+вход), а не зашитая догадка.

/**
 * Найти задержку эха в серии замеров громкости.
 * @param {{t:number, rms:number}[]} samples — пары (время ctx.currentTime, RMS), по кадрам.
 * @param {number} clickTime — момент (в той же шкале), когда сыграл щелчок.
 * @param {{k?:number, minRms?:number, window?:number}} opts
 * @returns {number|null} задержка в секундах, либо null если всплеск не найден.
 */
export function findEchoDelay(samples, clickTime, { k = 4, minRms = 0.012, window = 0.5 } = {}) {
  if (!Array.isArray(samples) || samples.length < 3) return null;
  const pre = samples.filter((s) => s.t < clickTime).map((s) => s.rms).sort((a, b) => a - b);
  if (!pre.length) return null;
  const baseline = pre[Math.floor(pre.length / 2)] || 0; // медиана фона
  const thresh = Math.max(minRms, baseline * k);
  for (const s of samples) {
    if (s.t <= clickTime) continue;
    if (s.t - clickTime > window) break;
    if (s.rms >= thresh) return s.t - clickTime;
  }
  return null;
}

/** Свести несколько замеров к одному (медиана валидных в диапазоне). */
export function reduceDelays(delays, lo = 0.03, hi = 0.4) {
  const valid = delays.filter((d) => Number.isFinite(d) && d >= lo && d <= hi).sort((a, b) => a - b);
  if (valid.length < 2) return null; // мало уверенных замеров
  return valid[Math.floor(valid.length / 2)];
}
