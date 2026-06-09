import { hzToNoteInfo, midiToHz, centsOff, centsZone, hzToY, noteToHz } from '../src/theory/note-map.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump, referenceFreqs, hum3, lipTrill, transposePlan, vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles, jumpToFifth, vibratoHold, vibratoWobble, timbreVocalise, timbreShift, registerArp, registerOctave, beltScale, beltOctave, articStaccato, articGroups, resistTurn, resistRun } from '../src/theory/exercises.js';
import { Scorer } from '../src/game/scoring.js';
import { classifyVoice, getVoiceType, VOICE_TYPES } from '../src/theory/voice-types.js';
import { RHYTHM } from '../src/screens/rhythm.js';
import { miniKeyboard } from '../src/ui/illustrations.js';
import { getMode, modeUnlocked, degreeToSemitone, degreesToSemitones } from '../src/theory/modes.js';
import { findEchoDelay, reduceDelays } from '../src/audio/latency-calibrate.js';
import { BLOCKS, EX_MAKERS, blockUnlocked } from '../src/theory/curriculum.js';

const checks = [];
const eq = (name, got, want, tol = 0) => {
  const ok = tol ? Math.abs(got - want) <= tol : got === want;
  checks.push([ok, name, `got=${got} want=${want}${tol ? ` ±${tol}` : ''}`]);
};

// note-map
eq('A4 name', hzToNoteInfo(440).name, 'A4');
eq('A4 cents~0', hzToNoteInfo(440).cents, 0, 1);
eq('C4 name', hzToNoteInfo(261.63).name, 'C4');
eq('midiToHz(69)=440', Math.round(midiToHz(69)), 440);
eq('noteToHz(C4)~261.6', noteToHz('C4'), 261.63, 0.5);
eq('centsOff semitone~100', Math.round(centsOff(midiToHz(70), midiToHz(69))), 100, 1);
eq('zone green', centsZone(10), 'green');
eq('zone yellow', centsZone(30), 'yellow');
eq('zone red', centsZone(60), 'red');
// hzToY: низкая нота внизу (~h), высокая вверху (~0)
eq('hzToY low≈h', Math.round(hzToY(65.41, 100)), 100, 1);
eq('hzToY high≈0', Math.round(hzToY(1046.5, 100)), 0, 1);
const yMid = hzToY(261.63, 100);
checks.push([yMid < 100 && yMid > 0, 'hzToY mid in range', `y=${yMid.toFixed(1)}`]);

// exercises
eq('scale5 len', fiveNoteScale(60).notes.length, 9);
eq('scale5 root', fiveNoteScale(60).notes[0].midi, 60);
eq('agility len', agilityRun(60).notes.length, 11);
eq('agility fast beats', agilityRun(60).notes[0].beats, 0.5);
eq('sustain 1 note', sustain(60, 8).notes.length, 1);
eq('octaveJump top', octaveJump(60).notes[0].midi, 72);
eq('refFreqs len', referenceFreqs(fiveNoteScale(60)).length, 9);
// лад реально меняет гаммовые упражнения: III ступень в миноре = +3 полутона (мажор = +4)
eq('scale5 ionian deg3', fiveNoteScale(60, 'ionian').notes[2].midi, 64);
eq('scale5 aeolian deg3', fiveNoteScale(60, 'aeolian').notes[2].midi, 63);
eq('hum3 aeolian deg3', hum3(60, 'aeolian').notes[2].midi, 63);
eq('agility aeolian deg6', agilityRun(60, 'aeolian').notes[5].midi, 68);
// гласные-распевки (из PDF-техники, нейтральные)
// гласные-распевки — точная транскрипция L02 (фикс. смещения от тоники)
eq('vowelHold full 20 notes', vowelHold(60).notes.length, 20);
eq('vowelHold rises E->G', vowelHold(60).notes[10].midi, 63);
eq('vowelScale Disco len', vowelScale(60).notes.length, 10);
eq('vowelScale Disco peak C', vowelScale(60).notes[4].midi, 68);
eq('vowelAgility NoBubble len', vowelAgility(60).notes.length, 13);
eq('vowelAgility 2nd note +3', vowelAgility(60).notes[1].midi, 63);
eq('vowelClimb HighFive len', vowelClimb(60).notes.length, 15);
eq('vowelClimb fifth jump', vowelClimb(60).notes[1].midi, 67);
eq('jamesCharles len', jamesCharles(60).notes.length, 14);
eq('jamesCharles A note', jamesCharles(60).notes[2].midi, 65);
eq('jumpToFifth jumps DOWN', jumpToFifth(60, 'ionian').notes[6].midi, 55);
eq('vibrato wide green', vibratoHold(60).greenCents, 55);

