// analytics-config.js — подключение Яндекс.Метрики (необязательно).
// НАСТРОЙКА ЗА 2 МИНУТЫ:
//   1. metrika.yandex.ru → создать счётчик для a1exxx.github.io/raspevka → скопировать НОМЕР.
//   2. Вписать его в COUNTER ниже (только цифры, напр. 99887766).
//   3. npm run build → деплой. Всё.
// Пока COUNTER пустой — метрика не грузится (ноль внешних запросов), локальный лог работает.
//
// Что увидишь в Метрике: посещения, вебвизор, и ЦЕЛИ-события (мы шлём их сами):
//   demo_start · exercise_done · lead_open · lead_sent — настрой их как цели в кабинете.
export const YM_COUNTER = ''; // напр. '99887766'

let _ready = false;

/** Подключить счётчик Метрики (вызывается один раз из main.js при старте). */
export function initMetrika() {
  if (!YM_COUNTER || _ready) return;
  _ready = true;
  try {
    /* eslint-disable */
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) return; }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(Number(YM_COUNTER), 'init', { webvisor: true, clickmap: true, accurateTrackBounce: true });
    /* eslint-enable */
  } catch (e) { /* блокировщик/офлайн — молча */ }
}

/** Отправить цель в Метрику (молча игнорируется, если счётчик не настроен). */
export function reachGoal(goal, params) {
  if (!YM_COUNTER) return;
  try { if (window.ym) window.ym(Number(YM_COUNTER), 'reachGoal', goal, params); } catch (e) { /* ok */ }
}
