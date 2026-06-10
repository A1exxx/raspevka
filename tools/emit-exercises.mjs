// emit-exercises.mjs — выгрузка мелодий распевок в JSON для аудио-превью музыканту.
// Каждая — на ИСХОДНОЙ высоте из PDF (E4=64 и т.д.), чтобы сверка была «яблоки с яблоками».
import { vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles, jumpToFifth, vibratoWobble, timbreVocalise, timbreShift, registerArp, registerOctave, beltScale, beltOctave, articStaccato, articGroups, resistTurn, resistRun, hum3, lipTrill, fiveNoteScale, agilityRun, octaveJump, ladVocalise, vowelChain } from '../src/theory/exercises.js';
import { writeFileSync } from 'fs';

// [номер, имя файла, конструктор, исходная тоника из PDF (midi)]
const LIST = [
  ['01', 'L02-1 Calm Down Vowels', () => vowelHold(64)],
  ['02', 'L02-2 Disco Vowels', () => vowelScale(64)],
  ['03', 'L02-3 James Charles Warm Up', () => jamesCharles(64)],
  ['04', 'L02-4 High Five', () => vowelClimb(64)],
  ['05', 'L02-5 No Bubble Gum', () => vowelAgility(64)],
  ['06', 'Скачок к V (вниз)', () => jumpToFifth(64, 'ionian')],
  ['07', 'L04 Раскачка вибрато', () => vibratoWobble(71)],
  ['08', 'L05 Тёплый тон', () => timbreVocalise(64)],
  ['09', 'L05 Ровный тон на двух', () => timbreShift(62)],
  ['10', 'L06 Через регистры', () => registerArp(64)],
  ['11', 'L06 Октавная связка', () => registerOctave(64)],
  ['12', 'L07 Белтинг — гамма', () => beltScale(64)],
  ['13', 'L07 Белт — октава', () => beltOctave(64)],
  ['14', 'L08 Чёткое стаккато', () => articStaccato(76)],
  ['15', 'L08 Слоги по группам', () => articGroups(76)],
  ['16', 'L10 Стамина-фигура', () => resistTurn(64)],
  ['17', 'L10 Выносливая гамма', () => resistRun(64)],
  ['18', 'Мычание по гамме', () => hum3(64, 'ionian')],
  ['19', 'Губной тренаж brrr', () => lipTrill(64, 'ionian')],
  ['20', 'Гамма Ма-Мэ', () => fiveNoteScale(64, 'ionian')],
  ['21', 'Беглость Ма', () => agilityRun(64, 'ionian')],
  ['22', 'Октавный скачок', () => octaveJump(64)],
  ['23', 'Ладовая ЯМ (мажор)', () => ladVocalise(64, 'ionian')],
  ['24', 'Цепочка гласных', () => vowelChain(64, 'ionian')],
];

const out = LIST.map(([num, label, make]) => {
  const ex = make();
  return {
    num, label, tempo: ex.tempo,
    notes: ex.notes.map((n) => ({ midi: n.midi, beats: n.beats })),
  };
});
writeFileSync(new URL('./note-previews.json', import.meta.url), JSON.stringify(out, null, 2));
console.log('emitted', out.length, 'exercises');
