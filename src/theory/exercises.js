// exercises.js — генерация распевок/упражнений под заданный корневой тон (MIDI).
//
// Модель упражнения:
//   { id, name, syllable, tempo, kind, root, notes: [{midi, beats}] }
// root — тоника (для аккорда-подсказки в начале).
// kind: 'sustain' | 'glide' | 'scale' | 'agility' | 'jump' | 'hum' | 'trill'

import { midiToHz } from './note-map.js';
import { degreesToSemitones } from './modes.js';

const beat = (midi, beats = 1) => ({ midi, beats });

// === Распевки на гласных из урока L02 (точная транскрипция нот по PDF, не ладозависимы) ===
// Смещения — полутоны от тоники (первая нота = 0). Движок транспонирует тонику под голос.

/** Calm Down Vowels (L02 #1) — унификация: гласные на E, затем выше на G (полная строка, 4 такта). */
export function vowelHold(rootMidi) {
  const offs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
  return {
    id: 'vhold', name: 'Calm Down Vowels', syllable: 'И-Э-А-О-У', tempo: 78, kind: 'vowel', root: rootMidi, grooveStyle: 'soft',
    greenCents: 25,
    desc: 'Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».',
    how: 'Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала ниже, потом строка повторяется выше — позиция единая.',
    notes: offs.map((o, i) => beat(rootMidi + o, i < 10 ? 0.5 : 0.25)),
  };
}

/** Disco Vowels (L02 #2) — точность высоты: на каждой гласной слиг из двух нот. */
export function vowelScale(rootMidi) {
  const offs = [0, 1, 5, 7, 8, 7, 5, 1, 7, 5];
  return {
    id: 'vscale', name: 'Disco Vowels', syllable: 'И-Э-А-О-У', tempo: 124, kind: 'scale', root: rootMidi, grooveStyle: 'pop',
    desc: 'Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.',
    how: 'Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.',
    notes: offs.map((o) => beat(rootMidi + o, 0.75)),
  };
}

