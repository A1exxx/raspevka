import { hzToNoteInfo, midiToHz, centsOff, centsZone, hzToY, noteToHz } from '../src/theory/note-map.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump, referenceFreqs, hum3, lipTrill, transposePlan, vowelHold, vowelScale, vowelAgility, vowelClimb, jamesCharles, vibratoHold } from '../src/theory/exercises.js';
import { Scorer } from '../src/game/scoring.js';
import { classifyVoice, getVoiceType, VOICE_TYPES } from '../src/theory/voice-types.js';
import { RHYTHM } from '../src/screens/rhythm.js';
import { miniKeyboard } from '../src/ui/illustrations.js';
import { getMode, modeUnlocked, degreeToSemitone, degreesToSemitones } from '../src/theory/modes.js';
import { findEchoDelay, reduceDelays } from '../src/audio/latency-calibrate.js';

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
eq('vowelHold one pitch', new Set(vowelHold(60).notes.map((n) => n.midi)).size, 1);
eq('vowelHold 5 notes', vowelHold(60).notes.length, 5);
eq('vowelScale ionian top', vowelScale(60, 'ionian').notes[4].midi, 67);
eq('vowelScale aeolian deg3', vowelScale(60, 'aeolian').notes[2].midi, 63);
eq('vowelAgility len (PDF #5)', vowelAgility(60).notes.length, 13);
eq('vowelAgility alternates tonic', vowelAgility(60).notes[2].midi, 60);
eq('vowelClimb len', vowelClimb(60).notes.length, 6);
eq('vowelClimb holds top', vowelClimb(60).notes[5].beats, 2);
eq('jamesCharles len', jamesCharles(60).notes.length, 10);
eq('jamesCharles peak', jamesCharles(60, 'ionian').notes[4].midi, 67);
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

let pass = 0;
for (const [ok, name, info] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${ok ? '' : '<< ' + info}`);
  if (ok) pass++;
}
console.log(`\n${pass}/${checks.length} passed`);
process.exit(pass === checks.length ? 0 : 1);
