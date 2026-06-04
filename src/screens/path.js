// path.js — структурированный путь обучения (якорь подписки). Уроки идут по порядку,
// следующий открывается после прохождения предыдущего. Запуск самого урока делегируется
// в main (onRun), т.к. там собраны все экраны (дыхание/упражнение/песня).

export const PATH = [
  { id: 'p1', label: 'Дыхание: квадрат', sub: '4-4-4-4, успокоить дыхание', type: 'breath', key: 'box' },
  { id: 'p2', label: 'Дыхание животом', sub: 'опора — основа звука', type: 'breath', key: 'belly' },
  { id: 'p3', label: 'Мычание по гамме', sub: '«М» — мягкая активация', type: 'ex', key: 0 },
  { id: 'p4', label: 'Губной тренаж «бррр»', sub: 'снять зажим', type: 'ex', key: 1 },
  { id: 'p5', label: 'Гамма «Ма-Мэ»', sub: 'точная интонация', type: 'ex', key: 3 },
  { id: 'p6', label: 'Беглость «Ма»', sub: 'подвижность голоса', type: 'ex', key: 4 },
  { id: 'p7', label: 'Октавный скачок', sub: 'координация регистров', type: 'ex', key: 5 },
  { id: 'p8', label: 'Песня «Лесенка»', sub: 'применяем навыки', type: 'song', key: 0 },
];

export function renderPath(app, { onExit, onRun, completed }) {
  const done = new Set(completed || []);
  // первый невыполненный = текущий; всё после него — закрыто
  let curIdx = PATH.findIndex((l) => !done.has(l.id));
  if (curIdx === -1) curIdx = PATH.length; // всё пройдено

  const nodes = PATH.map((l, i) => {
    const state = done.has(l.id) ? 'done' : (i === curIdx ? 'now' : 'lock');
    const mark = state === 'done' ? '✓' : (state === 'lock' ? '' : String(i + 1));
    return `
      <button class="path-node ${state}" data-lesson="${l.id}" ${state === 'lock' ? 'disabled' : ''}>
        <span class="pn-dot">${state === 'lock' ? lockIcon() : mark}</span>
        <span class="pn-body"><span class="pn-main">${l.label}</span><span class="pn-sub">${l.sub}</span></span>
      </button>`;
  }).join('');

  const progressPct = Math.round((done.size / PATH.length) * 100);

  app.innerHTML = `
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Путь обучения</h1><p>Шаг за шагом: от дыхания к песне. Открывай следующий, пройдя предыдущий.</p></div>
      <div class="path-progress"><i style="width:${progressPct}%"></i></div>
      <div class="path-meta">${done.size} из ${PATH.length} пройдено${curIdx >= PATH.length ? ' · путь завершён!' : ''}</div>
      <div class="path-list">${nodes}</div>
    </div>`;

  document.getElementById('back').addEventListener('click', onExit);
  app.querySelectorAll('[data-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lesson = PATH.find((l) => l.id === btn.dataset.lesson);
      if (lesson) onRun(lesson);
    });
  });
}

function lockIcon() {
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
}
