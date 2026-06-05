// settings.js — единый экран настроек: голос, громкость, вывод/задержка, чувствительность,
// подсказка, темп, грув, сброс. Собирает разрозненные тумблеры в одно понятное место.
import * as progress from '../state/progress.js';
import { setOutputVolume, playTone } from '../audio/reference-tone.js';
import { getVoiceType } from '../theory/voice-types.js';

export function renderSettings(app, mic, { onExit, onVoice, onCalibrate }) {
  let confirmReset = false;

  function seg(items, current, attr) {
    return `<div class="seg">${items.map(([k, l]) =>
      `<button data-${attr}="${k}" class="${current === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }

  function render() {
    const v = progress.getVoice();
    const vt = v && getVoiceType(v.key);
    app.innerHTML = `
      <div class="screen settings-screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Настройки</h1><p>Звук, голос и поведение распевок — в одном месте.</p></div>

        <div class="card settings">
          <div class="set-row"><div class="seg-label">Мой голос</div>
            <button class="toggle" id="voice">${vt ? vt.name : 'Определить тип голоса'} ›</button></div>

          <div class="seg-label">Громкость подсказки <span class="set-hint">на телефоне ставь «Громко/Макс»</span></div>
          ${seg([['quiet', 'Тихо'], ['normal', 'Норм'], ['loud', 'Громко'], ['max', 'Макс']], progress.getVolumeKey(), 'vol')}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${seg([['speaker', 'Динамик'], ['wired', 'Провод'], ['bt', 'Bluetooth']], progress.getRouteKey(), 'route')}
          ${onCalibrate ? `<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(progress.getLatency() * 1000)} мс · настроить ›</button></div>` : ''}

          <div class="seg-label">Чувствительность микрофона</div>
          ${seg([['low', 'Низкая'], ['med', 'Средняя'], ['high', 'Высокая']], progress.getSensitivityKey(), 'sens')}

          <div class="seg-label">Темп распевок</div>
          ${seg([['easy', 'Медл.'], ['medium', 'Средне'], ['fast', 'Быстро']], progress.getDifficulty(), 'diff')}

          <div class="seg-label">Звук подсказки</div>
          ${seg([['piano', 'Пиано'], ['guitar', 'Гитара'], ['soft', 'Мягкий']], progress.getTimbre(), 'timbre')}

          <div class="seg-label">Грув (ритм-подложка)</div>
          ${seg([['off', 'Выкл'], ['pop', 'Поп'], ['funk', 'Фанк'], ['soft', 'Мягкий']], progress.getGroove(), 'groove')}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${progress.getGuide() ? 'on' : ''}" id="guide">Подсказка тоном: ${progress.getGuide() ? 'вкл' : 'выкл'}</button>
            <button class="toggle ${progress.getHeadphones() ? 'on' : ''}" id="hp">Наушники: ${progress.getHeadphones() ? 'да' : 'нет'}</button>
          </div>
          <button class="toggle ${progress.getMicAGC() ? 'on' : ''}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${progress.getMicAGC() ? 'вкл' : 'выкл'} <span class="set-hint">${progress.getMicAGC() ? 'громче на телефоне' : 'ровнее долгие ноты'}</span></button>
        </div>

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${confirmReset ? 'btn-danger' : 'btn-ghost'}" id="reset" style="width:100%">${confirmReset ? 'Точно сбросить? Нажми ещё раз' : 'Сбросить всё'}</button>
        </div>
      </div>
    `;

    document.getElementById('back').addEventListener('click', onExit);
    document.getElementById('voice').addEventListener('click', onVoice);

    app.querySelectorAll('[data-vol]').forEach((b) => b.addEventListener('click', () => {
      progress.setVolume(b.dataset.vol);
      setOutputVolume(progress.getVolumeMult());
      if (mic && mic.ctx) { try { playTone(mic.ctx, 523.25, 0.5, 0, 0.22, progress.getTimbre()); } catch (e) { /* ok */ } }
      render();
    }));
    app.querySelectorAll('[data-route]').forEach((b) => b.addEventListener('click', () => { progress.setRoute(b.dataset.route); render(); }));
    app.querySelectorAll('[data-sens]').forEach((b) => b.addEventListener('click', () => {
      progress.setSensitivity(b.dataset.sens);
      if (mic && mic.setSensitivity) mic.setSensitivity(progress.getSensitivity());
      render();
    }));
    app.querySelectorAll('[data-diff]').forEach((b) => b.addEventListener('click', () => { progress.setDifficulty(b.dataset.diff); render(); }));
    app.querySelectorAll('[data-timbre]').forEach((b) => b.addEventListener('click', () => { progress.setTimbre(b.dataset.timbre); render(); }));
    app.querySelectorAll('[data-groove]').forEach((b) => b.addEventListener('click', () => { progress.setGroove(b.dataset.groove); render(); }));
    document.getElementById('guide').addEventListener('click', () => { progress.setGuide(!progress.getGuide()); render(); });
    document.getElementById('hp').addEventListener('click', () => { progress.setHeadphones(!progress.getHeadphones()); render(); });
    document.getElementById('agc').addEventListener('click', () => {
      const on = !progress.getMicAGC();
      progress.setMicAGC(on);
      if (mic && mic.setAGC) mic.setAGC(on); // применяем к живому треку сразу
      render();
    });
    const calib = document.getElementById('calib');
    if (calib && onCalibrate) calib.addEventListener('click', onCalibrate);

    document.getElementById('reset').addEventListener('click', () => {
      if (!confirmReset) { confirmReset = true; render(); return; }
      progress.resetAll();
      onExit();
    });
  }

  render();
}
