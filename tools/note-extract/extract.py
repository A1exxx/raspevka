# Программное снятие нот из PDF Cheryl Porter (рендер на шрифте Bravura).
# Нотная голова = приватный глиф U+F4BE. Якорь высоты и привязка ноты к строке — по G-ключу
# (U+E050, по одному на стан). Шаг между диатоническими ступенями — медиана расстояний между
# линиями ТОГО ЖЕ стана (точнее глобальной). Константа CLEF_E4_STEP откалибрована по vowelScale.
# Знаки альтерации (бемоль/натурал/диез) слева от головы → полутоновый сдвиг.
import fitz, glob, os, json, sys, statistics

DL = r"C:\Users\user\Downloads"
OUT = r"D:\vocal-trainer\tools\note-extract\out"
os.makedirs(OUT, exist_ok=True)

NOTEHEADS = {0xF4BE: 'black', 0xF4BD: 'black2'}
ACCID = {0xE260: -1, 0xE261: 0, 0xE262: +1}
CLEF_G = 0xE050
CLEF_E4_STEP = 4  # калибруется (см. show: первая нота vowelScale → E4=64)

WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
WHITE_SEMI = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

def step_to_midi(step, base_letter='E', base_oct=4):
    i0 = WHITE.index(base_letter)
    idx = i0 + step
    octave = base_oct + (idx // 7)
    letter = WHITE[idx % 7]
    return WHITE_SEMI[letter] + 12 * (octave + 1)

def horizontals(page):
    ys = []
    for d in page.get_drawings():
        for it in d.get("items", []):
            if it[0] == "l":
                p1, p2 = it[1], it[2]
                if abs(p1.y - p2.y) < 0.8 and abs(p2.x - p1.x) > 25:
                    ys.append(round((p1.y + p2.y) / 2, 1))
    return sorted(ys)

def cluster_lines(ys):
    # группируем линии в станы; для каждого стана считаем gap = медиана соседних разниц
    uy = sorted(set(ys))
    staves, cur = [], []
    for y in uy:
        if not cur or (y - cur[-1]) < 18:
            cur.append(y)
        else:
            if len(cur) >= 4: staves.append(cur)
            cur = [y]
    if len(cur) >= 4: staves.append(cur)
    out = []
    for st in staves:
        diffs = [b - a for a, b in zip(st, st[1:]) if 1.5 <= (b - a) <= 12]
        gap = statistics.median(diffs) if diffs else 6.0
        out.append({'cy': (st[0] + st[-1]) / 2, 'gap': gap})
    return out

def glyphs(page):
    res = []
    rd = page.get_text("rawdict")
    for b in rd.get("blocks", []):
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                if "Bravura" not in s.get("font", ""):
                    continue
                for c in s.get("chars", []):
                    ch, bbox = c.get("c", ""), c.get("bbox")
                    if not ch or not bbox:
                        continue
                    res.append({'cp': ord(ch), 'x': round((bbox[0]+bbox[2])/2, 1), 'y': round((bbox[1]+bbox[3])/2, 1),
                                'x0': round(bbox[0], 1)})
    return res

def extract(path, debug=None, clef_step=CLEF_E4_STEP, raw=False):
    doc = fitz.open(path)
    notes = []
    hist = {}
    for pi, page in enumerate(doc):
        clusters = cluster_lines(horizontals(page))
        gmed = statistics.median([c['gap'] for c in clusters]) if clusters else 6.0
        gl = glyphs(page)
        for g in gl:
            hist[g['cp']] = hist.get(g['cp'], 0) + 1
        clefs = [g for g in gl if g['cp'] == CLEF_G]
        heads = [g for g in gl if g['cp'] in NOTEHEADS]
        accs = [g for g in gl if g['cp'] in ACCID]
        if not clefs:
            continue
        for h in heads:
            clef = min(clefs, key=lambda c: abs(c['y'] - h['y']) + (0 if c['x'] < h['x'] else 6))
            # gap из ближайшего стана; если стан не найден — глобальная медиана
            gap = gmed
            if clusters:
                gap = min(clusters, key=lambda c: abs(c['cy'] - h['y']))['gap']
            halfgap = gap / 2
            raw_step = (clef['y'] - h['y']) / halfgap
            stepAboveE4 = round(raw_step) + clef_step
            midi = step_to_midi(stepAboveE4)
            acc = 0
            for a in accs:
                if 0 < (h['x0'] - a['x']) < 22 and abs(a['y'] - h['y']) < halfgap * 1.3:
                    acc = ACCID[a['cp']]; break
            n = {'page': pi, 'clefY': round(clef['y'], 1), 'x': h['x'], 'midi': midi + acc, 'acc': acc}
            if raw: n['raw_step'] = round(raw_step, 2)
            notes.append(n)
    doc.close()
    notes.sort(key=lambda n: (n['page'], n['clefY'], n['x']))
    if debug is not None:
        debug['glyph_hist'] = {f"U+{k:04X}": v for k, v in sorted(hist.items(), key=lambda x: -x[1])}
    return notes

def to_rows(notes):
    rows = {}
    for n in notes:
        rows.setdefault((n['page'], n['clefY']), []).append(n)
    out = []
    for key in sorted(rows):
        m = [n['midi'] for n in rows[key]]
        row = {'page': key[0], 'clefY': key[1], 'count': len(m), 'midis': m, 'offsets': [x - m[0] for x in m]}
        if 'raw_step' in rows[key][0]:
            row['raw_first'] = rows[key][0]['raw_step']
        out.append(row)
    return out

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "L"
    raw = "--raw" in sys.argv
    files = sorted(set(glob.glob(os.path.join(DL, "L*Cheryl Porter*.pdf")) +
                       glob.glob(os.path.join(DL, "L*Cheryl_Porter*.pdf"))))
    summary = []
    seen = set()
    for f in files:
        base = os.path.basename(f)
        if target not in base:
            continue
        lid = base.split(' ')[0].split('_')[0]
        if lid in seen:   # пропустить дубль L02 (1).pdf
            continue
        seen.add(lid)
        dbg = {}
        notes = extract(f, dbg, raw=raw)
        rows = to_rows(notes)
        rec = {'file': base, 'note_count': len(notes), 'rows': rows, 'debug': dbg}
        summary.append(rec)
        with open(os.path.join(OUT, base.split(' ')[0].split('_')[0] + ".json"), "w", encoding="utf-8") as fh:
            json.dump(rec, fh, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "_summary_" + target + ".json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)
    print(f"done: {len(summary)} files; " + ", ".join(f"{s['file'].split(' ')[0].split('_')[0]}={s['note_count']}" for s in summary))
