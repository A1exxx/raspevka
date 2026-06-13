// share.js — «Поделиться результатом»: рисует карточку (canvas) со звёздами и
// точностью и отдаёт через Web Share API (с картинкой, где поддерживается) или
// копирует текст + ссылку. UTM помечает источник как «share».
const APP_URL = 'https://a1exxx.github.io/raspevka/?utm_source=share&utm_medium=result';

function drawCard(name, pct, stars) {
  const W = 1080, H = 1080, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#114b44'); g.addColorStop(1, '#081f1d');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.textAlign = 'center';
  x.fillStyle = '#3de5c9'; x.font = '700 40px system-ui,sans-serif';
  x.fillText('● РАСПЕВКА', W / 2, 180);
  x.fillStyle = '#fff'; x.font = '800 64px system-ui,sans-serif';
  x.fillText(name, W / 2, 380);
  x.font = '700 200px system-ui,sans-serif';
  x.fillText(pct + '%', W / 2, 620);
  x.fillStyle = '#ffc24d'; x.font = '90px serif';
  x.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), W / 2, 760);
  x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '600 38px system-ui,sans-serif';
  x.fillText('a1exxx.github.io/raspevka', W / 2, 980);
  return c;
}

export async function shareResult({ name, pct, stars }) {
  const text = `Спел распевку «${name}» на ${pct}% (${'★'.repeat(stars)}) в Распевке! Попробуй и ты:`;
  const canvas = drawCard(name, pct, stars);
  try {
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const file = blob ? new File([blob], 'raspevka.png', { type: 'image/png' }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, url: APP_URL });
      return;
    }
    if (navigator.share) { await navigator.share({ text, url: APP_URL }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; /* иначе — фолбэк ниже */ }
  // Фолбэк: скопировать текст+ссылку
  try { await navigator.clipboard.writeText(`${text} ${APP_URL}`); } catch (e) { /* ok */ }
}
