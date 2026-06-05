// modes.js — лады (по ТЗ Игоря): 7 народных/церковных ладов + гармонический мажор/минор.
// Упражнения записаны в СТУПЕНЯХ (I-II-III…), а звучание ступени зависит от выбранного лада.
// Тарифы: free — только мажор; standard — мажор+минор; pro — все лады (на младших закрыты замком).

export const MODES = [
  { key: 'ionian',      name: 'Ионийский (мажор)',  intervals: [0, 2, 4, 5, 7, 9, 11],  tier: 'free' },
  { key: 'aeolian',     name: 'Эолийский (минор)',  intervals: [0, 2, 3, 5, 7, 8, 10],  tier: 'standard' },
  { key: 'dorian',      name: 'Дорийский',          intervals: [0, 2, 3, 5, 7, 9, 10],  tier: 'pro' },
  { key: 'phrygian',    name: 'Фригийский',         intervals: [0, 1, 3, 5, 7, 8, 10],  tier: 'pro' },
  { key: 'lydian',      name: 'Лидийский',          intervals: [0, 2, 4, 6, 7, 9, 11],  tier: 'pro' },
  { key: 'mixolydian',  name: 'Миксолидийский',     intervals: [0, 2, 4, 5, 7, 9, 10],  tier: 'pro' },
  { key: 'locrian',     name: 'Локрийский',         intervals: [0, 1, 3, 5, 6, 8, 10],  tier: 'pro' },
  { key: 'harm_major',  name: 'Гармонический мажор', intervals: [0, 2, 4, 5, 7, 8, 11],  tier: 'pro' },
  { key: 'harm_minor',  name: 'Гармонический минор', intervals: [0, 2, 3, 5, 7, 8, 11],  tier: 'pro' },
];

const TIER_RANK = { free: 0, standard: 1, pro: 2 };

export function getMode(key) {
  return MODES.find((m) => m.key === key) || MODES[0];
}

/** Доступен ли лад на тарифе пользователя ('free'|'standard'|'pro'). */
export function modeUnlocked(modeKey, userTier = 'free') {
  const m = getMode(modeKey);
  return TIER_RANK[m.tier] <= TIER_RANK[userTier || 'free'];
}

/**
 * Ступень → полутон от тоники по выбранному ладу.
 * degree: 1..8 (8 = октава), также поддерживаются ступени выше октавы и ниже тоники
 * (отрицательные/нулевые — для скачков «V низ» и т.п.).
 * Пример: degreeToSemitone(5, ionian) = 7; degreeToSemitone(8, ...) = 12.
 */
export function degreeToSemitone(degree, mode) {
  const iv = mode.intervals;
  const d = Math.round(degree) - 1;          // 0-based
  const oct = Math.floor(d / 7);
  const idx = ((d % 7) + 7) % 7;
  return iv[idx] + 12 * oct;
}

/** Преобразовать массив ступеней в массив полутонов для лада. */
export function degreesToSemitones(degrees, modeKey) {
  const mode = getMode(modeKey);
  return degrees.map((d) => degreeToSemitone(d, mode));
}
