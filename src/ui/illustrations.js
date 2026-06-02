// illustrations.js — встроенные SVG-схемы (без внешних картинок, в стиле приложения).

const LINE = '#5b6370';
const ACCENT = '#46b3a8';
const TEXT = '#cdd3db';
const DIM = '#949daa';

// Одна фигура (фронтально): торс + «живот». inflated=true → надутый живот + стрелки.
function figure(cx, inflated, capTop, capBot) {
  const belly = inflated
    ? `
      <circle cx="${cx}" cy="126" r="28" fill="rgba(70,179,168,0.18)" stroke="${ACCENT}" stroke-width="2.5"/>
      <text x="${cx}" y="130" text-anchor="middle" fill="${ACCENT}" font-size="11" font-weight="700">воздух</text>
      <path d="M${cx} 82 L${cx} 102" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx - 5} 98 L${cx} 107 L${cx + 5} 98 Z" fill="${ACCENT}"/>
      <path d="M${cx - 31} 126 L${cx - 47} 126" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx - 43} 121 L${cx - 51} 126 L${cx - 43} 131 Z" fill="${ACCENT}"/>
      <path d="M${cx + 31} 126 L${cx + 47} 126" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx + 43} 121 L${cx + 51} 126 L${cx + 43} 131 Z" fill="${ACCENT}"/>`
    : `
      <circle cx="${cx}" cy="122" r="10" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="3 3"/>`;
  return `
    <circle cx="${cx}" cy="30" r="12" fill="none" stroke="${LINE}" stroke-width="2.5"/>
    <rect x="${cx - 34}" y="49" width="68" height="10" rx="5" fill="${LINE}" opacity="0.85"/>
    <rect x="${cx - 26}" y="62" width="52" height="112" rx="22" fill="#20242b" stroke="${LINE}" stroke-width="2.5"/>
    ${belly}
    <text x="${cx}" y="198" text-anchor="middle" fill="${TEXT}" font-size="12.5" font-weight="700">${capTop}</text>
    <text x="${cx}" y="215" text-anchor="middle" fill="${DIM}" font-size="11">${capBot}</text>`;
}

/** Схема диафрагмального дыхания: покой vs вдох + контроль плеч. */
export function bellyDiagram() {
  return `
    <div class="breathe-diagram">
      <svg viewBox="0 0 340 228" role="img" aria-label="Дыхание животом: на вдохе живот наполняется, плечи не поднимаются">
        <line x1="22" y1="51" x2="318" y2="51" stroke="${LINE}" stroke-dasharray="4 5" stroke-width="1.5"/>
        <text x="170" y="43" text-anchor="middle" fill="${DIM}" font-size="11">плечи на одном уровне — не поднимай</text>
        ${figure(92, false, 'Выдох / покой', 'живот мягкий')}
        ${figure(248, true, 'Вдох', 'живот наполнен')}
      </svg>
      <p class="diagram-note">Воздух идёт вниз, в живот — он округляется вперёд. <b>Плечи и грудь почти неподвижны</b>, не тянись вверх.</p>
    </div>`;
}