/** No Bubble Gum (L02 #5) — беглость: зигзаг-гамма вверх (точная транскрипция). */
export function vowelAgility(rootMidi) {
  const offs = [0, 3, 1, 5, 3, 7, 5, 8, 7, 3, 5, 1, 0];
  return {
    id: 'vagil', name: 'No Bubble Gum', syllable: 'И-Э-И-А-И-О-И-У', tempo: 100, kind: 'agility', root: rootMidi, grooveStyle: 'funk',
    desc: 'Беглость и точность: зигзаг по ступеням вверх и обратно.',
    how: 'Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** High Five (L02 #4) — гибкость: скачки на квинту (E↔B) ×5, затем гамма вверх. */
export function vowelClimb(rootMidi) {
  const offs = [0, 7, 0, 7, 0, 7, 0, 7, 0, 7, 0, 1, 3, 5, 7];
  return {
    id: 'vclimb', name: 'High Five', syllable: 'И-Э-А-О-У', tempo: 82, kind: 'jump', root: rootMidi, grooveStyle: 'soft',
    desc: 'Гибкость и точность интервала: чистые скачки на квинту, затем ровная гамма.',
    how: 'Чисто бери скачок на квинту вверх и обратно (без зажима), в конце — ровная гамма вверх. Опора дыханием.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** James Charles Warm Up (L02 #3) — гибкость: (И-Э-А)×3, затем спуск (точная транскрипция). */
export function jamesCharles(rootMidi) {
  const offs = [0, 1, 5, 0, 1, 5, 0, 1, 5, 8, 8, 7, 5, 1];
  return {
    id: 'jcharles', name: 'James Charles Warm Up', syllable: 'И-Э-А-О-У', tempo: 130, kind: 'agility', root: rootMidi, grooveStyle: 'swing',
    desc: 'Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.',
    how: 'Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
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

/** Скачок к V ступени (ВНИЗ) I-I-III-II-I-I-V(низ)-I-I-III-II-I — атака интервала вниз (по правке музыканта). Ладозависим. */
export function jumpToFifth(rootMidi, modeKey = 'ionian') {
  // -2 ступень = V снизу (нижняя квинта/доминанта под тоникой) — скачок ВНИЗ, не вверх
  const offs = degreesToSemitones([1, 1, 3, 2, 1, 1, -2, 1, 1, 3, 2, 1], modeKey);
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

// === Распевки из уроков L04–L10 (ноты сняты программно по PDF, смещения в полутонах от тоники,
//     НЕ ладозависимы — та же конвенция, что у гласных L02). ===

/** Раскачка вибрато (L04) — лёгкое колебание высоты, переходящее в вибрато. */
export function vibratoWobble(rootMidi) {
  const offs = [0, 1, 0, 1, 0, 1, 0, 5, 6, 5, 6, 5, 6, 5];
  return {
    id: 'vwobble', name: 'Раскачка вибрато', syllable: 'А', tempo: 120, kind: 'vibrato', root: rootMidi, grooveStyle: 'soft', greenCents: 55,
    desc: 'Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.',
    how: 'Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Тёплый тон (L05) — выравнивание тембра по короткому мотиву и гамме. */
export function timbreVocalise(rootMidi) {
  const offs = [0, 1, 3, 0, 1, 3, 1, 0, 0, 1, 3, 5, 7, 5];
  return {
    id: 'timbre', name: 'Тёплый тон', syllable: 'Мо', tempo: 96, kind: 'scale', root: rootMidi, grooveStyle: 'ballad',
    desc: 'Качество тембра: ровный, округлый звук при движении голоса по нотам.',
    how: 'Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Опора тембра на двух звуках (L05) — ровность при смене высоты на кварту. */
export function timbreShift(rootMidi) {
  const offs = [0, 0, 0, -5, -5, 0, 0, -5, -5];
  return {
    id: 'timbre2', name: 'Ровный тон на двух', syllable: 'А', tempo: 80, kind: 'sustain', root: rootMidi, grooveStyle: 'ballad',
    desc: 'Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).',
    how: 'Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Арпеджио через регистры (L06) — соединение грудного/головного через опорные тоны. */
export function registerArp(rootMidi) {
  const offs = [0, 3, 0, 7, 0, 12, 0, 7, 0, 3];
  return {
    id: 'regarp', name: 'Через регистры', syllable: 'Но', tempo: 92, kind: 'jump', root: rootMidi, grooveStyle: 'soft',
    desc: 'Плавный переход (passaggio): соединяем нижний и верхний регистр через опорные тоны аккорда.',
    how: 'Пой «Но», возвращаясь к тонике и беря всё выше (терция → квинта → октава). Без «слома» на переходе — мягко.',
    notes: offs.map((o) => beat(rootMidi + o, 0.6)),
  };
}

/** Октавная связка (L06) — ровный переход через регистровый «мост». */
export function registerOctave(rootMidi) {
  const offs = [0, 12, 0, 12];
  return {
    id: 'regoct', name: 'Октавная связка', syllable: 'А', tempo: 76, kind: 'jump', root: rootMidi, grooveStyle: 'soft',
    desc: 'Связка регистров на октаве — без резкого «переключения» голоса.',
    how: 'Спокойно прыгай на октаву вверх и обратно, целься в центр ноты. Верх не криком, а на опоре и резонансе.',
    notes: offs.map((o) => beat(rootMidi + o, 1.5)),
  };
}

/** Белтинг — 5-нотная гамма (L07), яркая опёртая подача. */
export function beltScale(rootMidi) {
  const offs = [0, 1, 3, 5, 7, 5, 3, 1, 0];
  return {
    id: 'belt', name: 'Белтинг — гамма', syllable: 'Эй', tempo: 112, kind: 'scale', root: rootMidi, grooveStyle: 'drive',
    desc: 'Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.',
    how: 'Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.',
    notes: offs.map((o) => beat(rootMidi + o, 0.6)),
  };
}

/** Октавный белт (L07) — мощная атака верха через октаву. */
export function beltOctave(rootMidi) {
  const offs = [0, 12, 0, 12, 0, 12, 0];
  return {
    id: 'beltoct', name: 'Белт — октава', syllable: 'Эй', tempo: 100, kind: 'jump', root: rootMidi, grooveStyle: 'drive',
    desc: 'Опёртая атака верхней ноты через октаву — энергично и безопасно.',
    how: 'Бери октаву вверх ярко и точно, на опоре. Не тянись горлом — звук на дыхании и в резонаторах.',
    notes: offs.map((o) => beat(rootMidi + o, 0.8)),
  };
}

/** Артикуляция — стаккато на одной ноте (L08), чёткие согласные. */
export function articStaccato(rootMidi) {
  const offs = [0, 0, 0, 0, 0, 0, 0, 0];
  return {
    id: 'artic', name: 'Чёткое стаккато', syllable: 'Та', tempo: 132, kind: 'agility', root: rootMidi, grooveStyle: 'funk',
    desc: 'Чёткая артикуляция и точная атака: одна нота, быстрые ясные слоги.',
    how: 'Пой «Та-Та-Та» коротко и чётко на одной высоте. Согласная ясная, гласная ровная, звук не «расползается».',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Артикуляция группами (L08) — слоги на двух высотах (вниз на кварту). */
export function articGroups(rootMidi) {
  const offs = [0, 0, 0, -5, -5, -5, 0, 0, 0, -5, -5, -5];
  return {
    id: 'artic2', name: 'Слоги по группам', syllable: 'Та-Ка', tempo: 120, kind: 'agility', root: rootMidi, grooveStyle: 'funk',
    desc: 'Дикция при смене высоты: чёткие слоги группами на двух нотах.',
    how: 'Пой «Та-Ка-Та» группами, чисто меняя высоту вниз и обратно. Каждый слог ясный, ритм ровный.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Сопротивление — фигура-стамина (L10), повтор устойчивого мотива. */
export function resistTurn(rootMidi) {
  const offs = [0, 1, 3, 1, 0, 1, 3, 1, 0, 1, 3, 1, 0];
  return {
    id: 'resist', name: 'Стамина-фигура', syllable: 'Ма', tempo: 116, kind: 'agility', root: rootMidi, grooveStyle: 'march',
    desc: 'Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.',
    how: 'Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Сопротивление — выносливая гамма (L10), длинный пробег. */
export function resistRun(rootMidi) {
  const offs = [0, 1, 3, 5, 7, 5, 3, 1, 0, 1, 3, 5, 7, 5, 3, 1, 0];
  return {
    id: 'resist2', name: 'Выносливая гамма', syllable: 'Ма', tempo: 126, kind: 'agility', root: rootMidi, grooveStyle: 'march',
    desc: 'Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.',
    how: 'Пой «Ма» по гамме вверх-вниз дважды на одном дыхании, ровно и точно. Распредели воздух до конца.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
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
