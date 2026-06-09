import json, sys, glob, os
OUT = r"D:\vocal-trainer\tools\note-extract\out"
name = sys.argv[1] if len(sys.argv) > 1 else "L02"
path = os.path.join(OUT, name + ".json")
d = json.load(open(path, encoding="utf-8"))
print(d['file'], "| notes:", d['note_count'], "| rows:", len(d['rows']))
for i, r in enumerate(d['rows']):
    print(f"  row{i} p{r['page']} clefY={r['clefY']} n={r['count']:2d} first={r['midis'][0]} off={r['offsets']}")
