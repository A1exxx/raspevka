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
