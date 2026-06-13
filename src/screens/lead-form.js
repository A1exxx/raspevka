// lead-form.js — «Записаться к педагогу»: заявка на бесплатный пробный урок.
// Пользователь выбирает предпочтение педагога, пишет цель, оставляет контакт.
// К заявке прикладывается его прогресс (диапазон/стрик/блоки) — педагогу видно с чем работать.
// Заявка сохраняется локально (не теряется) и, если настроен бот (lead-config.js),
// мгновенно улетает педагогу в Telegram.
import * as progress from '../state/progress.js';
import { getVoiceType, midiName } from '../theory/voice-types.js';
import { sendLeadToTelegram } from '../state/lead-config.js';
import { celebrate } from '../ui/celebrate.js';
import { logEvent } from '../state/analytics.js';

export function renderLeadForm(app, { onExit }) {
  logEvent('lead_open'); // открыл форму заявки — цель воронки
  const v = progress.getVoice();
  const vt = v && getVoiceType(v.key);
  const range = progress.getRange();
  const stats = {
    voiceType: vt ? vt.name : null,
    range: (range && Number.isFinite(range.low)) ? `${midiName(range.low)}–${midiName(range.high)}` : null,
    streak: progress.getStreak(),
    blocks: progress.getExamsPassed().length,
  };
  const statLine = [
    stats.voiceType, stats.range ? `диапазон ${stats.range}` : null,
    stats.streak ? `стрик ${stats.streak}` : null, stats.blocks ? `блоков ${stats.blocks}` : null,
  ].filter(Boolean).join(' · ') || 'пока без данных';

  let pref = 'any';

  function form() {
    app.innerHTML = `
      <div class="screen leadform">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Урок с педагогом</h1><p>Бесплатный пробный урок в школе «Прояви». Педагог поставит голос быстрее, чем в одиночку.</p></div>
        <div class="card">
          <label class="field"><span>Как тебя зовут</span>
            <input id="lf-name" type="text" autocomplete="name" placeholder="Имя" /></label>
          <label class="field"><span>Куда написать (Telegram или телефон)</span>
            <input id="lf-contact" type="text" inputmode="text" placeholder="@username или +7…" /></label>
          <div class="field"><span>Педагог</span>
            <div class="seg" id="lf-pref">
              <button data-pref="any" class="on">Без разницы</button>
              <button data-pref="male">Мужчина</button>
              <button data-pref="female">Женщина</button>
            </div>
          </div>
          <label class="field"><span>Что хочешь (необязательно)</span>
            <textarea id="lf-goal" rows="3" placeholder="Например: хочу петь чисто и расширить диапазон"></textarea></label>
          <p class="hint" style="margin:2px 0 12px">К заявке приложим твой прогресс: <b>${statLine}</b> — педагогу сразу видно, с чего начать.</p>
          <button class="btn btn-primary" id="lf-send" style="width:100%">Записаться на бесплатный пробный</button>
          <p class="hint" id="lf-err" style="color:var(--coral);margin-top:8px"></p>
        </div>
      </div>
    `;
    document.getElementById('back').addEventListener('click', onExit);
    app.querySelectorAll('#lf-pref [data-pref]').forEach((b) => b.addEventListener('click', () => {
      pref = b.dataset.pref;
      app.querySelectorAll('#lf-pref [data-pref]').forEach((x) => x.classList.toggle('on', x.dataset.pref === pref));
    }));
    document.getElementById('lf-send').addEventListener('click', async () => {
      const name = document.getElementById('lf-name').value.trim();
      const contact = document.getElementById('lf-contact').value.trim();
      const goal = document.getElementById('lf-goal').value.trim();
      if (!name || !contact) {
        document.getElementById('lf-err').textContent = 'Заполни имя и контакт — иначе педагог не сможет ответить.';
        return;
      }
      const btn = document.getElementById('lf-send');
      btn.disabled = true;
      btn.textContent = 'Отправляю…';
      const lead = { name, contact, pref, goal, stats };
      progress.saveLead(lead);                  // локально — сразу, не потеряется
      logEvent('lead_sent', { pref });          // заявка отправлена — главная цель воронки
      await sendLeadToTelegram(lead);           // педагогу в TG (если настроен бот)
      done(name);
    });
  }

  function done(name) {
    celebrate(1);
    app.innerHTML = `
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${name}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `;
    document.getElementById('lf-ok').addEventListener('click', onExit);
  }

  form();
}
