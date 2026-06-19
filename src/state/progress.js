// progress.js — localStorage: диапазон голоса, стрик, история сессий.
// Время берём ТОЛЬКО из clock (не Date.now) — чтобы тест-режим мог «перематывать» дни.
import * as clock from './clock.js';

const KEY = 'raspevka.progress.v1';

export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
export function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* приватный режим */ }
}

/** Полный сброс прогресса/настроек (по явному действию пользователя в настройках). */
export function resetAll() {
  try { localStorage.removeItem(KEY); } catch (e) { /* приватный режим */ }
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

function dayStr(d) { return clock.dayStr(d); }

/**
 * Записать завершённую сессию, обновить стрик.
 * Заморозка стрика: если пропущен РОВНО один день и есть заморозка — она тратится,
 * стрик продолжается. Заморозки копятся: +1 за каждые 7 дней подряд (максимум 2).
 * Возвращает {streak, total, freezeSpent}.
 */
export function recordSession(result) {
  const p = load();
  const today = clock.dayStr();
  const yesterday = clock.dayStr(new Date(clock.now() - 864e5));
  const dayBefore = clock.dayStr(new Date(clock.now() - 2 * 864e5));
  let freezeSpent = false;

  if (p.lastDate !== today) {
    if (p.lastDate === yesterday) {
      p.streak = (p.streak || 0) + 1;
    } else if (p.lastDate === dayBefore && (p.freezes || 0) > 0) {
      p.freezes -= 1;
      freezeSpent = true;
      p.streak = (p.streak || 0) + 1;
    } else {
      p.streak = 1;
    }
    p.lastDate = today;
    if (p.streak > 0 && p.streak % 7 === 0) p.freezes = Math.min(2, (p.freezes || 0) + 1);
  } else if (!p.streak) {
    p.streak = 1;
  }

  p.history = p.history || [];
  p.history.push({ date: today, pct: result.pct, stars: result.stars });
  if (p.history.length > 200) p.history = p.history.slice(-200);
  p.total = (p.total || 0) + 1;

  save(p);
  return { streak: p.streak, total: p.total, freezeSpent };
}

export function getStreak() {
  return load().streak || 0;
}

/** Заморозки стрика (страховка на 1 пропущенный день). */
export function getFreezes() { return load().freezes || 0; }
export function setFreezes(n) { const p = load(); p.freezes = Math.max(0, Math.min(2, Math.round(n))); save(p); return p.freezes; }

/** Дневная цель: выполнена ли тренировка сегодня (хотя бы одна распевка). */
export function isDailyDone() {
  const today = clock.dayStr();
  return (load().history || []).some((h) => h.date === today);
}

/** Тестовые сеттеры (dev-панель): стрик и дата последней тренировки. */
export function devSetStreak(n) {
  const p = load();
  p.streak = Math.max(0, Math.round(n));
  p.lastDate = clock.dayStr();
  save(p);
  return p.streak;
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

/** Заявки на урок к педагогу (лид-формы). Пока хранятся локально; позже — отправка на бэкенд. */
export function getLeads() { return load().leads || []; }
export function saveLead(lead) {
  const p = load();
  p.leads = p.leads || [];
  p.leads.push({ ts: clock.now(), ...lead });
  if (p.leads.length > 50) p.leads = p.leads.slice(-50);
  save(p);
  return p.leads;
}

/** Сданные экзамены блоков учебной программы (массив id блоков). */
export function getExamsPassed() { return load().examsPassed || []; }
export function markExamPassed(blockId) {
  const p = load();
  p.examsPassed = p.examsPassed || [];
  if (!p.examsPassed.includes(blockId)) { p.examsPassed.push(blockId); save(p); }
  return p.examsPassed;
}

/** Пройденные упражнения блоков (для галочек): { [blockId]: [exId,...] }. */
export function getBlockItems(blockId) { return (load().blockItems || {})[blockId] || []; }
export function markBlockItem(blockId, exId) {
  const p = load();
  p.blockItems = p.blockItems || {};
  const arr = p.blockItems[blockId] || [];
  if (!arr.includes(exId)) { arr.push(exId); p.blockItems[blockId] = arr; save(p); }
  return arr;
}

/** Выбранный лад (по умолчанию ионийский/мажор). */
export function getModeKey() { return load().modeKey || 'ionian'; }
export function setModeKey(k) { const p = load(); p.modeKey = k; save(p); return k; }

/** Тариф пользователя: 'free' | 'standard' | 'pro'. По умолчанию free. */
export function getTier() { return load().tier || 'free'; }
export function setTier(t) { const p = load(); p.tier = t; save(p); return t; }

/** Энергия/жизни (по ТЗ): тратится при перезапуске неудачного упражнения, копится за чистое прохождение.
 *  Смягчено: энергия сама восстанавливается со временем (1 за REGEN_MIN минут) — не «насухо». */
const MAX_ENERGY = 5;
const REGEN_MIN = 25; // минут на восстановление одной единицы энергии
export function getMaxEnergy() { return MAX_ENERGY; }
export function getEnergy() {
  const p = load();
  let e = p.energy == null ? MAX_ENERGY : p.energy;
  if (e < MAX_ENERGY && p.energyTs) {
    const regen = Math.floor((clock.now() - p.energyTs) / (REGEN_MIN * 60000));
    if (regen > 0) e = Math.min(MAX_ENERGY, e + regen);
  }
  return e;
}
export function setEnergy(v) {
  const p = load();
  const clamped = Math.max(0, Math.min(MAX_ENERGY, Math.round(v)));
  p.energy = clamped;
  // если не полная — запомним момент, от которого пойдёт восстановление
  p.energyTs = clamped < MAX_ENERGY ? clock.now() : null;
  save(p);
  return clamped;
}
export function addEnergy(delta) { return setEnergy(getEnergy() + delta); }

/** Грув-подложка под распевку: 'off' | 'pop' | 'funk' | 'soft'. По умолчанию выкл. */
export function getGroove() { return load().groove || 'off'; }
export function setGroove(g) { const p = load(); p.groove = g; save(p); return g; }

/** Вибрация (тактильная отдача и направленные подсказки). По умолчанию ВКЛ. */
export function getHaptic() { return load().haptic !== false; }
export function setHaptic(on) { const p = load(); p.haptic = !!on; save(p); return p.haptic; }

/** Избранные настройки (темп+лад) на упражнение — быстрый переход к привычной разминке. */
export function getFavorite(exId) { return (load().favorites || {})[exId] || null; }
export function setFavorite(exId, fav) {
  const p = load();
  p.favorites = p.favorites || {};
  p.favorites[exId] = fav;
  save(p);
  return fav;
}

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
    p.rangeHistory.push({ date: clock.dayStr(), low: p.range.low, high: p.range.high });
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
    p.rangeHistory.push({ date: clock.dayStr(), low: Math.round(low), high: Math.round(high) });
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

// Телефон/планшет? — у них тише и динамик, и микрофон → другие дефолты.
export function isMobileDevice() {
  try {
    const ua = navigator.userAgent || '';
    return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints || 0) > 1;
  } catch (e) { return false; }
}

/** Громкость подсказки/эталона (выход): множитель поверх компрессора-лимитера.
 *  Дефолт по устройству: на телефоне громче (динамик тише). */
const VOL = { quiet: 1.0, normal: 1.8, loud: 2.8, max: 4.2 };
function deviceDefaultVolume() { return isMobileDevice() ? 'loud' : 'normal'; }
export function getVolumeKey() { const k = load().volume; return VOL[k] ? k : deviceDefaultVolume(); }
export function getVolumeMult() { return VOL[getVolumeKey()]; }
export function setVolume(k) { const p = load(); if (VOL[k]) { p.volume = k; save(p); } return getVolumeKey(); }

/** Маршрут вывода → компенсация задержки (Bluetooth заметно опаздывает). */
const ROUTE_LATENCY = { speaker: 0.09, wired: 0.12, bt: 0.24 };
function deviceDefaultRoute() { return 'speaker'; }
export function getRouteKey() { const k = load().route; return ROUTE_LATENCY[k] ? k : deviceDefaultRoute(); }
export function setRoute(k) {
  const p = load();
  if (ROUTE_LATENCY[k]) { p.route = k; delete p.latencyManual; save(p); }
  return getRouteKey();
}
/** Итоговая компенсация задержки (сек): ручная калибровка имеет приоритет над маршрутом. */
export function getLatency() {
  const m = load().latencyManual;
  if (Number.isFinite(m)) return m;
  return ROUTE_LATENCY[getRouteKey()];
}
export function setLatencyManual(sec) {
  const p = load();
  p.latencyManual = Math.max(0, Math.min(0.5, sec));
  save(p);
  return p.latencyManual;
}

/** Тёмный экран пения (премиум-вид игрового экрана). По умолчанию ВЫКЛ — светлый. */
export function getDarkStage() { return load().darkStage === true; }
export function setDarkStage(on) { const p = load(); p.darkStage = !!on; save(p); return p.darkStage; }

/** Мелодическая подложка в ритм-упражнениях «с/ш». По умолчанию ВКЛ. */
export function getRhythmPad() { return load().rhythmPad !== false; }
export function setRhythmPad(on) { const p = load(); p.rhythmPad = !!on; save(p); return p.rhythmPad; }

/** Авто-усиление микрофона (AGC). По умолчанию ВЫКЛ — стабильнее детекция высоты
 *  (AGC создан для голосовой связи, «пампит» амплитуду и мешает MPM). Вкл — для очень тихих микрофонов. */
export function getMicAGC() { return load().micAGC === true; }
export function setMicAGC(on) { const p = load(); p.micAGC = !!on; save(p); return p.micAGC; }

/** Чувствительность микрофона: 'low'|'med'|'high' -> множитель усиления входа. */
const SENS = { low: 1.5, med: 3, high: 5.5 };
// Дефолт по устройству: у телефонов микрофон тише → начинаем с «высокой».
function deviceDefaultSensitivity() { return isMobileDevice() ? 'high' : 'med'; }
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

// ================== Монетизация (каркас, ВЫКЛЮЧЕН по умолчанию) ==================
// Модель (по ресёрчу конкурентов): freemium + soft-paywall по числу распевок в день
// + 7-дневный триал. Включается флагом paywallEnabled из dev-панели — до включения
// пользователь ничего не видит. НЕ time/energy-cap (антипаттерн Duolingo).

export const FREE_PER_DAY = 5;      // бесплатных распевок в день при включённом пейволле
export const TRIAL_DAYS = 7;

export function getPaywallEnabled() { return load().paywallEnabled === true; }
export function setPaywallEnabled(on) { const p = load(); p.paywallEnabled = !!on; save(p); return p.paywallEnabled; }

/** Старт 7-дневного триала (один раз). */
export function startTrial() {
  const p = load();
  if (!p.trialStart) { p.trialStart = clock.now(); save(p); }
  return p.trialStart;
}
export function getTrialDaysLeft() {
  const t = load().trialStart;
  if (!t) return null; // триал не начат
  const left = TRIAL_DAYS - Math.floor((clock.now() - t) / 864e5);
  return Math.max(0, left);
}
export function isTrialActive() {
  const left = getTrialDaysLeft();
  return left != null && left > 0;
}
export function devResetTrial() { const p = load(); delete p.trialStart; save(p); }

/** Премиум-доступ: платный тариф ИЛИ активный триал. */
export function isPremium() {
  return getTier() !== 'free' || isTrialActive();
}

/** Счётчик распевок за сегодня (для soft-paywall). Считаем на старте упражнения. */
export function getUsesToday() {
  const p = load();
  return p.uses && p.uses.date === clock.dayStr() ? p.uses.count : 0;
}
export function countUse() {
  const p = load();
  const today = clock.dayStr();
  p.uses = p.uses && p.uses.date === today ? { date: today, count: p.uses.count + 1 } : { date: today, count: 1 };
  save(p);
  return p.uses.count;
}

/** Упёрся ли пользователь в дневной лимит (пейволл выключен → всегда false). */
export function isPaywalled() {
  if (!getPaywallEnabled() || isPremium()) return false;
  return getUsesToday() >= FREE_PER_DAY;
}

// ================== Тест-режим (dev-панель) ==================
export function getDevMode() { return load().devMode === true; }
export function setDevMode(on) { const p = load(); p.devMode = !!on; save(p); return p.devMode; }

// ================== XP / Уровни / Ачивки / Профиль (геймификация) ==================

export const LEVELS = [
  { min: 0,     title: 'Новичок' },
  { min: 100,   title: 'Ученик' },
  { min: 250,   title: 'Любитель' },
  { min: 500,   title: 'Распевающийся' },
  { min: 850,   title: 'Уверенный' },
  { min: 1300,  title: 'Вокалист' },
  { min: 1900,  title: 'Артист' },
  { min: 2700,  title: 'Солист' },
  { min: 3700,  title: 'Виртуоз' },
  { min: 5000,  title: 'Мастер' },
  { min: 7000,  title: 'Маэстро' },
  { min: 10000, title: 'Легенда' },
];

/** Получить текущие XP. */
export function getXp() { return load().xp || 0; }

/** Прибавить XP, вернуть новый total. */
export function addXp(n) {
  const p = load();
  p.xp = (p.xp || 0) + Math.max(0, Math.round(n));
  save(p);
  return p.xp;
}

/**
 * Вычислить уровень по значению XP.
 * Возвращает { level (1-based), title, curMin, nextMin (или null), into, span, pct }.
 */
export function getLevel(xp = getXp()) {
  let lvIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) { lvIdx = i; break; }
  }
  const cur = LEVELS[lvIdx];
  const next = LEVELS[lvIdx + 1] || null;
  const into = xp - cur.min;
  const span = next ? next.min - cur.min : 1;
  return {
    level: lvIdx + 1,
    title: cur.title,
    curMin: cur.min,
    nextMin: next ? next.min : null,
    into,
    span,
    pct: next ? Math.round((into / span) * 100) : 100,
  };
}

