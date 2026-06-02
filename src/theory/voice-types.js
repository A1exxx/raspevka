// voice-types.js — типы голоса (ориентировочная классификация по диапазону).
// ВАЖНО: это оценка по рабочему диапазону, а не вердикт — точную классификацию
// (особенно тембр/окраску) даёт только педагог. Диапазоны — усреднённые, в MIDI.
import { Note } from 'tonal';

export const VOICE_TYPES = [
  { key: 'bass',      name: 'Бас',           group: 'муж', low: 40, high: 64, center: 48, blurb: 'Самый низкий мужской голос, глубокий и плотный.' },     // E2–E4
  { key: 'baritone',  name: 'Баритон',       group: 'муж', low: 43, high: 67, center: 52, blurb: 'Средний мужской голос — самый распространённый.' },     // G2–G4
  { key: 'tenor',     name: 'Тенор',         group: 'муж', low: 48, high: 72, center: 57, blurb: 'Высокий мужской голос, яркий и звонкий.' },             // C3–C5
  { key: 'contralto', name: 'Контральто',    group: 'жен', low: 53, high: 77, center: 60, blurb: 'Низкий женский голос, тёплый и насыщенный.' },          // F3–F5
  { key: 'mezzo',     name: 'Меццо-сопрано', group: 'жен', low: 57, high: 81, center: 64, blurb: 'Средний женский голос — самый частый у женщин.' },      // A3–A5
  { key: 'soprano',   name: 'Сопрано',       group: 'жен', low: 60, high: 84, center: 67, blurb: 'Высокий женский голос, светлый и парящий.' },           // C4–C6
];

export function getVoiceType(key) {
  return VOICE_TYPES.find((v) => v.key === key) || null;
}

/** Латинское имя ноты по MIDI ("C3"). */
export function midiName(midi) {
  return Note.fromMidi(Math.round(midi)) || '';
}

/** Подпись диапазона типа: "G2–G4". */
export function rangeLabel(v) {
  return `${midiName(v.low)}–${midiName(v.high)}`;
}

/**
 * Оценить тип голоса по измеренному диапазону.
 * Нижняя нота — самый сильный признак (вес 0.6), плюс центр тесситуры (0.4).
 */
export function classifyVoice(lowMidi, highMidi) {
  const mid = (lowMidi + highMidi) / 2;
  let best = VOICE_TYPES[0];
  let bestScore = Infinity;
  for (const v of VOICE_TYPES) {
    const vMid = (v.low + v.high) / 2;
    const score = 0.6 * Math.abs(lowMidi - v.low) + 0.4 * Math.abs(mid - vMid);
    if (score < bestScore) { bestScore = score; best = v; }
  }
  return best;
}
