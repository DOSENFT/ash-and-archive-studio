import sys as _s
try: _s.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass
#!/usr/bin/env python3
"""THE GRAND TOUR — acceptance evidence (founder ruling 2026-07-17 §4).
Owns its own lifecycle: launches by PID, hard watchdog, terminates itself —
no window is ever left for a human to close (the harness law)."""
import os, subprocess, sys, time, json, threading, urllib.request

CDP = 9223  # own port — never collides with a founder-opened instance
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "tour_evidence")
os.makedirs(OUT, exist_ok=True)
EXE = os.path.abspath(os.path.join(HERE, r"..\..\..\apps\studio-shell\src-tauri\target\release\studio-shell.exe"))
REPO = os.path.abspath(os.path.join(HERE, r"..\..\.."))

shell_pid = None
def kill():
    if shell_pid:
        subprocess.run(["taskkill", "/PID", str(shell_pid), "/T", "/F"], capture_output=True)
watchdog = threading.Timer(240, lambda: (kill(), os._exit(3)))  # hard ceiling: nothing outlives 4 min
watchdog.daemon = True
watchdog.start()

bat = os.path.join(os.getenv("TEMP", "."), "studio-tour-launch.bat")
with open(bat, "w") as f:
    f.write(f'@echo off\nset "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port={CDP}"\nstart "" /b "{EXE}"\n')
before = {int(l.split('","')[1]) for l in subprocess.run(["tasklist","/FI","IMAGENAME eq studio-shell.exe","/FO","CSV","/NH"],capture_output=True,text=True).stdout.splitlines() if "studio-shell" in l}
subprocess.run(["cmd", "/c", bat], timeout=30)
time.sleep(1.5)
after = {int(l.split('","')[1]) for l in subprocess.run(["tasklist","/FI","IMAGENAME eq studio-shell.exe","/FO","CSV","/NH"],capture_output=True,text=True).stdout.splitlines() if "studio-shell" in l}
shell_pid = next(iter(after - before), None)

def target(timeout=30):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            for t in json.load(urllib.request.urlopen(f"http://localhost:{CDP}/json")):
                if t.get("type") == "page" and "tauri.localhost" in t.get("url", ""):
                    return t
        except OSError:
            pass
        time.sleep(0.4)
    kill(); sys.exit("no CDP target")

checks = []
try:
    target()
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        page = p.chromium.connect_over_cdp(f"http://localhost:{CDP}").contexts[0].pages[0]
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{n}.png"))
        page.wait_for_selector("#world img", timeout=10000)
        vw = page.viewport_size or {"width": 1440, "height": 900}
        cx, cy = vw["width"] // 2, vw["height"] // 2
        page.mouse.move(cx, cy)
        time.sleep(0.5)
        shot("t0_approach")                               # journey position 0: the Approach

        # (a) scroll scrubs FORWARD… (2 ticks = ~840ms target, safely inside segment 0)
        for _ in range(2): page.mouse.wheel(0, 120); time.sleep(0.05)
        time.sleep(0.18)                                  # inside the 250ms release window
        shot("t1_scrub_fwd")                              # mid-dissolve toward the Gate
        opacityB = page.evaluate("parseFloat(document.querySelectorAll('#world img')[1].style.opacity) || 0")
        checks.append(("scroll scrubs forward (dissolve progressing)", 0.05 < opacityB))
        # …and BACKWARD under the hand
        page.mouse.wheel(0, -120); time.sleep(0.18)
        opacityB2 = page.evaluate("parseFloat(document.querySelectorAll('#world img')[1].style.opacity) || 0")
        shot("t2_scrub_back")
        checks.append(("scroll scrubs backward (time reverses)", opacityB2 < opacityB - 0.02))

        # (b) release ⇒ settle to nearest endpoint (interior node holds; the hand resumes)
        time.sleep(0.6)
        settled = page.evaluate("(() => { const b = document.querySelectorAll('#world img')[1]; const o = +b.style.opacity; return o < 0.05 || o > 0.95; })()")
        checks.append(("released scrub settles to an endpoint", settled))

        # (c) the chain plays through as ONE journey: scrub hard to the end
        for _ in range(40): page.mouse.wheel(0, 240); time.sleep(0.04)
        t0 = time.time()
        while time.time() - t0 < 25:                      # dissolves + the real clip + settle + seat
            if page.evaluate("!!document.querySelector('#backdrop img') && document.querySelector('#world').children.length === 0"):
                break
            if page.evaluate("(() => { const v = document.querySelector('#world video'); return !!v && v.style.opacity === '1'; })()"):
                shot("t3_flight_scrubbed")                # the real clip under the scrub
            time.sleep(0.4)
        seated = page.evaluate("!!document.querySelector('#backdrop img') && document.querySelector('#world').children.length === 0")
        shot("t4_seated_garth")                           # journey's end: seated at the Sanctum
        checks.append(("journey ends seated (motion layer torn down)", seated))
        checks.append(("uncurated chip standing", page.evaluate("document.querySelector('#uncurated-chip').className.includes('on')")))

        # (d) full fidelity: navigate to a bay, sample the backdrop vs the canon file
        page.evaluate("location.hash = '#/seat/academy'")
        time.sleep(1.0)
        shot("t5_academy_fullfidelity")
        seat_rect = page.evaluate("(() => { const r = document.querySelector('#seat').getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, iw: innerWidth, ih: innerHeight, dpr: devicePixelRatio}; })()")
        checks.append(("academy presence", page.evaluate("(() => { const i = document.querySelector('#backdrop img'); return !!i && i.src.includes('academy'); })()")))
