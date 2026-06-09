// exercises.js — генерация распевок/упражнений под заданный корневой тон (MIDI).
//
// Модель упражнения:
//   { id, name, syllable, tempo, kind, root, notes: [{midi, beats}] }
// root — тоника (для аккорда-подсказки в начале).
// kind: 'sustain' | 'glide' | 'scale' | 'agility' | 'jump' | 'hum' | 'trill'

import { midiToHz } from './note-map.js';
import { degreesToSemitones } from './modes.js';

const beat = (midi, beats = 1) => ({ midi, beats });

/** Гласные на одной ноте — унификация: держим высоту, меняем только гласную. */
export function vowelHold(rootMidi) {
  return {
    id: 'vhold', name: 'Гласные на одной ноте', syllable: 'И-Э-А-О-У', tempo: 76, kind: 'vowel', root: rootMidi, grooveStyle: 'soft',
    greenCents: 25,
    desc: 'Унификация гласных: высота одна, меняется только гласная — позиция остаётся единой.',
    how: 'Пой ровно на ОДНОЙ ноте, меняя «И-Э-А-О-У». Не «прыгай» голосом при смене гласной — рот шире, звук в одной точке.',
    notes: [1, 1, 1, 1, 1].map(() => beat(rootMidi, 1)),
  };
}

/** Гласные по гамме — пять ступеней вверх, на каждой своя гласная. Ладозависима. */
export function vowelScale(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 4, 5], modeKey);
  return {
    id: 'vscale', name: 'Гласные по гамме', syllable: 'И-Э-А-О-У', tempo: 96, kind: 'scale', root: rootMidi, modeKey, grooveStyle: 'pop',
    desc: 'Точность высоты при смене гласной: каждая ступень — своя гласная.',
    how: 'Поднимайся по ступеням, на каждой — новая гласная «И-Э-А-О-У». Попадай точно и держи единую позицию.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Гласные с возвратом — гибкость: тоника чередуется со ступенями, затем гамма вверх
 *  (рисунок из урока «vowel placement, pitch precision and vocal agility»). Ладозависима. */
export function vowelAgility(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 1, 3, 1, 4, 1, 5, 1, 2, 3, 4, 5], modeKey);
  return {
    id: 'vagil', name: 'Гласные с возвратом', syllable: 'И-Э-И-А-И-О-И-У-И-Э-А-О-У', tempo: 120, kind: 'agility', root: rootMidi, modeKey, grooveStyle: 'funk',
    desc: 'Гибкость и точность: быстрый возврат к тонике между ступенями, затем гамма вверх.',
    how: 'Лёгко и быстро: «И» — ступень — «И» — выше ступень, в конце ровная гамма вверх. Не зажимайся, гласные чёткие.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Гласные ввысь — гибкость и опора: гласные ведут голос вверх к удержанной вершине
 *  (рисунок из «vowel flexibility and placement»). Ладозависима. */
export function vowelClimb(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 4, 5, 5], modeKey);
  return {
    id: 'vclimb', name: 'Гласные ввысь', syllable: 'И-Э-А-О-У', tempo: 88, kind: 'scale', root: rootMidi, modeKey, grooveStyle: 'soft',
    desc: 'Гибкость и опора при подъёме: гласные ведут голос вверх к удержанной вершине.',
    how: 'Веди «И-Э-А-О-У» вверх плавными бросками, на верхней «У» задержись и держи ровно. Не дави — поддержи дыханием.',
    notes: offs.map((o, i) => beat(rootMidi + o, i >= 5 ? 2 : 1)),
  };
}

