// analytics.js — локальный лог событий (без сети). Чтобы улучшать приложение по фактам:
// какие упражнения открывают, с какой точностью заканчивают. Кольцевой буфер в localStorage.
// Ключевые события дублируются в Яндекс.Метрику как цели (если счётчик настроен).
import { reachGoal } from './analytics-config.js';

const KEY = 'raspevka.analytics.v1';
const MAX = 500;

// Какие локальные события уходят в Метрику как цели (имя цели = имя события).
const GOALS = new Set(['demo_start', 'exercise_done', 'lead_open', 'lead_sent', 'session_done', 'app_install']);

export function logEvent(type, data = {}) {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    arr.push({ t: Date.now(), type, ...data });
    if (arr.length > MAX) arr.splice(0, arr.length - MAX);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch (e) { /* приватный режим / переполнение */ }
  if (GOALS.has(type)) reachGoal(type, data);
}

export function getEvents() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
}

export function clearEvents() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ok */ }
}

export function exportEvents() {
  return JSON.stringify(getEvents(), null, 2);
}

/** Свод для экрана настроек: сколько прохождений и средняя точность по упражнениям. */
export function summary() {
  const ev = getEvents();
  const done = ev.filter((e) => e.type === 'exercise_done');
  const byId = {};
  for (const e of done) { (byId[e.id || '—'] = byId[e.id || '—'] || []).push(e.pct || 0); }
  const perEx = Object.entries(byId)
    .map(([id, pcts]) => ({ id, runs: pcts.length, avgPct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) }))
    .sort((a, b) => b.runs - a.runs);
  return { total: ev.length, sessions: done.length, perEx };
}