// scoring
const sc = new Scorer(2);
sc.record(0, 'green', 1000, true);
sc.record(1, 'red', 1000, true);
const r = sc.result();
eq('score pct=0.5', Math.round(r.pct * 100) / 100, 0.5, 0.01);
eq('score notesHit=1', r.notesHit, 1);
eq('score stars(50%)=1', r.stars, 1);

// новые распевки (М, brrr) + тоника
eq('hum3 root', hum3(60).root, 60);
eq('hum3 offsets', hum3(60).notes.map((n) => n.midi - 60).join(','), '0,2,4,2,0');
eq('lipTrill len', lipTrill(60).notes.length, 11);
eq('lipTrill offsets', lipTrill(60).notes.map((n) => n.midi - 60).join(','), '0,2,4,5,7,5,4,2,0,7,0');
eq('exercise has root', sustain(60).root, 60);
eq('octaveJump root=tonic', octaveJump(60).root, 60);

// классификация типа голоса
eq('classify Бас (E2-C4)', classifyVoice(40, 60).name, 'Бас');
eq('classify Тенор (C3-C5)', classifyVoice(48, 72).name, 'Тенор');
eq('classify Сопрано (C4-C6)', classifyVoice(60, 84).name, 'Сопрано');
eq('voice types count', VOICE_TYPES.length, 6);
eq('getVoiceType center', getVoiceType('tenor').center, 57);

// ритмические распевки — целостность данных
let rhythmOk = true;
for (const k of Object.keys(RHYTHM)) {
  const ex = RHYTHM[k];
  if (ex.kind !== 'rhythm') rhythmOk = false;
  if (!Array.isArray(ex.steps) || ex.steps.length === 0) rhythmOk = false;
  if (ex.steps.some((s) => !(s.b > 0) || !s.s)) rhythmOk = false;
  if (!(ex.tempo > 0)) rhythmOk = false;
}
checks.push([rhythmOk, 'RHYTHM data valid (steps/beats/tempo)', '']);
eq('RHYTHM has 3', Object.keys(RHYTHM).length, 3);
const air1beats = RHYTHM.air1.steps.reduce((a, s) => a + s.b, 0);
eq('air1 beats=48', air1beats, 48);

// мини-клавиатура
const kb = miniKeyboard(52, 67);
checks.push([kb.includes('<svg') && (kb.match(/rect/g) || []).length > 10, 'miniKeyboard renders keys', '']);
checks.push([miniKeyboard(null, null) === '', 'miniKeyboard empty on null', '']);

// scoring — знаковые центы (разбор «почему»)
const sc2 = new Scorer(1);
sc2.record(0, 'yellow', 1000, true, -30);
sc2.record(0, 'yellow', 1000, true, -30);
eq('avgCents=-30 (занижение)', Math.round(sc2.result().avgCents), -30);

// транспозиция повторов (вверх до верха диапазона и вниз)
const plan = transposePlan(hum3(60), 48, 72, 4);
eq('transposePlan up-down len', plan.length, 13);
eq('transposePlan starts 0', plan[0], 0);
eq('transposePlan peak +4', Math.max(...plan), 4);
eq('transposePlan ends -4', plan[plan.length - 1], -4);
eq('transposePlan narrow=[0]', transposePlan(hum3(60), 60, 64, 4).length, 1);
eq('transposePlan no range=[0]', transposePlan(hum3(60), NaN, NaN).length, 1);

// modes (лады)
eq('ionian deg3=4', degreeToSemitone(3, getMode('ionian')), 4);
eq('aeolian deg3=3', degreeToSemitone(3, getMode('aeolian')), 3);
eq('ionian deg8=octave', degreeToSemitone(8, getMode('ionian')), 12);
eq('ionian scale', degreesToSemitones([1, 2, 3, 4, 5], 'ionian').join(','), '0,2,4,5,7');
eq('aeolian scale', degreesToSemitones([1, 2, 3, 4, 5], 'aeolian').join(','), '0,2,3,5,7');
eq('free locks dorian', modeUnlocked('dorian', 'free'), false);
eq('free allows major', modeUnlocked('ionian', 'free'), true);
eq('standard allows minor', modeUnlocked('aeolian', 'standard'), true);
eq('pro allows all', modeUnlocked('locrian', 'pro'), true);

