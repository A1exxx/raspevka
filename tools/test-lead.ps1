# test-lead.ps1 — проверка воронки «Урок с педагогом» → Telegram.
# Запуск: powershell -File tools\test-lead.ps1  (после заполнения src/state/lead-config.js)
# Читает token/chatId из lead-config.js и шлёт тестовую заявку. Если пришла в TG — воронка работает.
$cfg = Get-Content "$PSScriptRoot\..\src\state\lead-config.js" -Raw -Encoding utf8
$token = [regex]::Match($cfg, "token:\s*'([^']*)'").Groups[1].Value
$chat  = [regex]::Match($cfg, "chatId:\s*'([^']*)'").Groups[1].Value

if (-not $token -or -not $chat) {
  Write-Host "❌ Токен/chatId не заполнены в src/state/lead-config.js" -ForegroundColor Red
  Write-Host "   Инструкция на 2 минуты: docs/TEACHER-BOT-SETUP.md"
  exit 1
}

$body = @{
  chat_id = $chat
  text    = "🎤 ТЕСТ воронки «Распевки»`nИмя: Тест Тестович`nКонтакт: @test`nПедагог: без разницы`nГолос: Баритон · диапазон E2–E4`n— если ты видишь это сообщение, заявки доходят ✅"
} | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
  if ($res.ok) { Write-Host "✅ Тестовая заявка отправлена! Проверь Telegram. Дальше: npm run build + деплой." -ForegroundColor Green }
  else { Write-Host "❌ Telegram ответил ошибкой: $($res | ConvertTo-Json -Compress)" -ForegroundColor Red }
} catch {
  Write-Host "❌ Не получилось: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "   Проверь токен (BotFather) и chat id (getUpdates) — docs/TEACHER-BOT-SETUP.md"
}
