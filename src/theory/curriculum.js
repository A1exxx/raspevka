// curriculum.js — учебная программа: блоки → упражнения → экзамен с чек-поинтом.
// v1 на наших собственных распевках (копирайт-чисто). Ноты музыканта добавляются позже
// как новые exId без изменения структуры. Блок открывается, когда сдан экзамен предыдущего.
import { hum3, lipTrill, sustain, fiveNoteScale, agilityRun, octaveJump, vowelChain, jumpToFifth, ladVocalise, vibratoHold, vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles } from './exercises.js';

// Реестр «id упражнения → конструктор». id совпадает с тем, что возвращает make().
export const EX_MAKERS = {
  hum3, trill: lipTrill, sustain, scale5: fiveNoteScale, agility: agilityRun,
  jump: octaveJump, vowels: vowelChain, jump5: jumpToFifth, lad: ladVocalise, vibrato: vibratoHold,
  vhold: vowelHold, vscale: vowelScale, vagil: vowelAgility, vclimb: vowelClimb, jcharles: jamesCharles,
};

// Блоки программы. items — шаги по порядку (дыхание + распевки); exam — ключевое
// упражнение + порог сдачи. item: { t:'breath'|'ex', id, name }.
const ex = (id, name) => ({ t: 'ex', id, name });
const breath = (id, name) => ({ t: 'breath', id, name });

export const BLOCKS = [
  {
    id: 'b1', title: 'Базовый импульс', sub: 'Дыхание, опора, мягкая активация',
    items: [breath('belly', 'Дыхание животом'), breath('hiss', 'Долгий выдох «с-с-с»'), ex('hum3', 'Мычание по гамме'), ex('trill', 'Губной тренаж «brrr»')],
    exam: { exId: 'hum3', pass: 0.55 },
  },
  {
    id: 'b2', title: 'Ясность гласных', sub: 'Выравнивание гласных и точность',
    items: [ex('vhold', 'Calm Down Vowels'), ex('vscale', 'Disco Vowels'), ex('jcharles', 'James Charles Warm Up'), ex('vclimb', 'High Five'), ex('vagil', 'No Bubble Gum')],
    exam: { exId: 'vscale', pass: 0.6 },
  },
  {
    id: 'b3', title: 'Интонация и гибкость', sub: 'Гаммы, беглость, скачки',
    items: [ex('scale5', 'Гамма «Ма-Мэ»'), ex('agility', 'Беглость «Ма»'), ex('jump', 'Октавный скачок')],
    exam: { exId: 'agility', pass: 0.55 },
  },
  {
    id: 'b4', title: 'Лад и музыкальное мышление', sub: 'Лады, атака интервалов',
    items: [ex('lad', 'Ладовая «ЯМ»'), ex('jump5', 'Скачок к V ступени')],
    exam: { exId: 'lad', pass: 0.55 },
  },
  {
    id: 'b5', title: 'Вибрато', sub: 'Ровный звук и мягкое колебание',
    items: [ex('sustain', 'Удержание ноты'), ex('vibrato', 'Вибрато')],
    exam: { exId: 'vibrato', pass: 0.5 },
  },
];

/** Доступен ли блок: первый — всегда; следующий — после сдачи экзамена предыдущего. */
export function blockUnlocked(index, examsPassed) {
  if (index <= 0) return true;
  return examsPassed.includes(BLOCKS[index - 1].id);
}
