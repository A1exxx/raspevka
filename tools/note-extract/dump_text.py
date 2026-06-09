# Диагностика: выгрузить текст + структуру каждого урока Cheryl Porter.
# Понять, какие упражнения описаны и есть ли векторная нотация (для снятия нот).
import fitz, glob, os, sys

DL = r"C:\Users\user\Downloads"
files = sorted(glob.glob(os.path.join(DL, "L0*Cheryl Porter*.pdf")) +
               glob.glob(os.path.join(DL, "L*Cheryl_Porter*.pdf")))

target = sys.argv[1] if len(sys.argv) > 1 else None

for f in files:
    base = os.path.basename(f)
    if target and target not in base:
        continue
    doc = fitz.open(f)
    print("=" * 80)
    print(base, "| pages:", doc.page_count)
    for pi, page in enumerate(doc):
        txt = page.get_text("text").strip()
        draws = page.get_drawings()
        # горизонтальные линии (кандидаты в нотный стан)
        hlines = 0
        for d in draws:
            for it in d.get("items", []):
                if it[0] == "l":
                    p1, p2 = it[1], it[2]
                    if abs(p1.y - p2.y) < 0.6 and abs(p2.x - p1.x) > 30:
                        hlines += 1
        # глифы (символы) и шрифты
        fonts = set()
        rd = page.get_text("rawdict")
        glyph_chars = {}
        for b in rd.get("blocks", []):
            for l in b.get("lines", []):
                for s in l.get("spans", []):
                    fonts.add(s.get("font", "?"))
                    for c in s.get("chars", []):
                        ch = c.get("c", "")
                        if ord(ch) > 0x2000 or ch in "":
                            glyph_chars[ch] = glyph_chars.get(ch, 0) + 1
        print(f"\n--- p{pi}: hlines={hlines} fonts={sorted(fonts)}")
        if glyph_chars:
            print("  glyphs:", {f"U+{ord(k):04X}": v for k, v in sorted(glyph_chars.items(), key=lambda x: -x[1])[:12]})
        # первые 1200 символов прозы
        print(txt[:1200])
    doc.close()
