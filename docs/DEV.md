# Разработка и тестирование

## Запуск локально
```bash
npm install
npm run dev      # http://localhost:5173 (+ Network-адрес для телефона)
npm run build    # продакшен-сборка в dist/
npm run preview  # предпросмотр сборки
```

## Тест на десктопе
Открой http://localhost:5173 в Chrome → «Разрешить микрофон» → спой ноту.
На `localhost` микрофон работает по HTTP (браузеры считают localhost безопасным).

## Тест на телефоне (важно — нужен HTTPS!)
`getUserMedia` на сетевом адресе (не localhost) требует **HTTPS**. Варианты:

**Вариант А — ngrok (проще всего):**
```bash
npm run dev
ngrok http 5173
# открой https-ссылку ngrok на телефоне
```

**Вариант Б — mkcert (локальный валидный сертификат):**
```bash
mkcert -install
mkcert 192.168.1.119 localhost
# добавь в vite.config.js: server.https = { key, cert }
```
Затем открой `https://<твой-IP>:5173` на телефоне в той же Wi-Fi сети.

## Чек-лист проверки (Фаза 1)
- [ ] Экран приветствия рендерится без ошибок в консоли
- [ ] Клик «Разрешить микрофон» открывает запрос доступа
- [ ] После разрешения видно живой тюнер: нота, центы, Гц, чистота
- [ ] Спетая устойчивая нота → верное название ±несколько центов
- [ ] Зелёный при попадании (±20ц), красный при промахе
- [ ] iOS Safari: микрофон стартует только после тапа, AudioContext не «suspended», нет треска
- [ ] След тона рисуется и скроллится, линии-ориентиры C2..C6 видны

## Деплой на GitHub Pages
Live: **https://a1exxx.github.io/raspevka/** · репо: github.com/A1exxx/raspevka

Pages раздаётся из ветки `gh-pages` (содержит собранный `dist/`). Передеплой после правок:
```bash
npm run build                       # base './' уже настроен для build
cd dist
: > .nojekyll                       # чтобы Pages не прятал /assets
git init -q && git symbolic-ref HEAD refs/heads/gh-pages
git add -A && git commit -q -m deploy
git push -f https://github.com/A1exxx/raspevka.git gh-pages
```
Изменения на сайте появляются через ~1 минуту (Pages пересобирает ветку).
Исходники (`main`/`master`) пушатся отдельно: `git push origin master`.