// калибровка задержки (acoustic loopback)
const calSamples = [
  { t: 0.00, rms: 0.005 }, { t: 0.05, rms: 0.004 }, { t: 0.10, rms: 0.006 }, // фон до щелчка
  { t: 0.16, rms: 0.005 }, { t: 0.20, rms: 0.18 },  { t: 0.25, rms: 0.06 },  // эхо ~0.05с после щелчка (0.15)
];
eq('echo delay ~0.05', findEchoDelay(calSamples, 0.15), 0.05, 0.01);
eq('echo none when silent', findEchoDelay([{ t: 0, rms: 0.004 }, { t: 0.2, rms: 0.005 }], 0.1), null);
eq('reduce median', reduceDelays([0.08, 0.09, 0.10]), 0.09, 1e-9);
eq('reduce too few', reduceDelays([0.09]), null);
eq('reduce drops outliers', reduceDelays([0.9, 0.08, 0.09, 0.5]), 0.08, 0.011);

// глубокий скоринг: ровность + вибрато
const steady = new Scorer(1);
for (let i = 0; i < 60; i++) steady.record(0, 'green', 16, true, 4);
const rSteady = steady.result();
eq('steady stability low', rSteady.stability < 8, true);
eq('steady no vibrato', rSteady.vibrato.present, false);
const vib = new Scorer(1);
for (let i = 0; i < 120; i++) vib.record(0, 'green', 16, true, 45 * Math.sin(2 * Math.PI * 6 * (i * 0.016)));
const rVib = vib.result();
eq('vibrato detected', rVib.vibrato.present, true);
eq('vibrato rate ~6Hz', rVib.vibrato.rateHz, 6, 2);

// === Учебная программа: целостность реестра + гейтинг блоков ===
eq('BLOCKS count', BLOCKS.length, 10);
let curriculumOk = true, badId = '';
for (const b of BLOCKS) {
  for (const it of b.items) {
    if (it.t === 'ex' && !EX_MAKERS[it.id]) { curriculumOk = false; badId = 'item:' + it.id; }
  }
  if (!EX_MAKERS[b.exam.exId]) { curriculumOk = false; badId = 'exam:' + b.exam.exId; }
  if (!(b.exam.pass > 0 && b.exam.pass <= 1)) { curriculumOk = false; badId = 'pass:' + b.id; }
}
checks.push([curriculumOk, 'curriculum: все id блоков/экзаменов резолвятся в упражнения', badId]);
eq('block1 открыт всегда', blockUnlocked(0, []), true);
eq('block2 закрыт без экзамена b1', blockUnlocked(1, []), false);
eq('block2 открыт после b1', blockUnlocked(1, ['b1']), true);
eq('block2 экзамен = Disco Vowels(vscale)', BLOCKS[1].exam.exId, 'vscale');
eq('block6 = Тембр', BLOCKS[5].title, 'Тембр и тон');
eq('block10 = Сопротивление', BLOCKS[9].title, 'Сопротивление');
eq('block7 закрыт без экзамена b6', blockUnlocked(6, ['b1','b2','b3','b4','b5']), false);
eq('block7 открыт после b6', blockUnlocked(6, ['b1','b2','b3','b4','b5','b6']), true);

// === Распевки L04–L10 (точные офсеты из PDF, не ладозависимы) ===
const off2 = (fn) => fn(60).notes.map((n) => n.midi - 60);
eq('vibratoWobble offsets (L04)', off2(vibratoWobble).join(','), '0,1,0,1,0,1,0,5,6,5,6,5,6,5');
eq('timbreVocalise offsets (L05)', off2(timbreVocalise).join(','), '0,1,3,0,1,3,1,0,0,1,3,5,7,5');
eq('timbreShift offsets (L05)', off2(timbreShift).join(','), '0,0,0,-5,-5,0,0,-5,-5');
eq('registerArp offsets (L06)', off2(registerArp).join(','), '0,3,0,7,0,12,0,7,0,3');
eq('registerOctave offsets (L06)', off2(registerOctave).join(','), '0,12,0,12');
eq('beltScale offsets (L07)', off2(beltScale).join(','), '0,1,3,5,7,5,3,1,0');
eq('beltOctave offsets (L07)', off2(beltOctave).join(','), '0,12,0,12,0,12,0');
eq('articStaccato одна нота ×8 (L08)', off2(articStaccato).join(','), '0,0,0,0,0,0,0,0');
eq('articGroups offsets (L08)', off2(articGroups).join(','), '0,0,0,-5,-5,-5,0,0,0,-5,-5,-5');
eq('resistTurn offsets (L10)', off2(resistTurn).join(','), '0,1,3,1,0,1,3,1,0,1,3,1,0');
eq('resistRun offsets (L10)', off2(resistRun).join(','), '0,1,3,5,7,5,3,1,0,1,3,5,7,5,3,1,0');
eq('новые распевки НЕ ладозависимы', [vibratoWobble, timbreVocalise, registerArp, beltScale, articStaccato, resistTurn].every((f) => f(60).modeKey === undefined), true);

