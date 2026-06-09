# Распевка — HANDOFF (актуально 2026-06-09)

Точка возврата после /compact. Где мы и что дальше.

## Координаты
- Проект: `D:\vocal-trainer` (vanilla JS + Vite + Canvas, без бэкенда, localStorage).
- LIVE: **https://a1exxx.github.io/raspevka/** · GitHub: **A1exxx/raspevka**.
- Текущий HEAD master: **ef47246**. Деплой gh-pages: **b55d67c**. Чекпоинт: **`approved-2026-06-09-qa-polish`**.
- Детекция тона — pitchy (MPM). Стек давно собран; идёт продуктовая доводка.

## Деплой (как катать)
```
npm run build                      # base './' уже настроен
cd dist; (создать .nojekyll); git init (если нет) → ветка gh-pages
git add -A && git commit -m deploy
git push -f https://github.com/A1exxx/raspevka.git gh-pages
```
master пушим отдельно: `git push origin master`. Перед изменением логики — `npm test` (сейчас 79/79) + `npm run build`.

## Что уже сделано (этот цикл)
- Светлая дизайн-система v2: **Fraunces (заголовки) + Inter (UI)** через Google Fonts non-blocking; тинт-тени (sm/md/lg), тактильный `:active scale`, мягкий каскад появления, градиентный hero. Чекпоинт для отката: тег **`approved-2026-06-09-design-premium`**.
- **Учебная программа**: каталог блоков (open/locked/done) + экзамены с чек-поинтом (порог, энергия за провал, пересдача) + гейтинг + прогресс X/N. Файлы: `theory/curriculum.js`, `screens/catalog.js`, оркестрация в `main.js` (renderCatalogScreen/openBlock/runBlockItem/runExam/renderExamResult).
- **Дыхание встроено в Блок 1**; **Блок 2 «Ясность гласных»** = 5 распевок L02.
- **Вибрато** (упр. + Блок 5; скоринг вибрато/ровности в `game/scoring.js`).
- **Запись голоса** (`screens/recorder.js`, MediaRecorder).
- **«Пой под фонограмму»** (`screens/backing-song.js`) — его wav «Распевка с повышением» → `public/backing/raspevka-rise.mp3` (ffmpeg, 4.5МБ).
- **Лид-форма «Урок с педагогом»** (`screens/lead-form.js`): имя/контакт/предпочтение педагога/цель + авто-прогресс; `progress.saveLead` (локально). Вход на главной + из каталога/экзамена.
- **Аудио-фиксы**: громкость-регулятор, грув-дакинг, AGC off по умолчанию, калибровка задержки (acoustic loopback, `audio/latency-calibrate.js` + `screens/calibrate.js`), mic ctx self-heal.
- **Вход без гейта** микрофона + плавающая кнопка-микрофон (FAB) + загрузочный сплэш (одна фраза).
- **SW офлайн** → стратегия **network-first для HTML** (cache v3) — иначе залипал на старом билде.
- **Гласные распевки L02 — ТОЧНАЯ транскрипция** (ноты сняты ПРОГРАММНО по координатам нотных голов в PDF, не на глаз). «Скачок к V» исправлен на **вниз**.

## КЛЮЧЕВАЯ ТЕХНИКА (не потерять)
Снятие нот из PDF Cheryl Porter — **программно**: рендер PyMuPDF (`fitz`, matrix 5x) + извлечение нотных голов (глиф ``/``) с координатами через `page.get_text('rawdict')`, и линеек стана из `page.get_drawings()` (горизонтальные отрезки). Y нотной головы относительно стана → диатоническая высота (нижняя линия = E4). Так снимаются точные ноты. (Скрипт был временный, восстановить по описанию.)

## PDF-уроки (в C:\Users\user\Downloads) → блоки [маппинг в docs/PRODUCT-PLAN-RU.md §8]
L02 Vowel Placement → Блок 2 ✅СДЕЛАНО (5 распевок: Calm Down/Disco/James Charles/High Five/No Bubble Gum).
Очередь: L03 Breathing Bootcamp(дыхание), L04 Vibrato, L05 Timbre(нов.блок), L06 Registers(нов.), L07 Belting(нов.), L08 Articulation(нов.), L09 Agility(Блок3), L10 Resistance(нов.).
Снимать ПОБЛОЧНО (1–2 урока за заход). Названия по смыслу; ПЕСНИ со словами не берём (копирайт; #6 The Singer's Pledge пропущена). Высоты от E4 — подтвердить у музыканта (если октавой не туда — сдвинуть).

## Дальше (очередь, из плана)
1. **Ноты L03 (дыхание) + L09 (беглость)** — наполнить блоки (тем же экстрактором).
2. **Онбординг magic-demo** (эффектное определение голоса за минуту + celebration; UX как Simply Sing).
3. **Тёмный pitch-экран** — эксперимент ЗА ТУМБЛЕРОМ (откат к `approved-2026-06-09-design-premium`). 5 улучшений: glow-trail, зоны точности (плавный hue), тёмный хайвей+светящиеся ноты, крупная цифра нота/центы, haptic на попадании.
4. **Бэкенд-отправка заявок** лид-формы (Telegram-бот/Google-таблица/email).
5. **Тест-режим/QA-панель** + `clock`-абстракция (перемотка времени для триала/стрика).
6. **Удержание P1** (streak freeze, дневная цель, celebration) — легко, не перегружать.
7. **Монетизация**: freemium + magic-demo + soft count-paywall (3–5 распевок) + 7-дн триал на годовой (модель Simply Sing). НЕ time/energy-cap.
8. **Демо-виджет** (`demo.html` + общее ядро) для встраивания на сайт школы «Прояви».
9. **ПОТОМ** — публикация: Telegram-мини-аппа (воронка, iOS микрофон капризен → openLink в браузер) → Google Play (TWA, PWABuilder, $25) → RuStore (free) → Apple (последним, $99/год, Mac).

## Гочи (preview/тест)
- `preview_start` хватает чужой конфиг **proyavi-static:8080** → переходить eval'ом `location.href='http://127.0.0.1:5180/'` (dev-сервер: `npm run dev -- --host 127.0.0.1 --port 5180`).
- Микрофон в preview стабить: patch `AudioContext.prototype.resume→Promise.resolve()`, osc→MediaStreamDestination, `navigator.mediaDevices.getUserMedia=async()=>stream`; seed `localStorage['raspevka.progress.v1']`.
- `preview_click` ненадёжен → кликать `el.click()` из eval + поллинг.
- `preview_screenshot` часто таймаутит (особенно с внешними шрифтами) → проверять через preview_eval DOM-ассерты.
- Игровой rAF-loop в нефокусной headless-вкладке тормозит → до экрана summary в preview не доходит (проверять логикой/тестами).
- SW: после деплоя у юзера старый SW может отдать старое → перезагрузить 1–2 раза (теперь network-first, дальше само).

## Память/правила
- Документы (план/хэндофф): `docs/PRODUCT-PLAN-RU.md`, этот файл.
- Инвест-деки: `docs/pitch-investor.html` и др.
- MemPalace wing=`vocal-trainer` (rooms: decisions/research/architecture/approved-checkpoints).
- НЕ удалять без спроса; чекпоинт-теги `approved-*` для отката.
