// catalog.js — каталог учебной программы: список блоков (с прохождением) и детали блока
// (упражнения + экзамен). Движок прогона/скоринга — общий (renderGame через колбэки main).
import { blockUnlocked } from '../theory/curriculum.js';

// CTA к педагогу — мостик в школу (перелив трафика).
function teacherCTA() {
  return `<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`;
}

export function renderCatalog(app, { blocks, examsPassed, onExit, onOpenBlock, onSchool }) {
  const done = blocks.filter((b) => examsPassed.includes(b.id)).length;
  const cards = blocks.map((b, i) => {
    const passed = examsPassed.includes(b.id);
    const unlocked = blockUnlocked(i, examsPassed);
    const state = passed ? 'done' : unlocked ? 'open' : 'locked';
    const badge = passed ? '✓' : unlocked ? `${i + 1}` : '🔒';
    return `<button class="block-card ${state}" data-block="${i}" ${unlocked ? '' : 'disabled'}>
        <span class="bc-badge">${badge}</span>
        <span class="bc-main"><b>${b.title}</b><span class="bc-sub">${b.sub}</span></span>
        <span class="bc-arrow">${unlocked ? '›' : ''}</span>
      </button>`;
  }).join('');

  app.innerHTML = `
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round((done / blocks.length) * 100)}%"></i></div><span class="prog-txt">${done} / ${blocks.length} блоков пройдено</span></div>
      <div class="block-list">${cards}</div>
      ${teacherCTA()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  app.querySelectorAll('[data-block]').forEach((btn) => btn.addEventListener('click', () => onOpenBlock(Number(btn.dataset.block))));
  const s = document.getElementById('toSchool');
  if (s && onSchool) s.addEventListener('click', onSchool);
}

export function renderBlockDetail(app, { block, index, examsPassed, doneItems, onExit, onRunItem, onExam, onSchool }) {
  const passed = examsPassed.includes(block.id);
  const items = block.items.map((it, k) => {
    const done = doneItems.includes(it.id);
    const tag = it.t === 'breath' ? '<span class="bi-tag">дыхание</span>' : '';
    return `<button class="block-item" data-item="${k}">
        <span class="bi-check ${done ? 'on' : ''}">${done ? '✓' : k + 1}</span>
        <span class="bi-name">${it.name}${tag}</span>
        <span class="bc-arrow">›</span>
      </button>`;
  }).join('');
  const allDone = block.items.every((it) => doneItems.includes(it.id));

  app.innerHTML = `
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${block.title}</h1><p>${block.sub}</p></div>
      <div class="block-list">${items}</div>
      <button class="btn ${allDone ? 'btn-primary' : 'btn-ghost'}" id="exam" style="width:100%;margin-top:6px">
        ${passed ? '✓ Экзамен сдан · пересдать' : 'Экзамен блока'}
      </button>
      <p class="hint">${allDone ? 'Все упражнения пройдены — можно сдавать экзамен.' : 'Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее.'}</p>
      ${teacherCTA()}
    </div>
  `;
  document.getElementById('back').addEventListener('click', onExit);
  app.querySelectorAll('[data-item]').forEach((btn) => btn.addEventListener('click', () => onRunItem(block, Number(btn.dataset.item))));
  document.getElementById('exam').addEventListener('click', () => onExam(block));
  const s = document.getElementById('toSchool');
  if (s && onSchool) s.addEventListener('click', onSchool);
}
