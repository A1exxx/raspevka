// curriculum.js — учебная программа: блоки → упражнения → экзамен с чек-поинтом.
// v1 на наших собственных распевках (копирайт-чисто). Ноты музыканта добавляются позже
// как новые exId без изменения структуры. Блок открывается, когда сдан экзамен предыдущего.
import { hum3, lipTrill, sustain, fiveNoteScale, agilityRun, octaveJump, vowelChain, jumpToFifth, ladVocalise, vibratoHold, vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles, vibratoWobble, timbreVocalise, timbreShift, registerArp, registerOctave, beltScale, beltOctave, articStaccato, articGroups, resistTurn, resistRun } from './exercises.js';

// Реестр «id упражнения → конструктор». id совпадает с тем, что возвращает make().
export const EX_MAKERS = {
  hum3, trill: lipTrill, sustain, scale5: fiveNoteScale, agility: agilityRun,
  jump: octaveJump, vowels: vowelChain, jump5: jumpToFifth, lad: ladVocalise, vibrato: vibratoHold,
  vhold: vowelHold, vscale: vowelScale, vagil: vowelAgility, vclimb: vowelClimb, jcharles: jamesCharles,
  // L04–L10 (ноты сняты программно из PDF)
  vwobble: vibratoWobble, timbre: timbreVocalise, timbre2: timbreShift,
  regarp: registerArp, regoct: registerOctave, belt: beltScale, beltoct: beltOctave,
  artic: articStaccato, artic2: articGroups, resist: resistTurn, resist2: resistRun,
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
    items: [ex('sustain', 'Удержание ноты'), ex('vwobble', 'Раскачка вибрато'), ex('vibrato', 'Вибрато')],
    exam: { exId: 'vibrato', pass: 0.5 },
  },
  {
    id: 'b6', title: 'Тембр и тон', sub: 'Округлый, ровный звук',
    items: [ex('timbre', 'Тёплый тон'), ex('timbre2', 'Ровный тон на двух')],
    exam: { exId: 'timbre', pass: 0.55 },
  },
  {
    id: 'b7', title: 'Регистры и переходы', sub: 'Грудной/головной, passaggio',
    items: [ex('regarp', 'Через регистры'), ex('regoct', 'Октавная связка')],
    exam: { exId: 'regarp', pass: 0.5 },
  },
  {
    id: 'b8', title: 'Белтинг', sub: 'Яркая опёртая подача верха',
    items: [ex('belt', 'Белтинг — гамма'), ex('beltoct', 'Белт — октава')],
    exam: { exId: 'belt', pass: 0.55 },
  },
  {
    id: 'b9', title: 'Артикуляция', sub: 'Чёткая дикция и атака',
    items: [ex('artic', 'Чёткое стаккато'), ex('artic2', 'Слоги по группам')],
    exam: { exId: 'artic', pass: 0.6 },
  },
  {
    id: 'b10', title: 'Сопротивление', sub: 'Выносливость и опора',
    items: [ex('resist', 'Стамина-фигура'), ex('resist2', 'Выносливая гамма')],
    exam: { exId: 'resist2', pass: 0.5 },
  },
];

/** Доступен ли блок: первый — всегда; следующий — после сдачи экзамена предыдущего. */
export function blockUnlocked(index, examsPassed) {
  if (index <= 0) return true;
  return examsPassed.includes(BLOCKS[index - 1].id);
}