// === Правки музыканта: точная транскрипция L02 целыми массивами (смещения в полутонах от тоники) ===
const offs = (fn) => fn(60).notes.map((n) => n.midi - 60);
eq('vowelHold offsets (E×10 → G×10)', offs(vowelHold).join(','), '0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3');
eq('vowelScale Disco offsets', offs(vowelScale).join(','), '0,1,5,7,8,7,5,1,7,5');
eq('vowelAgility NoBubble offsets', offs(vowelAgility).join(','), '0,3,1,5,3,7,5,8,7,3,5,1,0');
eq('vowelClimb HighFive offsets (E↔B ×5 + гамма)', offs(vowelClimb).join(','), '0,7,0,7,0,7,0,7,0,7,0,1,3,5,7');
eq('jamesCharles offsets', offs(jamesCharles).join(','), '0,1,5,0,1,5,0,1,5,8,8,7,5,1');
eq('гласные НЕ ладозависимы (modeKey undefined)', vowelHold(60).modeKey, undefined);
eq('Скачок к V — квинта ВНИЗ (−5 полутонов)', jumpToFifth(60, 'ionian').notes[6].midi - 60, -5);

// === Логика состояния (progress.js) — со стабом localStorage/navigator ===
globalThis.localStorage = (() => { let s = {}; return {
  getItem: (k) => (k in s ? s[k] : null), setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; }, clear: () => { s = {}; },
  get length() { return Object.keys(s).length; }, key: (i) => Object.keys(s)[i] ?? null,
}; })();
// navigator уже есть в Node (не мобильный) → desktop-дефолты; стаб не нужен.
const P = await import('../src/state/progress.js');
eq('громкость по умолч. (desktop) = 1.8', P.getVolumeMult(), 1.8);
P.setVolume('max'); eq('громкость max = 4.2', P.getVolumeMult(), 4.2);
eq('задержка по умолч. (speaker)', P.getLatency(), 0.09, 1e-9);
P.setRoute('bt'); eq('задержка bt = 0.24', P.getLatency(), 0.24, 1e-9);
P.setLatencyManual(0.15); eq('ручная калибровка перекрывает маршрут', P.getLatency(), 0.15, 1e-9);
eq('энергия стартует MAX', P.getEnergy(), P.getMaxEnergy());
P.addEnergy(-4); eq('энергия −4', P.getEnergy(), P.getMaxEnergy() - 4);
// реген: отмотать energyTs на 51 минуту назад → +2 единицы (1 за 25 мин)
{ const pk = globalThis.localStorage.key(0); const obj = JSON.parse(globalThis.localStorage.getItem(pk)); obj.energyTs = Date.now() - 51 * 60000; globalThis.localStorage.setItem(pk, JSON.stringify(obj)); }
eq('энергия восстанавливается со временем (1+2=3)', P.getEnergy(), 3);
// лиды
P.saveLead({ name: 'Тест', contact: 'tg', pref: 'female' });
eq('лид сохранён', P.getLeads().length, 1);
eq('лид содержит предпочтение', P.getLeads()[0].pref, 'female');
// экзамены + интеграция с гейтингом
P.markExamPassed('b1');
eq('экзамен b1 отмечен', P.getExamsPassed().includes('b1'), true);
eq('после сдачи b1 блок2 открыт (интеграция)', blockUnlocked(1, P.getExamsPassed()), true);
P.markBlockItem('b1', 'hum3');
eq('пункт блока отмечен', P.getBlockItems('b1').includes('hum3'), true);
// режим подсказки (фикс протечки поводыря, Заход 1.I)
P.setGuide(true); P.setHeadphones(false);
eq('подсказка без наушников = prehear (не течёт в микрофон)', P.getGuideMode(), 'prehear');
P.setHeadphones(true);
eq('подсказка с наушниками = continuous', P.getGuideMode(), 'continuous');
P.setGuide(false);
eq('подсказка выкл = off', P.getGuideMode(), 'off');

let pass = 0;
for (const [ok, name, info] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${ok ? '' : '<< ' + info}`);
  if (ok) pass++;
}
console.log(`\n${pass}/${checks.length} passed`);
process.exit(pass === checks.length ? 0 : 1);
