// paywall.js — мягкий пейволл (показывается ТОЛЬКО при включённом progress.paywallEnabled).
// Модель: FREE_PER_DAY бесплатных распевок в день → дальше предлагаем 7-дневный триал
// (без карты), урок с педагогом (воронка в школу) или вернуться завтра.
// Продажа подписки (оплата) подключается на этапе размещения в сторах.
import * as progress from '../state/progress.js';
import { celebrate } from '../ui/celebrate.js';

export function renderPaywall(app, { onExit, onTrialStarted, onTeacher }) {
  const trialUsed = progress.getTrialDaysLeft() != null;
  app.innerHTML = `
    <div class="screen summary">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand">
        <h1>На сегодня — всё 🎉</h1>
        <p>Ты прошёл ${progress.FREE_PER_DAY} бесплатных распевок за день. Голосу полезен отдых — а завтра лимит обновится.</p>
      </div>
      <div class="card" style="text-align:left">
        <p class="how"><b>Хочешь без лимитов?</b></p>
        <ul class="safety-list" style="margin-top:10px">
          <li>Все распевки и блоки программы без ограничений</li>
          <li>Все лады (Standard/Pro)</li>
          <li>Тёмная сцена и грув-подложки</li>
        </ul>
        ${trialUsed
          ? '<p class="hint" style="margin-top:12px">Пробный период уже использован. Подписка появится вместе с релизом в магазинах приложений.</p>'
          : `<button class="btn btn-primary" id="trial" style="width:100%;margin-top:14px">Попробовать 7 дней бесплатно</button>
             <p class="hint" style="margin-top:8px">Без карты и автосписаний — просто открываем всё на неделю.</p>`}
      </div>
      <div class="teacher-cta">
        <span>Быстрее всего голос растёт с живым педагогом.</span>
        <button class="btn btn-ghost" id="teacher">Бесплатный пробный урок</button>
      </div>
      <button class="btn btn-ghost" id="tomorrow" style="width:100%">Вернусь завтра</button>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  document.getElementById('tomorrow').addEventListener('click', onExit);
  document.getElementById('teacher').addEventListener('click', onTeacher);
  const trialBtn = document.getElementById('trial');
  if (trialBtn) trialBtn.addEventListener('click', () => {
    progress.startTrial();
    celebrate(2);
    onTrialStarted();
  });
}
