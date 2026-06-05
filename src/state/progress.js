// progress.js — localStorage: диапазон голоса, стрик, история сессий.
const KEY = 'raspevka.progress.v1';

export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
export function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* приватный режим */ }
}

/** Диапазон голоса {low, high} в MIDI, или null. */
export function getRange() {
  const p = load();
  return p.range && Number.isFinite(p.range.low) ? p.range : null;
}
export function setRange(low, high) {
  const p = load();
  p.range = { low: Math.round(low), high: Math.round(high) };
  save(p);
  return p.range;
}

function dayStr(d) { return d.toISOString().slice(0, 10); }

/** Записать завершённую сессию, обновить стрик. Возвращает {streak, total}. */
export function recordSession(result) {
  const p = load();
  const today = dayStr(new Date());
  const yesterday = dayStr(new Date(Date.now() - 864e5));

  if (p.lastDate !== today) {
    p.streak = p.lastDate === yesterday ? (p.streak || 0) + 1 : 1;
    p.lastDate = today;
  } else if (!p.streak) {
    p.streak = 1;
  }

  p.history = p.history || [];
  p.history.push({ date: today, pct: result.pct, stars: result.stars });
  if (p.history.length > 200) p.history = p.history.slice(-200);
  p.total = (p.total || 0) + 1;

  save(p);
  return { streak: p.streak, total: p.total };
}

export function getStreak() {
  return load().streak || 0;
}

export function getHistory() { return load().history || []; }
export function getRangeHistory() { return load().rangeHistory || []; }
export function getTotal() { return load().total || 0; }

/** Пройденные уроки структурированного пути (массив id). */
export function getCompletedLessons() { return load().lessons || []; }
export function markLessonDone(id) {
  const p = load();
  p.lessons = p.lessons || [];
  if (!p.lessons.includes(id)) { p.lessons.push(id); save(p); }
  return p.lessons;
}

/** Выбранный лад (по умолчанию ионийский/мажор). */
export function getModeKey() { return load().modeKey || 'ionian'; }
export function setModeKey(k) { const p = load(); p.modeKey = k; save(p); return k; }

/** Тариф пользователя: 'free' | 'standard' | 'pro'. По умолчанию free. */
export function getTier() { return load().tier || 'free'; }
export function setTier(t) { const p = load(); p.tier = t; save(p); return t; }

/** Энергия/жизни (по ТЗ): тратится при перезапуске неудачного упражнения, копится за чистое прохождение. */
const MAX_ENERGY = 5;
export function getMaxEnergy() { return MAX_ENERGY; }
export function getEnergy() { const e = load().energy; return e == null ? MAX_ENERGY : e; }
export function setEnergy(v) {
  const p = load();
  p.energy = Math.max(0, Math.min(MAX_ENERGY, Math.round(v)));
  save(p);
  return p.energy;
}
export function addEnergy(delta) { return setEnergy(getEnergy() + delta); }

/** Грув-подложка под распевку: 'off' | 'pop' | 'funk' | 'soft'. По умолчанию выкл. */
export function getGroove() { return load().groove || 'off'; }
export function setGroove(g) { const p = load(); p.groove = g; save(p); return g; }

/**
 * Записать уверенно взятую ноту (MIDI). Если она расширяет диапазон голоса —
 * обновляет диапазон, добавляет точку в историю и возвращает {extended:'high'|'low', midi}.
 * Иначе {extended:null}. Нужен уже определённый диапазон (тест голоса).
 */
export function recordNote(midi) {
  const p = load();
  if (!p.range || !Number.isFinite(p.range.low)) return { extended: null };
  let extended = null;
  if (midi > p.range.high) { p.range.high = midi; extended = 'high'; }
  else if (midi < p.range.low) { p.range.low = midi; extended = 'low'; }
  if (extended) {
    p.rangeHistory = p.rangeHistory || [];
    p.rangeHistory.push({ date: dayStr(new Date()), low: p.range.low, high: p.range.high });
    if (p.rangeHistory.length > 100) p.rangeHistory = p.rangeHistory.slice(-100);
    save(p);
  }
  return { extended, midi };
}