/** Профиль игрока: имя и аватар (эмодзи). */
export function getProfile() {
  const p = load();
  return { name: p.profileName || '', avatar: p.profileAvatar || '' };
}
export function setProfile({ name, avatar }) {
  const p = load();
  if (name !== undefined) p.profileName = String(name).slice(0, 32);
  if (avatar !== undefined) p.profileAvatar = String(avatar).slice(0, 4);
  save(p);
  return getProfile();
}

/**
 * Счётчик распевок/упражнений с оценкой 3★.
 * Увеличивается в awardXp при stars===3.
 */
export function getPerfect3Count() { return load().perfect3Count || 0; }
function _incPerfect3() {
  const p = load();
  p.perfect3Count = (p.perfect3Count || 0) + 1;
  save(p);
  return p.perfect3Count;
}

/**
 * Флаг «полная сессия завершена хотя бы раз».
 * Устанавливается снаружи через markFullSessionDone().
 */
export function getFullSessionDone() { return load().fullSessionDone === true; }
export function markFullSessionDone() {
  const p = load();
  p.fullSessionDone = true;
  save(p);
}

/**
 * Начислить XP за действие.
 * kind: 'exercise' | 'session' | 'breathing' | 'exam'
 * stars (для exercise): 0..3
 * Формула: упражнение = 10 + stars*15 (0★=10, 1★=25, 2★=40, 3★=55)
 *          полная распевка = +60
 *          дыхание = +20
 *          экзамен = +100
 */
