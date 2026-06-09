# Эмпирически определить, какой глиф = нотная голова.
# Для каждого кодпоинта Bravura: count, разброс по X и Y, привязка к станам.
import fitz, glob, os, json, sys

DL = r"C:\Users\user\Downloads"
OUT = r"D:\vocal-trainer\tools\note-extract\out"
os.makedirs(OUT, exist_ok=True)

def horizontals(page):
    lines = []
    for d in page.get_drawings():
        for it in d.get("items", []):
            if it[0] == "l":
                p1, p2 = it[1], it[2]
                if abs(p1.y - p2.y) < 0.8 and abs(p2.x - p1.x) > 25:
                    lines.append(round((p1.y + p2.y) / 2, 1))
    return sorted(set(lines))

target = sys.argv[1] if len(sys.argv) > 1 else "L02"
files = sorted(glob.glob(os.path.join(DL, "L0*Cheryl Porter*.pdf")) +
               glob.glob(os.path.join(DL, "L*Cheryl_Porter*.pdf")))
f = [x for x in files if target in os.path.basename(x)][0]
doc = fitz.open(f)
by_cp = {}
all_glyphs = []
for pi, page in enumerate(doc):
    rd = page.get_text("rawdict")
    for b in rd.get("blocks", []):
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                font = s.get("font", "")
                if "Bravura" not in font:
                    continue
                for c in s.get("chars", []):
                    ch = c.get("c", "")
                    bbox = c.get("bbox")
                    if not ch or not bbox:
                        continue
                    cx = (bbox[0] + bbox[2]) / 2
                    cy = (bbox[1] + bbox[3]) / 2
                    cp = ord(ch)
                    by_cp.setdefault(cp, []).append((round(cx, 1), round(cy, 1), font, pi))
                    all_glyphs.append({'cp': f"U+{cp:04X}", 'x': round(cx,1), 'y': round(cy,1), 'p': pi, 'font': font})

stats = []
for cp, pts in by_cp.items():
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    fonts = sorted(set(p[2] for p in pts))
    stats.append({
        'cp': f"U+{cp:04X}", 'count': len(pts),
        'xspread': round(max(xs) - min(xs), 1), 'yspread': round(max(ys) - min(ys), 1),
        'yvals': sorted(set(ys))[:30], 'fonts': fonts,
    })
stats.sort(key=lambda s: -s['count'])

doc.close()
res = {'file': os.path.basename(f), 'staff_lines_per_page0_count': len(horizontals(doc[0]) if False else []),
       'cp_stats': stats}
with open(os.path.join(OUT, "_analyze_" + target + ".json"), "w", encoding="utf-8") as fh:
    json.dump(res, fh, ensure_ascii=False, indent=2)
with open(os.path.join(OUT, "_glyphs_" + target + ".json"), "w", encoding="utf-8") as fh:
    json.dump(all_glyphs, fh, ensure_ascii=False, indent=2)
print("ok")
