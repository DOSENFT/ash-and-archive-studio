"""SPIKE-SH1-S2 — the seam rule at production settings.
Two adjacent ambulatory clips through the real encode pipeline (H.264, 24fps,
production CRF), joined at a locked pose. PASS: mean deltaE76 of the boundary
frames < 2.0, plus a seam montage for the naked-eye check at 2x.
Placeholder art by design: this proves codec physics, not beauty.
"""
import subprocess, sys, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
OUT = Path(__file__).parent / "s2_out"
OUT.mkdir(exist_ok=True)
W, H, FPS = 1280, 720, 24
CLIP_FRAMES = 12  # 0.5s ARC per SH1 sec 2.2

def render_frame(cam: float) -> Image.Image:
    """Deterministic placeholder cloister: camera parameter cam in [0,2].
    cam=1.0 is the locked lintel pose shared by both arcs."""
    img = Image.new("RGB", (W, H), (20, 19, 16))  # obsidian ground
    d = ImageDraw.Draw(img)
    horizon = int(H * 0.55)
    d.rectangle([0, horizon, W, H], fill=(34, 32, 25))          # floor
    d.rectangle([0, 0, W, horizon], fill=(26, 24, 20))          # wall
    # colonnade: pillars translate with camera (parallax), warm stone
    for i in range(-2, 14):
        x = int((i * 220) - cam * 380)
        if -80 < x < W + 80:
            near = 1.0 - abs((x - W / 2) / (W / 1.2))
            wd = int(56 + 30 * near)
            col = (74 + int(18 * near), 66 + int(15 * near), 52 + int(10 * near))
            d.rectangle([x, int(H * 0.12), x + wd, horizon], fill=col)
            d.rectangle([x - 8, int(H * 0.10), x + wd + 8, int(H * 0.14)], fill=col)
    # candle glow at the far bay door (fixed world position)
    gx = int(1500 - cam * 380)
    if -200 < gx < W + 200:
        glow = Image.new("RGB", (W, H), (0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse([gx - 90, horizon - 150, gx + 90, horizon + 10], fill=(201, 168, 98))
        glow = glow.filter(ImageFilter.GaussianBlur(38))
        img = Image.blend(img, Image.composite(glow, img, glow.convert("L")), 0.45)
    # gentle vignette so codec has gradients to chew on
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W // 3, -H // 3, W + W // 3, H + H // 3], fill=90)
    vig = vig.filter(ImageFilter.GaussianBlur(120))
    img = Image.composite(img, Image.new("RGB", (W, H), (10, 9, 8)), vig.point(lambda p: 255 - p // 2))
    return img

def write_clip(name: str, cams: list[float]) -> Path:
    fdir = OUT / f"{name}_frames"; fdir.mkdir(exist_ok=True)
    for i, c in enumerate(cams):
        render_frame(c).save(fdir / f"f{i:04d}.png")
    mp4 = OUT / f"{name}.mp4"
    subprocess.run([FFMPEG, "-y", "-framerate", str(FPS), "-i", str(fdir / "f%04d.png"),
                    "-c:v", "libx264", "-crf", "18", "-preset", "slow",
                    "-pix_fmt", "yuv420p", str(mp4)],
                   check=True, capture_output=True)
    return mp4

def extract_frame(mp4: Path, which: str, total: int) -> np.ndarray:
    png = OUT / f"{mp4.stem}_{which}.png"
    sel = f"eq(n\\,{total-1})" if which == "last" else "eq(n\\,0)"
    subprocess.run([FFMPEG, "-y", "-i", str(mp4), "-vf", f"select={sel}",
                    "-vsync", "0", "-frames:v", "1", str(png)],
                   check=True, capture_output=True)
    return np.asarray(Image.open(png).convert("RGB"), dtype=np.float64)

def srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ M.T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)

def mean_dE76(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.sqrt(((srgb_to_lab(a) - srgb_to_lab(b)) ** 2).sum(-1)).mean())

# ARC(1,2): cam 0.0 -> 1.0 ; ARC(2,3): cam 1.0 -> 2.0. Frame at cam=1.0 is the
# locked pose: last source frame of A and first source frame of B are identical PNGs.
arc_a = write_clip("arcA", [i / (CLIP_FRAMES - 1) for i in range(CLIP_FRAMES)])
arc_b = write_clip("arcB", [1.0 + i / (CLIP_FRAMES - 1) for i in range(CLIP_FRAMES)])

a_last = extract_frame(arc_a, "last", CLIP_FRAMES)
b_first = extract_frame(arc_b, "first", CLIP_FRAMES)
src = np.asarray(render_frame(1.0), dtype=np.float64)

dE_seam = mean_dE76(a_last, b_first)          # the seam the eye crosses
dE_a_src = mean_dE76(a_last, src)             # codec loss, clip A side
dE_b_src = mean_dE76(b_first, src)            # codec loss, clip B side
p99_seam = float(np.percentile(np.sqrt(((srgb_to_lab(a_last) - srgb_to_lab(b_first)) ** 2).sum(-1)), 99))

# joined clip at 2x for the naked-eye check + seam montage for review
concat = OUT / "concat.txt"
concat.write_text(f"file '{arc_a.name}'\nfile '{arc_b.name}'\n")
subprocess.run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
                "-vf", "setpts=0.5*PTS", "-c:v", "libx264", "-crf", "18",
                "-pix_fmt", "yuv420p", str(OUT / "joined_2x.mp4")],
               check=True, capture_output=True, cwd=OUT)
strip = Image.new("RGB", (W, H // 2 * 2), (0, 0, 0))
strip.paste(Image.fromarray(a_last.astype(np.uint8)).resize((W // 2, H // 2)), (0, 0))
strip.paste(Image.fromarray(b_first.astype(np.uint8)).resize((W // 2, H // 2)), (W // 2, 0))
diff = np.abs(a_last - b_first).astype(np.uint8)
strip.paste(Image.fromarray((diff * 8).clip(0, 255).astype(np.uint8)).resize((W // 2, H // 2)), (0, H // 2))
strip.save(OUT / "seam_montage.png")

verdict = "PASS" if dE_seam < 2.0 else "FAIL"
print(f"SPIKE-SH1-S2 {verdict}")
print(f"  mean dE76 seam (A.last vs B.first, decoded): {dE_seam:.4f}  (law: < 2.0)")
print(f"  p99 per-pixel dE76 at seam:                  {p99_seam:.4f}")
print(f"  codec loss vs source  A: {dE_a_src:.4f}   B: {dE_b_src:.4f}")
print(f"  artifacts: {OUT}\\joined_2x.mp4 (naked-eye at 2x), seam_montage.png (top: A|B, bottom: 8x amplified diff)")
sys.exit(0 if verdict == "PASS" else 1)