export function awardXp({ stars = 0, kind = 'exercise' } = {}) {
  let n = 0;
  if (kind === 'exercise') {
    n = 10 + stars * 15;
    if (stars === 3) _incPerfect3();
  } else if (kind === 'session') {
    n = 60;
  } else if (kind === 'breathing') {
    n = 20;
  } else if (kind === 'exam') {
    n = 100;
  }
  const prev = getXp();
  const next = addXp(n);
  return { added: n, total: next, prevTotal: prev };
}

// ================== Ачивки ==================

export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    title: 'Первый шаг',
    desc: 'Завершить первую распевку или упражнение',
    icon: '🎵',
    check: (st) => (st.totalSessions || 0) >= 1,
  },
  {
    id: 'clean_voice',
    title: 'Чистый голос',
    desc: 'Получить первые 3 звезды',
    icon: '⭐',
    check: (st) => (st.perfect3Count || 0) >= 1,
  },
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    desc: 'Получить 3 звезды 10 раз',
    icon: '💎',
    check: (st) => (st.perfect3Count || 0) >= 10,
  },
  {
    id: 'week_power',
    title: 'Неделя силы',
    desc: 'Стрик 7 дней подряд',
    icon: '🔥',
    check: (st) => (st.streak || 0) >= 7,
  },
  {
    id: 'month_discipline',
    title: 'Месяц дисциплины',
    desc: 'Стрик 30 дней подряд',
    icon: '📅',
    check: (st) => (st.streak || 0) >= 30,
  },
  {
    id: 'unbreakable',
    title: 'Несгибаемый',
    desc: 'Стрик 100 дней подряд',
    icon: '🏆',
    check: (st) => (st.streak || 0) >= 100,
  },
  {
    id: 'breath_master',
    title: 'Дыхание мастера',
    desc: 'Ровный выдох ≥ 20 секунд',
    icon: '🫁',
    check: (st) => (st.breathBest || 0) >= 20,
  },
  {
    id: 'wide_range',
    title: 'Шире на октаву',
    desc: 'Диапазон голоса 24+ полутона',
    icon: '🎼',
    check: (st) => (st.rangeSemitones || 0) >= 24,
  },
  {
    id: 'student',
    title: 'Ученик',
    desc: 'Сдать первый экзамен блока',
    icon: '🎓',
    check: (st) => (st.examsPassed || 0) >= 1,
  },
  {
    id: 'graduate',
    title: 'Выпускник',
    desc: 'Пройти все 10 блоков программы',
    icon: '👑',
    check: (st) => (st.examsPassed || 0) >= 10,
  },
  {
    id: 'marathon',
    title: 'Марафонец',
    desc: 'Завершить 50 сессий/упражнений',
    icon: '🏅',
    check: (st) => (st.totalSessions || 0) >= 50,
  },
  {
    id: 'timbre_found',
    title: 'Тембр найден',
    desc: 'Определить тип голоса',
    icon: '🎤',
    check: (st) => !!st.voiceSet,
  },
  {
    id: 'full_session',
    title: 'Полная распевка',
    desc: 'Пройти полную распевку (все упражнения)',
    icon: '✅',
    check: (st) => !!st.fullSessionDone,
  },
];

