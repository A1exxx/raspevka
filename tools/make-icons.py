# make-icons.py — PNG-иконки для PWA/сторов из фирменного знака (эквалайзер-полоски).
# Рисуем программно (Pillow): teal-фон со скруглением + 5 белых полосок (как в сплэше).
# maskable: тот же знак с запасом (safe zone 80%) на полном квадрате без скругления.
from PIL import Image, ImageDraw
import os

OUT = r"D:\vocal-trainer\public\icons"
os.makedirs(OUT, exist_ok=True)

TEAL = (14, 141, 127, 255)       # --accent #0e8d7f
TEAL_D = (10, 118, 106, 255)     # --accent-2
WHITE = (255, 255, 255, 255)

def draw_mark(d, cx, cy, scale):
    """5 полосок эквалайзера, центр (cx,cy), scale = высота максимальной полоски."""
    heights = [0.40, 0.75, 1.00, 0.60, 0.30]
    bar_w = scale * 0.13
    gap = scale * 0.085
    total_w = 5 * bar_w + 4 * gap
    x = cx - total_w / 2
    for hfrac in heights:
        h = scale * hfrac
        top = cy + scale / 2 - h
        d.rounded_rectangle([x, top, x + bar_w, cy + scale / 2], radius=bar_w / 2, fill=WHITE)
        x += bar_w + gap

def make(size, maskable=False, name=None):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        # maskable: полный квадрат (ОС сама маскирует), знак в safe zone (центр. 80%)
        d.rectangle([0, 0, size, size], fill=TEAL)
        d.ellipse([-size * .35, size * .55, size * .75, size * 1.5], fill=TEAL_D)  # мягкий блик
        draw_mark(d, size / 2, size / 2, size * 0.42)
    else:
        r = size * 0.225
        d.rounded_rectangle([0, 0, size, size], radius=r, fill=TEAL)
        d.ellipse([-size * .35, size * .55, size * .75, size * 1.5], fill=TEAL_D)
        draw_mark(d, size / 2, size / 2, size * 0.5)
    img.save(os.path.join(OUT, name), "PNG")
    print("ok", name)

make(192, name="icon-192.png")
make(512, name="icon-512.png")
make(512, maskable=True, name="icon-512-maskable.png")
make(180, name="apple-touch-icon.png")  # iOS home screen