/** Тип голоса {key, low, high} или null. */
export function getVoice() {
  const p = load();
  return p.voice && p.voice.key ? p.voice : null;
}
export function setVoice(key, low = null, high = null) {
  const p = load();
  const prev = p.voice || {};
  p.voice = { key, low: low ?? prev.low ?? null, high: high ?? prev.high ?? null };
  if (low != null && high != null) {
    p.range = { low: Math.round(low), high: Math.round(high) };
    // История диапазона — чтобы показывать рост во времени в дашборде.
    p.rangeHistory = p.rangeHistory || [];
    p.rangeHistory.push({ date: dayStr(new Date()), low: Math.round(low), high: Math.round(high) });
    if (p.rangeHistory.length > 100) p.rangeHistory = p.rangeHistory.slice(-100);
  }
  save(p);
  return p.voice;
}

/** Сложность: 'easy' | 'medium' | 'fast'. Влияет на темп упражнений. */
const DIFF_FACTOR = { easy: 0.6, medium: 0.8, fast: 1.0 };
export function getDifficulty() {
  return load().difficulty || 'easy';
}
export function setDifficulty(d) {
  const p = load();
  p.difficulty = d;
  save(p);
  return d;
}
export function difficultyFactor() {
  return DIFF_FACTOR[getDifficulty()] || 0.6;
}

/** Звук-поводырь (главный выключатель). По умолчанию включён. */
export function getGuide() {
  return load().guide !== false;
}
export function setGuide(on) {
  const p = load();
  p.guide = !!on;
  save(p);
  return p.guide;
}

/** Наушники: если да — поводырь может звучать непрерывно (нет протечки в микрофон). */
export function getHeadphones() {
  return load().headphones === true;
}
export function setHeadphones(on) {
  const p = load();
  p.headphones = !!on;
  save(p);
  return p.headphones;
}

/**
 * Режим поводыря:
 *  'off'        — выключен;
 *  'continuous' — тон звучит весь шаг (только для наушников, иначе протекает в микрофон);
 *  'prehear'    — тон звучит коротко ДО ноты и молчит пока поёшь (без протечки, дефолт на динамике).
 */
export function getGuideMode() {
  if (!getGuide()) return 'off';
  return getHeadphones() ? 'continuous' : 'prehear';
}

/** Тембр поводыря/эталона: 'piano' | 'guitar' | 'soft'. По умолчанию пиано. */
export function getTimbre() {
  const v = load().timbre;
  return v === 'guitar' || v === 'soft' ? v : 'piano';
}
export function setTimbre(t) {
  const p = load();
  p.timbre = t;
  save(p);
  return p.timbre;
}

/** Чувствительность микрофона: 'low'|'med'|'high' -> множитель усиления входа. */
const SENS = { low: 1.5, med: 3, high: 5.5 };
// Дефолт по устройству: у телефонов микрофон тише → начинаем с «высокой».
function deviceDefaultSensitivity() {
  try {
    const ua = navigator.userAgent || '';
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints || 0) > 1;
    return mobile ? 'high' : 'med';
  } catch (e) { return 'med'; }
}
export function getSensitivityKey() {
  const k = load().sensitivity;
  return SENS[k] ? k : deviceDefaultSensitivity();
}
export function getSensitivity() {
  return SENS[getSensitivityKey()];
}
export function setSensitivity(k) {
  const p = load();
  p.sensitivity = k;
  save(p);
  return k;
}

/** Реплики маскота Кваковского: по умолчанию включены, с тумблером выключения. */
export function getMascotTalk() {
  return load().mascotTalk !== false;
}
export function setMascotTalk(on) {
  const p = load();
  p.mascotTalk = !!on;
  save(p);
  return p.mascotTalk;
}

/** Рекорд ровного выдоха «с-с-с» (сек). */
export function getBreathBest() {
  return load().breathBest || 0;
}
export function recordBreathBest(seconds) {
  const p = load();
  p.breathBest = Math.max(p.breathBest || 0, seconds);
  save(p);
  return p.breathBest;
}
