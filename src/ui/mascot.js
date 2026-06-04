// mascot.js — маэстро Кваковский: параметрический SVG-риг лягуша-наставника.
// Части (рот/горловой мешок/веки/бровь) управляются CSS-переменными, которые
// каждый кадр выставляет контроллер из аудио-цикла (живая реакция на голос).
// Idle-дыхание/кивок/моргание — чистый CSS (без таймеров), чтобы на доме не текли таймеры.
import * as progress from '../state/progress.js';

/** Реплики Кваковского (Понасенков-вайб: пафос + ирония, коротко). */
export const KVAK = {
  greet: [
    'А, голубчик! Голос сам себя не разовьёт. К инструменту!',
    'Маэстро Кваковский к вашим услугам. Извольте распеться.',
    'Бра-во, что заглянули. Начнём, не теряя ни ноты.',
    'Сегодня мы споём так, что соседи зааплодируют. Или съедут.',
  ],
  start: [
    'Дышим животом, плечи опустили. И — пошли.',
    'Спинку ровно, звук в маску. Я слушаю.',
    'Не зажимайтесь, голубчик. Голос любит свободу.',
  ],
  praise: [
    'Бра-во! Вот это интонация!',
    'Чисто, как слеза. Продолжайте!',
    'Ах, маэстро, я почти прослезился.',
    'Вот! Запомните это ощущение.',
  ],
  miss: [
    'Фи, мимо. Но я великодушно прощаю.',
    'Чуть выше, голубчик. Слушайте опору.',
    'Мы метили в ноту, а попали в соседку.',
  ],
  finish: [
    'Достойно! Голос крепнет на глазах.',
    'Репетиция окончена. Публика (то есть я) довольна.',
    'Недурно. Завтра — ещё лучше, я настаиваю.',
  ],
};

export const pickLine = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * HTML маскота. greeting — если задан И реплики включены, показывает облако с текстом.
 * Класс размера задаётся снаружи (ширина контейнера .mascot).
 */
export function mascotMarkup({ greeting = null } = {}) {
  const talk = progress.getMascotTalk();
  const bubble = (greeting && talk)
    ? `<div class="m-bubble"><span class="m-name">Кваковский</span>${greeting}</div>`
    : `<div class="m-bubble" hidden></div>`;
  return `
  <div class="mascot" role="img" aria-label="Маэстро Кваковский, лягушка-наставник">
    ${bubble}
    <svg class="m-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="m-body">
        <!-- фрак + жабо -->
        <path class="m-coat" d="M14 120 Q16 84 60 84 Q104 84 106 120 Z" fill="var(--accent)"/>
        <path class="m-jabot" d="M51 88 L60 83 L69 88 L65 104 L60 111 L55 104 Z" fill="#ffffff" stroke="#dde4ec" stroke-width="1"/>
        <!-- голова -->
        <ellipse class="m-head" cx="60" cy="55" rx="41" ry="38" fill="var(--frog)"/>
        <ellipse cx="60" cy="64" rx="27" ry="24" fill="var(--frog-l)"/>
        <!-- горловой мешок (надувается) -->
        <ellipse class="m-throat" cx="60" cy="74" rx="22" ry="11" fill="var(--frog-l)" stroke="var(--frog-d)" stroke-width="1"/>
        <!-- глазные бугры -->
        <ellipse cx="38" cy="28" rx="18" ry="17" fill="var(--frog)"/>
        <ellipse cx="82" cy="28" rx="18" ry="17" fill="var(--frog)"/>
        <!-- бровь (приподнята) -->
        <path class="m-brow" d="M71 11 Q82 5 93 12" stroke="var(--frog-d)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- глаза -->
        <g class="m-eye">
          <circle cx="38" cy="28" r="12" fill="#ffffff"/>
          <circle class="m-pupil" cx="40" cy="30" r="5.5" fill="#22303a"/>
          <ellipse class="m-lid" cx="38" cy="28" rx="12.6" ry="12.6" fill="var(--frog)"/>
        </g>
        <g class="m-eye">
          <circle cx="82" cy="28" r="12" fill="#ffffff"/>
          <circle class="m-pupil" cx="80" cy="30" r="5.5" fill="#22303a"/>
          <ellipse class="m-lid" cx="82" cy="28" rx="12.6" ry="12.6" fill="var(--frog)"/>
        </g>
        <!-- монокль -->
        <circle class="m-monocle" cx="82" cy="28" r="14" fill="none" stroke="#d9b44a" stroke-width="2.5"/>
        <path d="M82 42 Q88 60 79 74" stroke="#d9b44a" stroke-width="1.4" fill="none"/>
        <!-- рот (раскрывается на громкость) -->
        <ellipse class="m-mouth" cx="60" cy="58" rx="14" ry="10" fill="#6e2b2b"/>
      </g>
    </svg>
  </div>`;
}

/**
 * Контроллер живого маскота. Для экранов с аудио-циклом.
 * После mount помечает .is-live (idle-моргание выключается, частями рулит JS).
 */
export class Mascot {
  constructor(rootEl) {
    this.el = rootEl;
    if (!this.el) return;
    this.el.classList.add('is-live');
    this.bubble = this.el.querySelector('.m-bubble');
    this._timers = [];
    this._lastSay = 0;
  }

  _set(k, v) { if (this.el) this.el.style.setProperty(k, v); }

  /** Кадр: voiced — поёт ли, rms — громкость, zone — 'green'|'yellow'|'red'|null. */
  update({ voiced = false, rms = 0, zone = null } = {}) {
    if (!this.el) return;
    const mouth = voiced ? Math.max(0.25, Math.min(1, 0.22 + rms * 8)) : 0.16;
    this._set('--mouth', mouth.toFixed(2));
    this.el.classList.toggle('is-bliss', !!voiced && zone === 'green');
    this.el.classList.toggle('is-wince', !!voiced && zone === 'red');
  }

  /** Надуть горловой мешок (для дыхательных): 0..1. */
  throat(v) { this._set('--throat', (1 + Math.max(0, Math.min(1, v)) * 0.6).toFixed(2)); }

  /** Реплика в облако (с уважением к тумблеру и анти-спам-паузой). */
  say(text, ms = 3200) {
    if (!this.bubble || !progress.getMascotTalk()) return;
    const now = Date.now();
    if (now - this._lastSay < 2500) return; // не тараторить
    this._lastSay = now;
    this.bubble.innerHTML = `<span class="m-name">Кваковский</span>${text}`;
    this.bubble.hidden = false;
    const t = setTimeout(() => { if (this.bubble) this.bubble.hidden = true; }, ms);
    this._timers.push(t);
  }

  destroy() { this._timers.forEach(clearTimeout); this._timers = []; this.el = null; this.bubble = null; }
}
