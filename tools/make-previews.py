# make-previews.py — аудио-превью распевок для сверки с музыкантом.
# Читает note-previews.json (из emit-exercises.mjs), синтезирует мягкий фортепианный
# тон (3 гармоники + экспоненциальная огибающая), пишет WAV → MP3 (ffmpeg).
import json, math, os, struct, subprocess, wave, re

HERE = os.path.dirname(__file__)
OUT = r"D:\vocal-trainer\docs\note-previews"
os.makedirs(OUT, exist_ok=True)

SR = 44100

def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def synth(notes, tempo):
    spb = 60.0 / tempo
    total = sum(n["beats"] for n in notes) * spb + 0.6
    buf = [0.0] * int(total * SR)
    t = 0.25  # небольшой въезд
    for n in notes:
        dur = n["beats"] * spb
        f = midi_hz(n["midi"])
        n0 = int(t * SR)
        length = int(min(dur * 0.96, dur) * SR)
        for i in range(length):
            tt = i / SR
            # мягкое «пиано»: основная + 2 гармоники, атака 8мс, экспоненциальный спад
            env = min(1.0, tt / 0.008) * math.exp(-2.2 * tt / max(dur, 0.25))
            s = (math.sin(2 * math.pi * f * tt)
                 + 0.45 * math.sin(2 * math.pi * 2 * f * tt)
                 + 0.18 * math.sin(2 * math.pi * 3 * f * tt))
            idx = n0 + i
            if idx < len(buf):
                buf[idx] += 0.24 * env * s
        t += dur
    # клиппинг-защита
    peak = max(1e-9, max(abs(x) for x in buf))
    k = min(1.0, 0.92 / peak)
    return [x * k for x in buf]

def write_wav(path, buf):
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(x * 32767)) for x in buf))

def safe(name):
    return re.sub(r'[^\w\-а-яА-ЯёЁ ()]', '', name).strip().replace(' ', '_')

data = json.load(open(os.path.join(HERE, "note-previews.json"), encoding="utf-8"))
for ex in data:
    base = f'{ex["num"]}_{safe(ex["label"])}'
    wav = os.path.join(OUT, base + ".wav")
    mp3 = os.path.join(OUT, base + ".mp3")
    write_wav(wav, synth(ex["notes"], ex["tempo"]))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "128k", mp3], check=True)
    os.remove(wav)  # временный wav после конвертации не нужен
    print("ok", base + ".mp3")
print("done:", len(data))
