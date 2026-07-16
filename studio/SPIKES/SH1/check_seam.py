"""Harvest seam checker (SH1 seam rule, ΔE76 < 2.0).
Usage:
  python check_seam.py clipA.mp4 clipB.mp4              # A.last vs B.first
  python check_seam.py clip.mp4 pose.png first|last     # clip endpoint vs locked pose still
"""
import subprocess, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def frame(path: Path, which: str) -> np.ndarray:
    if path.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
        return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)
    out = Path(tempfile.mkstemp(suffix=".png")[1])
    if which == "last":
        cmd = [FFMPEG, "-y", "-sseof", "-0.5", "-i", str(path), "-update", "1", "-frames:v", "1", str(out)]
    else:
        cmd = [FFMPEG, "-y", "-i", str(path), "-frames:v", "1", str(out)]
    subprocess.run(cmd, check=True, capture_output=True)
    return np.asarray(Image.open(out).convert("RGB"), dtype=np.float64)

def lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ np.array([[0.4124564, 0.3575761, 0.1804375],
                        [0.2126729, 0.7151522, 0.0721750],
                        [0.0193339, 0.1191920, 0.9503041]]).T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)

a, b = Path(sys.argv[1]), Path(sys.argv[2])
mode = sys.argv[3] if len(sys.argv) > 3 else None
fa = frame(a, "last" if mode in (None, "last") else "first")
fb = frame(b, "first" if mode is None else "first")
if fa.shape != fb.shape:
    fb = np.asarray(Image.fromarray(fb.astype(np.uint8)).resize((fa.shape[1], fa.shape[0])), dtype=np.float64)
d = np.sqrt(((lab(fa) - lab(fb)) ** 2).sum(-1))
mean, p99 = float(d.mean()), float(np.percentile(d, 99))
verdict = "PASS" if mean < 2.0 else "FAIL"
print(f"seam ΔE76 mean={mean:.3f} p99={p99:.3f} (law: mean < 2.0) → {verdict}")
sys.exit(0 if mean < 2.0 else 1)
