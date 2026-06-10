// celebrate.js — лёгкое празднование (конфетти) без библиотек.
// Web Animations API + авто-очистка. Уважает prefers-reduced-motion.
// level: 1 — скромно (хорошо), 2 — ярко (отлично/экзамен/онбординг).

const COLORS = ['#0e8d7f', '#12a36b', '#e0a64a', '#5b8def', '#e0544b', '#9b6dd6'];

export function celebrate(level = 1) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const n = level >= 2 ? 36 : 18;
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden';
  document.body.appendChild(wrap);

  const W = window.innerWidth;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i');
    const size = 5 + Math.random() * 6;
    const round = Math.random() < 0.4;
    el.style.cssText = `position:absolute;top:-12px;left:${Math.random() * W}px;width:${size}px;height:${round ? size : size * 0.45}px;background:${COLORS[i % COLORS.length]};border-radius:${round ? '50%' : '2px'};will-change:transform,opacity`;
    wrap.appendChild(el);
    const fall = 320 + Math.random() * 380;
    const drift = (Math.random() - 0.5) * 160;
    const dur = 1100 + Math.random() * 900;
    el.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${drift}px,${fall}px) rotate(${(Math.random() - 0.5) * 540}deg)`, opacity: 0 },
    ], { duration: dur, delay: Math.random() * 250, easing: 'cubic-bezier(.2,.6,.35,1)', fill: 'forwards' });
  }
  setTimeout(() => wrap.remove(), 2600);
}

/** Короткая вибрация при попадании/успехе (молча игнорируется, где не поддерживается). */
export function haptic(ms = 12) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ok */ }
}
