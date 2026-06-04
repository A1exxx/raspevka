// illustrations.js — встроенные SVG (мини-клавиатура). Картинка дыхания — в belly-diagram.js.

const ACCENT = '#0e8d7f';
const ACCENT2 = '#0a766a';
const DIM = '#687485';
const KEY_WHITE = '#ffffff';   // неактивная белая клавиша (светлая тема)
const KEY_BLACK = '#2a3340';   // неактивная чёрная клавиша
const KEY_LINE = '#cfd6e0';    // обводка клавиш

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
    body += `<rect x="${x}" y="0" width="${w - 1}" height="${h}" rx="2.5" fill="${inRange(m) ? ACCENT : KEY_WHITE}" stroke="${KEY_LINE}" stroke-width="1"/>`;
    if (((m % 12) + 12) % 12 === 0) body += `<text x="${x + (w - 1) / 2}" y="${h + 11}" text-anchor="middle" fill="${DIM}" font-size="8">${octName(m)}</text>`;
  });
  // чёрные клавиши поверх
  for (let m = start; m <= end; m++) {
    if (isWhite(m)) continue;
    const left = xOf[m - 1];
    if (left == null) continue;
    const x = left + w - bw / 2;
    body += `<rect x="${x}" y="0" width="${bw}" height="${bh}" rx="2" fill="${inRange(m) ? ACCENT2 : KEY_BLACK}" stroke="${KEY_BLACK}" stroke-width="1"/>`;
  }

  return `
    <div class="mini-kb">
      <svg viewBox="0 0 ${width} ${h + 14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${body}
      </svg>
    </div>`;
}

/**
 * Рисунок мелодии упражнения (piano-roll, как в Vocalista): каждая нота — квадратик,
 * по горизонтали — порядок, по вертикали — высота (полутон). Наглядно показывает
 * форму распевки (подъём/спуск/арка/скачок) ДО начала — для тех, кто воспринимает
 * ноты «рисунком», а не на слух. Возвращает <span class="ex-glyph">…</span>.
 */
export function contourGlyph(midis) {
  if (!Array.isArray(midis) || !midis.length) return '<span class="ex-glyph"></span>';
  const n = midis.length;
  const min = Math.min(...midis);
  const max = Math.max(...midis);
  const span = Math.max(1, max - min);
  const rows = span + 1;
  const cell = 10, pad = 2, side = cell - 2 * pad;
  const W = n * cell, H = rows * cell;
  let body = '';
  for (let i = 0; i < n; i++) {
    const m = midis[i];
    const x = i * cell + pad;
    const y = (max - m) * cell + pad;            // 0 сверху = самая высокая нота
    const hi = m === max ? ' class="gh-hi"' : ''; // верхняя нота — акцентом
    body += `<rect${hi} x="${x}" y="${y}" width="${side}" height="${side}" rx="1.4"/>`;
  }
  return `<span class="ex-glyph"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${body}</svg></span>`;
}

