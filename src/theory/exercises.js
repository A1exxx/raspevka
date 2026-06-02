// exercises.js — генерация распевок/упражнений под заданный корневой тон (MIDI).
// На Фазе 2 — пара упражнений-демо. На Фазе 3 корень берётся из диапазона юзера.
//
// Модель упражнения:
//   { id, name, syllable, tempo, kind, notes: [{midi, beats}] }
// kind: 'sustain' | 'glide' | 'scale' | 'agility' | 'jump'

import { midiToHz } from './note-map.js';

const beat = (midi, beats = 1) => ({ midi, beats });

/** Долгая нота — удержание (sustain). */
export function sustain(rootMidi, beats = 8) {
  return {
    id: 'sustain', name: 'Удержание ноты', syllable: 'А', tempo: 70, kind: 'sustain',
    desc: 'Учит держать ровный стабильный звук и дыхательную опору — основа пения.',
    how: 'Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.',
    notes: [beat(rootMidi, beats)],
  };
}

/** Сирена/глиссандо — плавный подъём и спуск (как непрерывная линия). */
export function siren(rootMidi) {
  const up = [0, 3, 7, 12];
  const seq = [...up, ...up.slice(0, -1).reverse()];
  return {
    id: 'siren', name: 'Сирена', syllable: 'Нг', tempo: 80, kind: 'glide',
    desc: 'Разогревает голос и плавно соединяет нижний и верхний регистр.',
    how: 'Скользи голосом вверх и вниз плавно, как сирена, без рывков. Веди шарик за нотами.',
    notes: seq.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Пятинотная гамма вверх-вниз. */
export function fiveNoteScale(rootMidi) {
  const offs = [0, 2, 4, 5, 7, 5, 4, 2, 0];
  return {
    id: 'scale5', name: 'Гамма «Ма-Мэ»', syllable: 'Ма', tempo: 104, kind: 'scale',
    desc: 'Тренирует точность интонации — чистое попадание в каждую ступень гаммы.',
    how: 'Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.',
    notes: offs.map((o) => beat(rootMidi + o, 1)),
  };
}

/** Беглость — быстрый пассаж вверх до сексты и обратно (Vocalista «Sing on Mah»). */
export function agilityRun(rootMidi) {
  const offs = [0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0];
  return {
    id: 'agility', name: 'Беглость «Ма»', syllable: 'Ма', tempo: 138, kind: 'agility',
    desc: 'Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).',
    how: 'Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.',
    notes: offs.map((o) => beat(rootMidi + o, 0.5)),
  };
}

/** Октавный скачок вниз — координация регистров. */
export function octaveJump(rootMidi) {
  return {
    id: 'jump', name: 'Октавный скачок', syllable: 'А', tempo: 84, kind: 'jump',
    desc: 'Учит координации между нижним и верхним регистром голоса.',
    how: 'Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.',
    notes: [beat(rootMidi + 12, 2), beat(rootMidi, 2), beat(rootMidi + 12, 2), beat(rootMidi, 2)],
  };
}

/** Частоты опорных нот упражнения (для проигрывания эталона). */
export function referenceFreqs(exercise) {
  return exercise.notes.map((n) => midiToHz(n.midi));
}
