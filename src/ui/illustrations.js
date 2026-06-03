// illustrations.js — встроенные SVG-схемы (без внешних картинок, в стиле приложения).

const LINE = '#5b6370';
const ACCENT = '#46b3a8';
const ACCENT2 = '#5ec9bd';
const TEXT = '#cdd3db';
const DIM = '#949daa';

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
const isWhite = (m) => WHITE_PCS.includes(((m % 12) + 12) % 12);
const octName = (m) => `C${Math.floor(m / 12) - 1}`;

/** Мини-клавиатура с закрашенным диапазоном [lowMidi..highMidi]. */
export function miniKeyboard(lowMidi, highMidi) {
  if (lowMidi == null || highMidi == null) return '';
  let start = Math.round(lowMidi) - 2;
  let end = Math.round(highMidi) + 2;
  while (((start % 12) + 12) % 12 !== 0) start--;       // снап вниз до C
  while (((end % 12) + 12) % 12 !== 11) end++;          // снап вверх до B

  const w = 13, h = 54, bw = 9, bh = 33;
  const inRange = (m) => m >= lowMidi && m <= highMidi;

  const whites = [];
  for (let m = start; m <= end; m++) if (isWhite(m)) whites.push(m);
  const width = whites.length * w;
  const xOf = {};
  whites.forEach((m, i) => { xOf[m] = i * w; });

  let body = '';
  // белые клавиши
  whites.forEach((m, i) => {
    const x = i * w;
    body += `<rect x="${x}" y="0" width="${w - 1}" height="${h}" rx="2.5" fill="${inRange(m) ? ACCENT : '#252a31'}" stroke="#3a4250" stroke-width="1"/>`;
    if (((m % 12) + 12) % 12 === 0) body += `<text x="${x + (w - 1) / 2}" y="${h + 11}" text-anchor="middle" fill="${DIM}" font-size="8">${octName(m)}</text>`;
  });
  // чёрные клавиши поверх
  for (let m = start; m <= end; m++) {
    if (isWhite(m)) continue;
    const left = xOf[m - 1];
    if (left == null) continue;
    const x = left + w - bw / 2;
    body += `<rect x="${x}" y="0" width="${bw}" height="${bh}" rx="2" fill="${inRange(m) ? ACCENT2 : '#0e1014'}" stroke="#0e1014" stroke-width="1"/>`;
  }

  return `
    <div class="mini-kb">
      <svg viewBox="0 0 ${width} ${h + 14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${body}
      </svg>
    </div>`;
}

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
