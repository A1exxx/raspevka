// lead-config.js — куда отправлять заявки «Урок с педагогом».
// НАСТРОЙКА ЗА 2 МИНУТЫ (см. docs/TEACHER-BOT-SETUP.md):
//   1. В Telegram: @BotFather → /newbot → скопируй токен сюда.
//   2. Напиши боту любое сообщение, открой
//      https://api.telegram.org/bot<ТОКЕН>/getUpdates → возьми chat.id сюда.
//   3. npm run build → деплой. Всё.
// Пока поля пустые — заявки сохраняются локально (progress.saveLead) и не теряются.
export const LEAD_TG = {
  token: '',   // токен бота от @BotFather, напр. '12345678:AAE...'
  chatId: '',  // chat.id педагога/менеджера, напр. '987654321'
};

/**
 * Отправить заявку педагогу в Telegram. Возвращает true при успехе.
 * Молча выживает при любых ошибках (нет сети/не настроено) — заявка уже сохранена локально.
 */
export async function sendLeadToTelegram(lead) {
  if (!LEAD_TG.token || !LEAD_TG.chatId) return false;
  const stats = lead.stats || {};
  const text = [
    '🎤 Новая заявка из «Распевки»',
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Педагог: ${lead.pref === 'male' ? 'мужчина' : lead.pref === 'female' ? 'женщина' : 'без разницы'}`,
    lead.goal ? `Цель: ${lead.goal}` : null,
    stats.voiceType ? `Голос: ${stats.voiceType}${stats.range ? ` · ${stats.range}` : ''}` : null,
    stats.streak ? `Стрик: ${stats.streak} дн.` : null,
    stats.blocks ? `Программа: ${stats.blocks}` : null,
  ].filter(Boolean).join('\n');
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`https://api.telegram.org/bot${LEAD_TG.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: LEAD_TG.chatId, text }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.ok;
  } catch (e) {
    return false;
  }
}
