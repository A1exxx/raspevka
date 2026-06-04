// share-card.js — генерирует картинку-карточку (canvas) с результатом/диапазоном и
// делится ею через Web Share API (или скачивает). Вирусный крючок: пользователь
// шарит «мой диапазон / мой результат» в соцсети.

function roundRect(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

/** Нарисовать карточку. Возвращает canvas. */
function drawCard({ headline = 'Мой прогресс', big = '', sub = '' }) {
  const W = 1080, H = 1080;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  // фон
  x.fillStyle = '#eef2f4'; x.fillRect(0, 0, W, H);
  // карточка
  x.fillStyle = '#ffffff';
  x.shadowColor = 'rgba(20,33,55,.18)'; x.shadowBlur = 60; x.shadowOffsetY = 24;
  roundRect(x, 90, 120, W - 180, H - 300, 48); x.fill();
  x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;

  // верхняя акцентная плашка
  x.fillStyle = '#0e8d7f';
  roundRect(x, 90, 120, W - 180, 150, 48); x.fill();
  x.fillStyle = '#0e8d7f'; x.fillRect(90, 230, W - 180, 40);
  // бренд
  x.fillStyle = '#ffffff';
  x.font = '700 46px system-ui, sans-serif';
  x.textBaseline = 'middle';
  x.fillText('Распевка', 130, 195);
  x.font = '500 30px system-ui, sans-serif';
  x.fillStyle = 'rgba(255,255,255,.9)';
  x.textAlign = 'right';
  x.fillText('вокальный тренажёр', W - 130, 195);
  x.textAlign = 'left';

  // headline
  x.fillStyle = '#5c6775';
  x.font = '600 40px system-ui, sans-serif';
  x.fillText(headline, 150, 380);

  // большое значение
  x.fillStyle = '#1b2430';
  x.font = '800 150px system-ui, sans-serif';
  x.fillText(big, 146, 520);

  // подзаголовок
  x.fillStyle = '#0a766a';
  x.font = '600 44px system-ui, sans-serif';
  x.fillText(sub, 150, 660);

  // нижняя подпись
  x.fillStyle = '#9aa6b2';
  x.font = '500 32px system-ui, sans-serif';
  x.fillText('a1exxx.github.io/raspevka', 150, H - 240);
  return cv;
}

/** Поделиться карточкой (или скачать, если шеринг файлов недоступен). */
export async function shareCard(data) {
  const cv = drawCard(data);
  const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
  if (!blob) return;
  const file = new File([blob], 'raspevka.png', { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Распевка', text: data.sub || 'Мой прогресс в Распевке' });
      return;
    }
  } catch (e) { /* пользователь отменил или не поддерживается — падаем в скачивание */ }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'raspevka.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
