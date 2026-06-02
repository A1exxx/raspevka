// note-map.js — переводы Hz <-> нота <-> пиксели и зоны попадания.
import { Note } from 'tonal';

export const A4 = 440;

/** Hz -> {midi(дробный), nearestMidi, cents(-50..50), name "A4", hz} */
export function hzToNoteInfo(hz) {
  if (!hz || hz <= 0) return null;
  const midi = 69 + 12 * Math.log2(hz / A4);
  const nearestMidi = Math.round(midi);
  const cents = Math.round((midi - nearestMidi) * 100);
  const name = Note.fromMidi(nearestMidi); // "A4", "C#5", ...
  return { midi, nearestMidi, cents, name, hz };
}

/** MIDI -> Hz */
export function midiToHz(midi) {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

/** Имя ноты ("C4") -> Hz через tonal */
export function noteToHz(name) {
  return Note.freq(name);
}

/**
 * Hz -> Y-координата в канвасе по логарифмической шкале.
 * По умолчанию диапазон C2 (~65.41 Hz) .. C6 (~1046.5 Hz).
 * Чем выше тон — тем меньше Y (выше на экране).
 */
export function hzToY(hz, height, minHz = 65.41, maxHz = 1046.5) {
  const clamped = Math.max(minHz, Math.min(maxHz, hz));
  const t = Math.log2(clamped / minHz) / Math.log2(maxHz / minHz);
  return height - t * height;
}

/** Зона попадания по абсолютному отклонению в центах. */
export function centsZone(absCents) {
  if (absCents <= 20) return 'green';
  if (absCents <= 40) return 'yellow';
  return 'red';
}

/** Отклонение в центах между спетым hz и целевым hz. */
export function centsOff(sungHz, targetHz) {
  return 1200 * Math.log2(sungHz / targetHz);
}
