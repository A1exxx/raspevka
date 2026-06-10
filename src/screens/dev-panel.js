// dev-panel.js — тест-режим / QA-панель.
// Вход: ?dev=1 в URL или 7 быстрых тапов по логотипу на главной.
// Позволяет «прожить» путь пользователя: перемотать дни (стрик/энергия/триал),
// задать состояние, включить пейволл, симулировать нового пользователя.
import * as progress from '../state/progress.js';
import * as clock from '../state/clock.js';
import { BLOCKS } from '../theory/curriculum.js';

export function renderDevPanel(app, { onExit }) {
  const rerender = () => renderDevPanel(app, { onExit });
  const offset = clock.getOffsetDays();
  const simDate = clock.dayStr();
  const trialLeft = progress.getTrialDaysLeft();
  const seg = (label, btns) => `
    <div class="seg-label">${label}</div>
    <div class="seg">${btns.map(([id, txt, on]) => `<button data-act="${id}" class="${on ? 'on' : ''}">${txt}</button>`).join('')}</div>`;

  app.innerHTML = `
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Тест-режим</h1>
        <p>Перемотка времени и состояние — чтобы проверять стрик, энергию, триал и пейволл без ожидания. На пользователей не влияет.</p></div>

      <div class="card" style="text-align:left">
        <div class="seg-label">Время · сейчас «${simDate}» ${offset !== 0 ? `(смещение ${offset > 0 ? '+' : ''}${offset} дн.)` : '(реальное)'}</div>
        <div class="seg">
          <button data-act="d-1">−1 день</button>
          <button data-act="d+1">+1 день</button>
          <button data-act="d+7">+7 дней</button>
          <button data-act="d0">Реальное</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Стрик: ${progress.getStreak()} · заморозки: ${progress.getFreezes()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${progress.getEnergy()}/${progress.getMaxEnergy()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${seg(`Пейволл (soft, ${progress.FREE_PER_DAY}/день): сегодня использовано ${progress.getUsesToday()}`, [
          ['pw-on', 'Вкл', progress.getPaywallEnabled()],
          ['pw-off', 'Выкл', !progress.getPaywallEnabled()],
          ['pw-use', '+1 распевка', false],
        ])}

        <div class="seg-label" style="margin-top:12px">Триал: ${trialLeft == null ? 'не начат' : trialLeft > 0 ? `активен, осталось ${trialLeft} дн.` : 'истёк'}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${seg('Тариф', [
          ['tier-free', 'Free', progress.getTier() === 'free'],
          ['tier-std', 'Standard', progress.getTier() === 'standard'],
          ['tier-pro', 'Pro', progress.getTier() === 'pro'],
        ])}

        <div class="seg-label" style="margin-top:12px">Программа: сдано ${progress.getExamsPassed().length}/${BLOCKS.length}</div>
        <div class="seg">
          <button data-act="bl-all">Открыть все блоки</button>
          <button data-act="bl-none">Закрыть все</button>
        </div>
      </div>

      <button class="btn btn-ghost" id="simNew" style="width:100%">🧪 Симуляция нового пользователя (сброс + пейволл вкл)</button>
      <button class="btn btn-ghost" id="exitDev" style="width:100%">Выключить тест-режим</button>
      <p class="hint">Смещение времени живёт отдельно от прогресса: «Реальное» возвращает время, не трогая данные.</p>
    </div>
  `;

  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('exitDev').addEventListener('click', () => { progress.setDevMode(false); clock.resetOffset(); onExit(); });
  document.getElementById('simNew').addEventListener('click', () => {
    progress.resetAll();
    clock.resetOffset();
    progress.setDevMode(true);
    progress.setPaywallEnabled(true);
    rerender();
  });

  const ACTS = {
    'd-1': () => clock.shiftDays(-1), 'd+1': () => clock.shiftDays(1), 'd+7': () => clock.shiftDays(7), 'd0': () => clock.resetOffset(),
    's0': () => progress.devSetStreak(0), 's6': () => progress.devSetStreak(6), 's13': () => progress.devSetStreak(13),
    'fz': () => progress.setFreezes(progress.getFreezes() + 1),
    'e0': () => progress.setEnergy(0), 'e1': () => progress.setEnergy(1), 'emax': () => progress.setEnergy(progress.getMaxEnergy()),
    'pw-on': () => progress.setPaywallEnabled(true), 'pw-off': () => progress.setPaywallEnabled(false), 'pw-use': () => progress.countUse(),
    'tr-start': () => progress.startTrial(), 'tr-reset': () => progress.devResetTrial(),
    'tier-free': () => progress.setTier('free'), 'tier-std': () => progress.setTier('standard'), 'tier-pro': () => progress.setTier('pro'),
    'bl-all': () => progress.devUnlockAllBlocks(BLOCKS.map((b) => b.id)), 'bl-none': () => progress.devLockAllBlocks(),
  };
  app.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => { ACTS[btn.dataset.act](); rerender(); });
  });
}