/** Цепочка гласных (трихорд) I-II-III-II-I — выравнивание гласных (по ТЗ Игоря). Ладозависима. */
export function vowelChain(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 2, 1], modeKey);
  return {
    id: 'vowels', name: 'Цепочка гласных', syllable: 'Ми-Ме-Ма', tempo: 90, kind: 'scale', root: rootMidi, modeKey, grooveStyle: 'swing',
    desc: 'Выравнивание гласных и сохранение позиции при смене звука.',
    how: 'Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Скачок к V ступени I-I-III-II-I-I-V-I-I-III-II-I — точная атака интервала (по ТЗ Игоря). Ладозависим. */
export function jumpToFifth(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 1, 3, 2, 1, 1, 5, 1, 1, 3, 2, 1], modeKey);
  return {
    id: 'jump5', name: 'Скачок к V ступени', syllable: 'Ям', tempo: 100, kind: 'jump', root: rootMidi, modeKey, grooveStyle: 'latin',
    desc: 'Точная атака интервалов и контроль регистра при скачках.',
    how: 'Пой на «Ям». Перед скачком на квинту не зажимайся — целься точно в ноту.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Ладовая вокализация «ЯМ» (7 ступеней вверх-вниз) в выбранном ЛАДУ (по ТЗ Игоря). */
export function ladVocalise(rootMidi, modeKey = 'ionian') {
  const degrees = [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1];
  const offs = degreesToSemitones(degrees, modeKey);
  return {
    id: 'lad', name: 'Ладовая «ЯМ»', syllable: 'Ям', tempo: 100, kind: 'scale', root: rootMidi, modeKey, drone: true, grooveStyle: 'march',
    desc: 'Слух и ощущение ладовой окраски — гамма лада вверх и вниз.',
    how: 'Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Долгая нота — удержание (sustain). */
export function sustain(rootMidi, beats = 8) {
  return {
    id: 'sustain', name: 'Удержание ноты', syllable: 'А', tempo: 70, kind: 'sustain', root: rootMidi, grooveStyle: 'ballad',
    desc: 'Учит держать ровный стабильный звук и дыхательную опору — основа пения.',
    how: 'Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.',
    notes: [beat(rootMidi, beats)],
  };
}

/** Вибрато — ровный звук, затем мягкое колебание высоты ~5–6 раз/сек.
 *  Зелёная зона расширена: само колебание (±50ц) не штрафуется; качество вибрато
 *  показывает чип «вибрато» на итоге (скоринг вибрато уже считает ровность/частоту). */
export function vibratoHold(rootMidi) {
  return {
    id: 'vibrato', name: 'Вибрато', syllable: 'А', tempo: 60, kind: 'vibrato', root: rootMidi, grooveStyle: 'ballad',
    greenCents: 55, yellowCents: 95,
    desc: 'Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.',
    how: 'Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.',
    notes: [beat(rootMidi, 10)],
  };
}

/** Сирена/глиссандо — плавный подъём и спуск (как непрерывная линия). */
export function siren(rootMidi) {
  const up = [0, 3, 7, 12];
  const seq = [...up, ...up.slice(0, -1).reverse()];
  return {
    id: 'siren', name: 'Сирена', syllable: 'Нг', tempo: 80, kind: 'glide', root: rootMidi,
    desc: 'Разогревает голос и плавно соединяет нижний и верхний регистр.',
    how: 'Скользи голосом вверх и вниз плавно, как сирена, без рывков. Веди шарик за нотами.',
    notes: seq.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Пятинотная гамма вверх-вниз. Ладозависима. */
export function fiveNoteScale(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 4, 5, 4, 3, 2, 1], modeKey);
  return {
    id: 'scale5', name: 'Гамма «Ма-Мэ»', syllable: 'Ма', tempo: 104, kind: 'scale', root: rootMidi, modeKey, grooveStyle: 'pop',
    desc: 'Тренирует точность интонации — чистое попадание в каждую ступень гаммы.',
    how: 'Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Беглость — быстрый пассаж вверх до сексты и обратно (Vocalista «Sing on Mah»). Ладозависима. */
export function agilityRun(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1], modeKey);
  return {
    id: 'agility', name: 'Беглость «Ма»', syllable: 'Ма', tempo: 138, kind: 'agility', root: rootMidi, modeKey, grooveStyle: 'funk',
    desc: 'Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).',
    how: 'Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Октавный скачок — координация регистров. */
export function octaveJump(rootMidi) {
  return {
    id: 'jump', name: 'Октавный скачок', syllable: 'А', tempo: 84, kind: 'jump', root: rootMidi, grooveStyle: 'drive',
    desc: 'Учит координации между нижним и верхним регистром голоса.',
    how: 'Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.',
    notes: [beat(rootMidi + 12, 2), beat(rootMidi, 2), beat(rootMidi + 12, 2), beat(rootMidi, 2)],
  };
}

/** Мычание по гамме: I-II-III-II-I на «М». Ладозависимо. */
export function hum3(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 2, 1], modeKey);
  return {
    id: 'hum3', name: 'Мычание по гамме', syllable: 'М', tempo: 92, kind: 'hum', root: rootMidi, modeKey, grooveStyle: 'soft',
    desc: 'Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.',
    how: 'Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Губной тренаж «brrr» (или «Р»): I-II-III-IV-V-IV-III-II-I, затем скачок V-I. Ладозависим. */
export function lipTrill(rootMidi, modeKey = 'ionian') {
  const offs = degreesToSemitones([1, 2, 3, 4, 5, 4, 3, 2, 1, 5, 1], modeKey);
  return {
    id: 'trill', name: 'Губной тренаж «brrr»', syllable: 'brrr', tempo: 120, kind: 'trill', root: rootMidi, modeKey, grooveStyle: 'drive',
    desc: 'Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.',
    how: 'Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.',
    notes: offs.map((o) => beat(rootMidi + o, 0.75)),
  };
}

/** Частоты опорных нот упражнения (для проигрывания эталона). */
export function referenceFreqs(exercise) {
  return exercise.notes.map((n) => midiToHz(n.midi));
}

/**
 * План транспозиций для повторов: вверх по полутону до верха диапазона, затем вниз.
 * Возвращает массив смещений в полутонах, напр. [0,1,2,1,0,-1,-2]. maxEach ограничивает
 * число шагов в каждую сторону, чтобы сессия не была бесконечной.
 */
export function transposePlan(exercise, rangeLow, rangeHigh, maxEach = 4) {
  const mids = exercise.notes.map((n) => n.midi);
  const lo = Math.min(...mids), hi = Math.max(...mids);
  if (!Number.isFinite(rangeLow) || !Number.isFinite(rangeHigh)) return [0];
  const up = Math.max(0, Math.min(maxEach, rangeHigh - hi));
  const down = Math.max(0, Math.min(maxEach, lo - rangeLow));
  const plan = [];
  for (let s = 0; s <= up; s++) plan.push(s);          // вверх до верха
  for (let s = up - 1; s >= -down; s--) plan.push(s);  // вниз через 0 до низа
  return plan.length ? plan : [0];
}