/** Разблокированные ачивки (массив id). */
export function getUnlockedAchievements() { return load().unlockedAchievements || []; }

/**
 * Проверить все ачивки по снимку прогресса.
 * Возвращает массив НОВЫХ разблокированных объектов.
 * st = { streak, totalSessions, examsPassed (число), rangeSemitones, breathBest,
 *         perfect3Count, voiceSet (bool), fullSessionDone (bool) }
 */
export function checkAchievements(st) {
  const p = load();
  const unlocked = new Set(p.unlockedAchievements || []);
  const newOnes = [];
  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.has(ach.id) && ach.check(st)) {
      unlocked.add(ach.id);
      newOnes.push(ach);
    }
  }
  if (newOnes.length > 0) {
    p.unlockedAchievements = [...unlocked];
    save(p);
  }
  return newOnes;
}

/** Снимок прогресса для checkAchievements (удобный хелпер). */
export function progressSnapshot() {
  const p = load();
  const range = p.range;
  const rangeSemitones = range && Number.isFinite(range.low) && Number.isFinite(range.high)
    ? range.high - range.low : 0;
  return {
    streak: p.streak || 0,
    totalSessions: p.total || 0,
    examsPassed: (p.examsPassed || []).length,
    rangeSemitones,
    breathBest: p.breathBest || 0,
    perfect3Count: p.perfect3Count || 0,
    voiceSet: !!(p.voice && p.voice.key),
    fullSessionDone: !!p.fullSessionDone,
  };
}

/** Разблокировать все блоки программы (пометить экзамены сданными). */
export function devUnlockAllBlocks(blockIds) {
  const p = load();
  p.examsPassed = blockIds.slice();
  save(p);
  return p.examsPassed;
}
export function devLockAllBlocks() {
  const p = load();
  delete p.examsPassed;
  delete p.blockItems;
  save(p);
}
