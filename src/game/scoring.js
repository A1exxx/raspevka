// scoring.js — накопление очков по упражнению.
// Идея: для каждой целевой ноты копим время в зелёной зоне (жёлтая = половина).
// Итог = доля «зелёного» времени по озвученным нотам -> звёзды.

export class Scorer {
  constructor(noteCount) {
    this.notes = Array.from({ length: noteCount }, () => ({ greenMs: 0, scoredMs: 0, activeMs: 0 }));
  }

  /** Записать кадр: noteIndex активной ноты, зона попадания, прошло dtMs, был ли голос. */
  record(noteIndex, zone, dtMs, voiced) {
    const s = this.notes[noteIndex];
    if (!s) return;
    s.activeMs += dtMs;
    if (!voiced) return;
    s.scoredMs += dtMs;
    if (zone === 'green') s.greenMs += dtMs;
    else if (zone === 'yellow') s.greenMs += dtMs * 0.5;
  }

  result() {
    let green = 0, active = 0;
    let notesHit = 0;
    for (const n of this.notes) {
      green += n.greenMs;
      active += n.activeMs;
      if (n.activeMs > 0 && n.greenMs / n.activeMs >= 0.5) notesHit += 1;
    }
    const pct = active > 0 ? green / active : 0;
    const stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : pct >= 0.35 ? 1 : 0;
    return {
      pct,
      stars,
      notesHit,
      notesTotal: this.notes.length,
      perNote: this.notes.map((n) => (n.activeMs > 0 ? n.greenMs / n.activeMs : 0)),
    };
  }
}
