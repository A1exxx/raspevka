import { hzToNoteInfo, midiToHz, centsOff, centsZone, hzToY, noteToHz } from '../src/theory/note-map.js';
import { fiveNoteScale, agilityRun, sustain, octaveJump, referenceFreqs } from '../src/theory/exercises.js';
import { Scorer } from '../src/game/scoring.js';

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

// scoring
const sc = new Scorer(2);
sc.record(0, 'green', 1000, true);
sc.record(1, 'red', 1000, true);
const r = sc.result();
eq('score pct=0.5', Math.round(r.pct * 100) / 100, 0.5, 0.01);
eq('score notesHit=1', r.notesHit, 1);
eq('score stars(50%)=1', r.stars, 1);

let pass = 0;
for (const [ok, name, info] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${ok ? '' : '<< ' + info}`);
  if (ok) pass++;
}
console.log(`\n${pass}/${checks.length} passed`);
process.exit(pass === checks.length ? 0 : 1);
