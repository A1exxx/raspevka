// modes-picker.js — выбор лада распевок с замками по тарифу (по ТЗ Игоря).
// Free — только мажор; Standard — +минор; Pro — все лады. Закрытые лады ВИДНЫ,
// но под замком. Тариф пока переключается вручную (демо), до реального биллинга.
import { MODES, modeUnlocked } from '../theory/modes.js';
import * as progress from '../state/progress.js';

function lockIcon() {
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
}
const tierName = { free: 'Free', standard: 'Standard', pro: 'Pro' };

export function renderModesPicker(app, { onExit }) {
  function draw() {
    const tier = progress.getTier();
    const cur = progress.getModeKey();
    const tierSeg = ['free', 'standard', 'pro']
      .map((k) => `<button data-tier="${k}" class="${tier === k ? 'on' : ''}">${tierName[k]}</button>`).join('');
    const list = MODES.map((m) => {
      const unlocked = modeUnlocked(m.key, tier);
      const sel = m.key === cur;
      return `
        <button class="mode-item ${unlocked ? '' : 'locked'} ${sel ? 'sel' : ''}" data-mode="${m.key}" ${unlocked ? '' : 'disabled'}>
          <span class="mode-name">${m.name}${sel ? ' · выбран' : ''}</span>
          ${unlocked ? '' : `<span class="mode-lock">${lockIcon()} ${tierName[m.tier]}</span>`}
        </button>`;
    }).join('');
    app.innerHTML = `
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Лад распевок</h1>
          <p>Лад меняет окраску ладовых упражнений («Ладовая ЯМ»). На младших тарифах часть ладов закрыта.</p></div>
        <div class="settings">
          <div class="seg-label">Тариф (демо)</div>
          <div class="seg" id="tierSeg">${tierSeg}</div>
        </div>
        <div class="card list">
          <div class="list-sep">Лады</div>
          ${list}
        </div>
      </div>`;
    document.getElementById('back').addEventListener('click', onExit);
    document.querySelectorAll('[data-tier]').forEach((b) => b.addEventListener('click', () => { progress.setTier(b.dataset.tier); draw(); }));
    document.querySelectorAll('[data-mode]:not([disabled])').forEach((b) => b.addEventListener('click', () => { progress.setModeKey(b.dataset.mode); draw(); }));
  }
  draw();
}
