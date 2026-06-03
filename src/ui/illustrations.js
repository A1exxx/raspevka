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

const BODY = '#2b323c';

// Фигура человека (фронтально). inflated=true → живот выпирает + рука на животе.
function figure(cx, inflated, capTop, capBot) {
  // силуэт корпуса: на вдохе бока расходятся в районе живота
  const body = inflated
    ? `M${cx - 23} 58 C ${cx - 33} 92 ${cx - 36} 128 ${cx - 25} 152 C ${cx - 16} 166 ${cx} 168 ${cx} 168 C ${cx} 168 ${cx + 16} 166 ${cx + 25} 152 C ${cx + 36} 128 ${cx + 33} 92 ${cx + 23} 58 Z`
    : `M${cx - 22} 58 C ${cx - 25} 90 ${cx - 23} 126 ${cx - 19} 150 C ${cx - 13} 164 ${cx} 166 ${cx} 166 C ${cx} 166 ${cx + 13} 164 ${cx + 19} 150 C ${cx + 23} 126 ${cx + 25} 90 ${cx + 22} 58 Z`;
  const belly = inflated
    ? `
      <ellipse cx="${cx}" cy="126" rx="25" ry="21" fill="rgba(70,179,168,0.22)"/>
      <text x="${cx}" y="130" text-anchor="middle" fill="${ACCENT}" font-size="10" font-weight="700">воздух</text>
      <path d="M${cx - 30} 126 L${cx - 45} 126" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M${cx - 41} 122 L${cx - 48} 126 L${cx - 41} 130 Z" fill="${ACCENT}"/>
      <path d="M${cx + 30} 126 L${cx + 45} 126" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M${cx + 41} 122 L${cx + 48} 126 L${cx + 41} 130 Z" fill="${ACCENT}"/>
      <path d="M${cx + 18} 96 C ${cx + 30} 104 ${cx + 30} 120 ${cx + 22} 132" fill="none" stroke="${TEXT}" stroke-width="5" stroke-linecap="round"/>`
    : '';
  return `
    <circle cx="${cx}" cy="32" r="15" fill="${BODY}" stroke="${LINE}" stroke-width="2.5"/>
    <path d="${body}" fill="${BODY}" stroke="${LINE}" stroke-width="2.5"/>
    ${belly}
    <text x="${cx}" y="194" text-anchor="middle" fill="${TEXT}" font-size="12.5" font-weight="700">${capTop}</text>
    <text x="${cx}" y="211" text-anchor="middle" fill="${DIM}" font-size="11">${capBot}</text>`;
}

/** Картинка-человек: дыхание животом (покой vs вдох) + контроль плеч. */
export function bellyDiagram() {
  return `
    <div class="breathe-diagram">
      <svg viewBox="0 0 340 224" role="img" aria-label="Дыхание животом: на вдохе живот наполняется, плечи не поднимаются">
        <line x1="24" y1="54" x2="316" y2="54" stroke="${LINE}" stroke-dasharray="4 5" stroke-width="1.5"/>
        <text x="170" y="46" text-anchor="middle" fill="${DIM}" font-size="11">плечи на месте — не поднимай</text>
        ${figure(92, false, 'Выдох / покой', 'живот мягкий')}
        ${figure(248, true, 'Вдох', 'живот наполнен')}
      </svg>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (рукой почувствуешь), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`;
}
