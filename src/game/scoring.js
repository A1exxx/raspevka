// scoring.js — накопление очков по упражнению.
// Идея: для каждой целевой ноты копим время в зелёной зоне (жёлтая = половина).
// Итог = доля «зелёного» времени по озвученным нотам -> звёзды.
// Плюс «глубокий» разбор: стабильность высоты (разброс центов) и наличие вибрато.

export class Scorer {
  constructor(noteCount) {
    this.notes = Array.from({ length: noteCount }, () => ({ greenMs: 0, scoredMs: 0, activeMs: 0, sumCents: 0, centsMs: 0 }));
    // глобальная статистика по всем озвученным кадрам — для ровности/вибрато
    this.g = { ms: 0, sumC: 0, sumC2: 0, reversals: 0, lastC: null, lastDir: 0 };
  }

  /** Записать кадр: индекс ноты, зона, dtMs, был ли голос, знаковое отклонение (центы). */
  record(noteIndex, zone, dtMs, voiced, cents = null) {
    const s = this.notes[noteIndex];
    if (!s) return;
    s.activeMs += dtMs;
    if (!voiced) return;
    s.scoredMs += dtMs;
    if (zone === 'green') s.greenMs += dtMs;
    else if (zone === 'yellow') s.greenMs += dtMs * 0.5;
    if (cents != null && Number.isFinite(cents)) {
      s.sumCents += cents * dtMs;
      s.centsMs += dtMs;
      // глобально: дисперсия центов (ровность) + развороты направления (вибрато)
      const g = this.g;
      g.ms += dtMs; g.sumC += cents * dtMs; g.sumC2 += cents * cents * dtMs;
      if (g.lastC != null) {
        const d = cents - g.lastC;
        if (Math.abs(d) > 2) { // игнорируем микродрожь детектора
          const dir = d > 0 ? 1 : -1;
          if (g.lastDir && dir !== g.lastDir) g.reversals += 1;
          g.lastDir = dir;
        }
      }
      g.lastC = cents;
    }
  }

  result() {
    let green = 0, active = 0, sumCents = 0, centsMs = 0;
    let notesHit = 0;
    for (const n of this.notes) {
      green += n.greenMs;
      active += n.activeMs;
      sumCents += n.sumCents;
      centsMs += n.centsMs;
      if (n.activeMs > 0 && n.greenMs / n.activeMs >= 0.5) notesHit += 1;
    }
    const pct = active > 0 ? green / active : 0;
    const stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : pct >= 0.35 ? 1 : 0;

    // Ровность: взвешенное СКО центов (меньше = стабильнее).
    const g = this.g;
    let stability = 0;
    if (g.ms > 0) {
      const mean = g.sumC / g.ms;
      const varc = Math.max(0, g.sumC2 / g.ms - mean * mean);
      stability = Math.sqrt(varc);
    }
    // Вибрато: регулярные развороты высоты 3.5–8.5 Гц при умеренном размахе.
    const voicedSec = g.ms / 1000;
    const rateHz = voicedSec > 0 ? (g.reversals / 2) / voicedSec : 0;
    const vibratoPresent = rateHz >= 3.5 && rateHz <= 8.5 && stability >= 15 && stability <= 130;

    return {
      pct,
      stars,
      notesHit,
      notesTotal: this.notes.length,
      avgCents: centsMs > 0 ? sumCents / centsMs : 0,
      perNote: this.notes.map((n) => (n.activeMs > 0 ? n.greenMs / n.activeMs : 0)),
      stability,
      vibrato: { present: vibratoPresent, rateHz },
    };
  }
}
