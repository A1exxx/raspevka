// make-sverka.mjs — страница сверки нот для музыканта (вместо зипов в телеграме).
// Берёт tools/note-previews.json, копирует свежие MP3 из docs/note-previews в
// public/sverka/NN.mp3 и генерирует public/sverka.html: плеер + «Ок / Не так» +
// комментарий по каждой распевке, ответы копируются одной кнопкой.
// Запуск: node tools/make-sverka.mjs  (затем обычный build+deploy)
import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'docs', 'note-previews');
const OUT = join(HERE, '..', 'public', 'sverka');
mkdirSync(OUT, { recursive: true });

const list = JSON.parse(readFileSync(join(HERE, 'note-previews.json'), 'utf8'));

// Свежий MP3 на каждый номер (после переименований в папке могут лежать старые дубли).
const files = readdirSync(SRC).filter((f) => f.endsWith('.mp3'));
for (const ex of list) {
  const candidates = files.filter((f) => f.startsWith(ex.num + '_'));
  if (!candidates.length) { console.error('!! нет MP3 для', ex.num); continue; }
  const newest = candidates
    .map((f) => ({ f, t: statSync(join(SRC, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0].f;
  copyFileSync(join(SRC, newest), join(OUT, ex.num + '.mp3'));
}

const items = list.map((ex) => `
  <div class="item" data-num="${ex.num}">
    <div class="head"><span class="num">${ex.num}</span><span class="name">${ex.label}</span></div>
    <audio controls preload="none" src="sverka/${ex.num}.mp3"></audio>
    <div class="verdict">
      <button class="vb ok" data-v="ok">Ок ✓</button>
      <button class="vb bad" data-v="bad">Не так</button>
    </div>
    <textarea class="note" placeholder="что именно не так: выше/ниже, ритм, темп, фигура…" hidden></textarea>
  </div>`).join('');

const html = `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Сверка распевок — Распевка</title>
<style>
  :root { --bg:#f6f8f9; --card:#fff; --line:#e3e8ec; --text:#1b2430; --dim:#5e6b7a;
          --acc:#0e8d7f; --gold:#c4880a; --coral:#e0544b; }
  * { box-sizing:border-box; margin:0; }
  body { font:16px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; background:var(--bg); color:var(--text); padding:18px 14px 110px; }
  .wrap { max-width:560px; margin:0 auto; }
  h1 { font-size:22px; margin-bottom:4px; }
  .sub { color:var(--dim); font-size:14px; margin-bottom:18px; }
  .item { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px; margin-bottom:12px; }
  .head { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .num { font-weight:800; color:var(--acc); font-variant-numeric:tabular-nums; }
  .name { font-weight:700; }
  audio { width:100%; height:38px; margin-bottom:10px; }
  .verdict { display:flex; gap:8px; }
  .vb { flex:1; padding:10px; border-radius:10px; border:1px solid var(--line); background:#fff; font:600 14px inherit; cursor:pointer; }
  .vb.ok.on { background:#e7f6ef; border-color:var(--acc); color:var(--acc); }
  .vb.bad.on { background:#fdeeed; border-color:var(--coral); color:var(--coral); }
  .note { width:100%; margin-top:10px; padding:10px; border:1px solid var(--line); border-radius:10px; font:inherit; min-height:64px; }
  .bar { position:fixed; left:0; right:0; bottom:0; background:#fff; border-top:1px solid var(--line);
         padding:12px 14px calc(12px + env(safe-area-inset-bottom)); display:flex; gap:10px; }
  .bar button { flex:1; padding:13px; border-radius:12px; border:none; font:700 15px inherit; cursor:pointer; }
  #copy { background:var(--acc); color:#fff; }
  #share { background:#eef2f4; color:var(--text); }
  .done-chip { color:var(--dim); font-size:13px; text-align:center; padding-top:6px; }
</style></head>
<body><div class="wrap">
  <h1>Сверка распевок</h1>
  <p class="sub">Слушай по порядку и отмечай: «Ок» или «Не так» (+ что именно).
  Ответы сохраняются на этой странице — в конце нажми «Скопировать» и пришли текст.</p>
  ${items}
  <p class="done-chip" id="progress"></p>
</div>
<div class="bar">
  <button id="share">Поделиться</button>
  <button id="copy">Скопировать ответы</button>
</div>
<script>
  const KEY = 'sverka.v1';
  const state = JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const items = [...document.querySelectorAll('.item')];
  function renderItem(el) {
    const num = el.dataset.num, st = state[num] || {};
    el.querySelector('.ok').classList.toggle('on', st.v === 'ok');
    el.querySelector('.bad').classList.toggle('on', st.v === 'bad');
    const note = el.querySelector('.note');
    note.hidden = st.v !== 'bad';
    if (note.value !== (st.note || '')) note.value = st.note || '';
  }
  function renderProgress() {
    const done = items.filter((el) => state[el.dataset.num] && state[el.dataset.num].v).length;
    document.getElementById('progress').textContent = 'Отмечено ' + done + ' из ' + items.length;
  }
  items.forEach((el) => {
    const num = el.dataset.num;
    el.querySelectorAll('.vb').forEach((b) => b.addEventListener('click', () => {
      state[num] = state[num] || {};
      state[num].v = b.dataset.v;
      save(); renderItem(el); renderProgress();
    }));
    el.querySelector('.note').addEventListener('input', (e) => {
      state[num] = state[num] || {};
      state[num].note = e.target.value;
      save();
    });
    renderItem(el);
  });
  renderProgress();
  function answersText() {
    return items.map((el) => {
      const num = el.dataset.num, st = state[num] || {};
      if (st.v === 'ok') return num + ' — ок';
      if (st.v === 'bad') return num + ' — не так' + (st.note ? ': ' + st.note.trim() : '');
      return num + ' — (не отмечено)';
    }).join('\\n');
  }
  document.getElementById('copy').addEventListener('click', async () => {
    const t = answersText();
    try { await navigator.clipboard.writeText(t); document.getElementById('copy').textContent = 'Скопировано ✓'; }
    catch (e) { prompt('Скопируй вручную:', t); }
    setTimeout(() => { document.getElementById('copy').textContent = 'Скопировать ответы'; }, 1800);
  });
  document.getElementById('share').addEventListener('click', () => {
    const t = answersText();
    if (navigator.share) navigator.share({ text: t }).catch(() => {});
    else prompt('Скопируй вручную:', t);
  });
</script></body></html>`;

writeFileSync(join(HERE, '..', 'public', 'sverka.html'), html);
console.log('sverka.html + MP3 ×' + list.length + ' готовы');
