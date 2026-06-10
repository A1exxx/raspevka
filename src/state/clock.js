// clock.js — единый источник времени приложения.
// Вся логика дат (стрик, энергия, триал, дневные лимиты) ходит сюда, а не в Date.now().
// В тест-режиме (dev-панель) время можно «перемотать» на N дней — смещение хранится
// отдельно от прогресса, чтобы полный сброс прогресса не сбивал симуляцию и наоборот.
const KEY = 'raspevka.clock.v1';

function offsetMs() {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
}

/** Текущее время (мс) с учётом тестового смещения. */
export function now() { return Date.now() + offsetMs(); }

/** Текущая дата как Date. */
export function today() { return new Date(now()); }

/** Строка дня YYYY-MM-DD (для стрика/истории/дневных лимитов). */
export function dayStr(d = today()) { return d.toISOString().slice(0, 10); }

/** Смещение тест-режима в днях (0 = реальное время). */
export function getOffsetDays() { return Math.round(offsetMs() / 864e5); }

export function setOffsetDays(days) {
  try { localStorage.setItem(KEY, String(Math.round(days) * 864e5)); } catch { /* приватный режим */ }
}

export function shiftDays(delta) { setOffsetDays(getOffsetDays() + delta); }

export function resetOffset() { try { localStorage.removeItem(KEY); } catch { /* ok */ } }