finally:
    kill()
    watchdog.cancel()

# dE: canon file vs on-screen sample (cover-crop the source to the viewport, compare clean patches)
try:
    from PIL import Image
    scr_full = Image.open(os.path.join(OUT, "t5_academy_fullfidelity.png")).convert("RGB")
    # fraction-based mapping (DPR-invariant): seat box as fractions of the viewport
    fx, fy = seat_rect["x"] / seat_rect["iw"], seat_rect["y"] / seat_rect["ih"]
    fw, fh = seat_rect["w"] / seat_rect["iw"], seat_rect["h"] / seat_rect["ih"]
    W, H = scr_full.size
    scr = scr_full.crop((int(fx * W), int(fy * H), int((fx + fw) * W), int((fy + fh) * H)))
    src = Image.open(os.path.join(REPO, "studio", "ASSETS", "stills", "bench.academy.png")).convert("RGB")
    sw, sh = scr.size
    ar = sw / sh
    cw = min(src.width, int(src.height * ar)); ch = int(cw / ar)
    src_cover = src.crop(((src.width - cw) // 2, (src.height - ch) // 2, (src.width + cw) // 2, (src.height + ch) // 2)).resize((sw, sh))
    def patch_mean(im, box):
        px = im.crop(box).resize((1, 1)).getpixel((0, 0)); return px
    patches = [(int(sw*0.72), int(sh*0.25), int(sw*0.95), int(sh*0.45)),   # upper right — clear of the card
               (int(sw*0.68), int(sh*0.65), int(sw*0.95), int(sh*0.9)),
               (int(sw*0.03), int(sh*0.75), int(sw*0.2), int(sh*0.95))]
    des = []
    for b in patches:
        a = patch_mean(scr, b); c = patch_mean(src_cover, b)
        des.append(sum((x - y) ** 2 for x, y in zip(a, c)) ** 0.5)  # RGB distance ≈ dE76 proxy at these values
    print(f"fidelity dE (RGB-distance proxy, 3 patches): {['%.1f' % d for d in des]} — global veil dead if all small")
    checks.append(("full-fidelity backdrop (all patches dE<12)", all(d < 12 for d in des)))
except Exception as e:
    print("dE sampling failed:", e)
    checks.append(("full-fidelity backdrop", False))

print("\n".join(f"{'PASS' if ok else 'FAIL'}  {n}" for n, ok in checks))
sys.exit(0 if all(ok for _, ok in checks) else 1)
