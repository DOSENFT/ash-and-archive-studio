import sys
try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass
"""GRAND TOUR v2 — acceptance against the VENDORED ENGINE's real DOM.
Owns its lifecycle: PID kill, hard watchdog, zero windows left behind."""
import os, subprocess, time, json, threading, urllib.request

CDP = 9223
BASE = r"C:\Users\marcu\Documents\Ash & Archive\studio-repo"
EXE = BASE + r"\apps\studio-shell\src-tauri\target\release\studio-shell.exe"
OUT = BASE + r"\studio\SPIKES\SH3\tour_evidence"
os.makedirs(OUT, exist_ok=True)

pid = None
def kill():
    if pid: subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
wd = threading.Timer(300, lambda: (kill(), os._exit(3))); wd.daemon = True; wd.start()

bat = os.path.join(os.getenv("TEMP"), "studio-tour2.bat")
open(bat, "w").write(f'@echo off\nset "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port={CDP}"\nstart "" /b "{EXE}"\n')
snap = lambda: {int(l.split('","')[1]) for l in subprocess.run(["tasklist","/FI","IMAGENAME eq studio-shell.exe","/FO","CSV","/NH"],capture_output=True,text=True).stdout.splitlines() if "studio-shell" in l}
b = snap(); subprocess.run(["cmd", "/c", bat], timeout=30); time.sleep(2)
pid = next(iter(snap() - b), None)

t0 = time.time()
while time.time() - t0 < 30:
    try:
        if [t for t in json.load(urllib.request.urlopen(f"http://localhost:{CDP}/json")) if t.get("type") == "page" and "tauri.localhost" in t.get("url", "")]:
            break
    except OSError:
        pass
    time.sleep(0.4)

checks = []
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        page = p.chromium.connect_over_cdp(f"http://localhost:{CDP}").contexts[0].pages[0]
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{n}.png"))
        page.wait_for_selector("#tour .sw-scene", timeout=15000)
        time.sleep(1.2)
        checks.append(("tour mounted; rail hidden", page.evaluate("document.getElementById('shell').style.display === 'none'")))
        checks.append(("scroll document exists (track height > 3 viewports)", page.evaluate("document.querySelector('.sw-track').offsetHeight > innerHeight * 3")))
        shot("v2_t0_approach")

        # (a) forward: scroll drives the film — scrollY, Ken Burns transform, scrollbar fill
        page.mouse.move(700, 450)
        tr0 = page.evaluate("document.querySelectorAll('.sw-scene__still')[0].style.transform")
        for _ in range(5): page.mouse.wheel(0, 400); time.sleep(0.12)
        time.sleep(0.4)
        y1 = page.evaluate("scrollY")
        tr1 = page.evaluate("document.querySelectorAll('.sw-scene__still')[0].style.transform")
        checks.append(("scroll advances the journey", y1 > 800))
        checks.append(("the picture MOVES under scroll (Ken Burns transform changes)", tr0 != tr1))
        shot("v2_t1_midflight")
        # …and BACKWARD
        for _ in range(3): page.mouse.wheel(0, -400); time.sleep(0.12)
        time.sleep(0.4)
        checks.append(("scroll reverses time", page.evaluate("scrollY") < y1))

        # (b) the clip scrubs under the hand: enter the Ambulatory band
        amb_start = page.evaluate("(() => { const t = document.querySelector('.sw-track').offsetHeight - innerHeight; return t; })()")
        page.evaluate("scrollTo(0, 0)")
        time.sleep(0.3)
        # scroll steadily into section 3 (approach 1.35 + gate 1.35 viewports, then the clip band)
        page.evaluate("scrollTo({top: innerHeight * 3.4, behavior: 'instant'})")
        time.sleep(2.5)  # blob fetch + metadata for the 52MB clip
        ct1 = page.evaluate("(() => { const v = document.querySelector('.sw-scene__video'); return v ? v.currentTime : -1; })()")
        page.evaluate("scrollTo({top: innerHeight * 4.2, behavior: 'instant'})")
        time.sleep(1.2)
        ct2 = page.evaluate("(() => { const v = document.querySelector('.sw-scene__video'); return v ? v.currentTime : -1; })()")
        checks.append(("the real clip scrubs with scroll (currentTime advances)", ct1 >= 0 and ct2 > ct1 + 0.2))
        shot("v2_t2_clip_scrub")

        # (c) one continuous journey to the end; CTA seats
        page.evaluate("scrollTo({top: document.querySelector('.sw-track').offsetHeight, behavior: 'instant'})")
        time.sleep(0.8)
        shot("v2_t3_garth_cta")
        checks.append(("the Sanctum CTA holds at the end", page.evaluate("(() => { const b = [...document.querySelectorAll('.sw-btn--primary')].pop(); return !!b && getComputedStyle(b.closest('.sw-copy')).opacity > 0.5; })()")))
        page.evaluate("[...document.querySelectorAll('.sw-btn--primary')].pop().click()")
        time.sleep(1.2)
        checks.append(("Be seated: tour dies, shell returns, garth presence", page.evaluate("!document.getElementById('tour') && document.getElementById('shell').style.display !== 'none' && !!document.querySelector('#backdrop img')")))
        checks.append(("no video residency after seating", page.evaluate("document.querySelectorAll('video').length === 0")))
        shot("v2_t4_seated")
        checks.append(("uncurated chip standing while world visible", page.evaluate("document.querySelector('#uncurated-chip').className.includes('on')")))
finally:
    kill()
    wd.cancel()

print("\n".join(f"{'PASS' if ok else 'FAIL'}  {n}" for n, ok in checks))
sys.exit(0 if all(ok for _, ok in checks) else 1)
