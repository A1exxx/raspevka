// curriculum.js — учебная программа: блоки → упражнения → экзамен с чек-поинтом.
// v1 на наших собственных распевках (копирайт-чисто). Ноты музыканта добавляются позже
// как новые exId без изменения структуры. Блок открывается, когда сдан экзамен предыдущего.
import { hum3, lipTrill, sustain, fiveNoteScale, agilityRun, octaveJump, vowelChain, jumpToFifth, ladVocalise } from './exercises.js';

// Реестр «id упражнения → конструктор». id совпадает с тем, что возвращает make().
export const EX_MAKERS = {
  hum3, trill: lipTrill, sustain, scale5: fiveNoteScale, agility: agilityRun,
  jump: octaveJump, vowels: vowelChain, jump5: jumpToFifth, lad: ladVocalise,
};

// Блоки программы. items — упражнения по порядку; exam — ключевое упражнение + порог сдачи.
export const BLOCKS = [
  {
    id: 'b1', title: 'Мягкий старт', sub: 'Активация голоса и резонаторов',
    items: ['hum3', 'trill', 'sustain'],
    exam: { exId: 'hum3', pass: 0.55 },
  },
  {
    id: 'b2', title: 'Ясность гласных', sub: 'Выравнивание гласных и точность',
    items: ['vowels', 'scale5'],
    exam: { exId: 'scale5', pass: 0.6 },
  },
  {
    id: 'b3', title: 'Интонация и гибкость', sub: 'Гаммы, беглость, скачки',
    items: ['scale5', 'agility', 'jump'],
    exam: { exId: 'agility', pass: 0.55 },
  },
  {
    id: 'b4', title: 'Лад и музыкальное мышление', sub: 'Лады, атака интервалов',
    items: ['lad', 'jump5'],
    exam: { exId: 'lad', pass: 0.55 },
  },
];

/** Доступен ли блок: первый — всегда; следующий — после сдачи экзамена предыдущего. */
export function blockUnlocked(index, examsPassed) {
  if (index <= 0) return true;
  return examsPassed.includes(BLOCKS[index - 1].id);
}
