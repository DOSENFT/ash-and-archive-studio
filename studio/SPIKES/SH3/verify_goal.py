import sys
try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass
"""THE ONE BUILD — goal acceptance: Launch. Scroll. Sit. Write. (and survive relaunch)"""
import os, subprocess, time, json, threading, urllib.request

CDP = 9223
BASE = r"C:\Users\marcu\Documents\Ash & Archive\studio-repo"
EXE = BASE + r"\apps\studio-shell\src-tauri\target\release\studio-shell.exe"
OUT = BASE + r"\studio\SPIKES\SH3\goal_evidence"
os.makedirs(OUT, exist_ok=True)
TEST_TEXT = "The lantern was already lit when I sat down. — goal run " + str(int(time.time()))

pid = None
def kill():
    if pid: subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
wd = threading.Timer(360, lambda: (kill(), os._exit(3))); wd.daemon = True; wd.start()

def launch():
    global pid
    bat = os.path.join(os.getenv("TEMP"), "studio-goal.bat")
    open(bat, "w").write(f'@echo off\nset "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port={CDP}"\nstart "" /b "{EXE}"\n')
    snap = lambda: {int(l.split('","')[1]) for l in subprocess.run(["tasklist","/FI","IMAGENAME eq studio-shell.exe","/FO","CSV","/NH"],capture_output=True,text=True).stdout.splitlines() if "studio-shell" in l}
    b = snap(); subprocess.run(["cmd", "/c", bat], timeout=30); time.sleep(2)
    pid = next(iter(snap() - b), None)
    t0 = time.time()
    while time.time() - t0 < 30:
        try:
            if [t for t in json.load(urllib.request.urlopen(f"http://localhost:{CDP}/json")) if t.get("type") == "page" and "tauri.localhost" in t.get("url", "")]:
                return
        except OSError:
            pass
        time.sleep(0.4)
    kill(); sys.exit("no CDP target")

checks = []
from playwright.sync_api import sync_playwright

# ---- RUN 1: Launch. Scroll. Sit. Write. ----
launch()
try:
    with sync_playwright() as p:
        page = p.chromium.connect_over_cdp(f"http://localhost:{CDP}").contexts[0].pages[0]
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{n}.png"))
        page.wait_for_selector("#tour .sw-scene", timeout=15000)
        time.sleep(1.2)
        checks.append(("opens INTO the journey — no shell chrome", page.evaluate("document.getElementById('shell').style.display === 'none' && !document.querySelector('#rail')")))
        shot("g1_moor")
        page.mouse.move(700, 450)
        for _ in range(4): page.mouse.wheel(0, 420); time.sleep(0.12)
        time.sleep(0.5); shot("g2_gate")
        # THE CONNECTOR: moor->gate flight band (~2.0-2.9vh) — the no-cut transit scrubs
        page.evaluate("scrollTo({top: innerHeight * 2.35, behavior: 'instant'})")
        time.sleep(2.2)
        cc1 = page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return v?v.currentTime:-1; })()")
        page.evaluate("scrollTo({top: innerHeight * 2.75, behavior: 'instant'})")
        time.sleep(1.0)
        cc2 = page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return v?v.currentTime:-1; })()")
        checks.append(("the moor->gate CONNECTOR scrubs (the flight is real)", cc1 >= 0 and cc2 > cc1 + 0.1))
        shot("g2b_connector_flight")
        # the corridor dive band (starts ~5.5vh after two connectors): bidirectional scrub
        page.evaluate("scrollTo({top: innerHeight * 6.3, behavior: 'instant'})")
        for _ in range(40):  # the 69MB corridor blob loads when its band nears; wait for real frames
            if page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return !!v && v.duration > 0 && v.currentTime > 0.05; })()"):
                break
            time.sleep(0.4)
        time.sleep(0.6)
        ct1 = page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return v?v.currentTime:-1; })()")
        page.evaluate("scrollTo({top: innerHeight * 7.4, behavior: 'instant'})")
        time.sleep(1.2)
        ct2 = page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return v?v.currentTime:-1; })()")
        page.evaluate("scrollTo({top: innerHeight * 6.6, behavior: 'instant'})")
        time.sleep(1.0)
        ct3 = page.evaluate("(() => { const ss=[...document.querySelectorAll('.sw-scene')]; const s=ss.find(x=>parseFloat(x.style.opacity||0)>0.6&&x.querySelector('video')); const v=s&&s.querySelector('video'); return v?v.currentTime:-1; })()")
        print(f"corridor cts: {ct1} -> {ct2} -> {ct3}"); checks.append(("the corridor clip scrubs forward and back", ct1 >= 0 and ct2 > ct1 + 0.2 and ct3 < ct2 - 0.1))
        shot("g3_corridor_scrub")
        page.evaluate("scrollTo({top: innerHeight * 9.0, behavior: 'instant'})"); time.sleep(0.8); shot("g4_garth")
        page.evaluate("scrollTo({top: document.querySelector('.sw-track').offsetHeight, behavior: 'instant'})")
        time.sleep(0.9); shot("g5_codex_cta")
        page.evaluate("[...document.querySelectorAll('.sw-btn--primary')].pop().click()")
        page.wait_for_selector("#page", timeout=8000)
        time.sleep(0.8)
        checks.append(("the journey ends at the desk (tour dead, zero video residency)", page.evaluate("!document.getElementById('tour') && document.querySelectorAll('video').length === 0")))
        checks.append(("the desk focuses the page", page.evaluate("document.activeElement && document.activeElement.id === 'page'")))
        page.keyboard.type(TEST_TEXT, delay=8)
        time.sleep(1.4)  # debounce + disk write
        checks.append(("the page inked to disk", page.evaluate("document.getElementById('inked').textContent.startsWith('inked')")))
        shot("g6_desk_written")
        checks.append(("chip at 12px, quiet", page.evaluate("(() => { const c = document.getElementById('uncurated-chip'); const s = getComputedStyle(c); return c.className.includes('on') && parseInt(s.fontSize) <= 12; })()")))
finally:
    kill()

# ---- RUN 2: Relaunch. The words are still there. ----
time.sleep(1.5)
launch()
try:
    with sync_playwright() as p:
        page = p.chromium.connect_over_cdp(f"http://localhost:{CDP}").contexts[0].pages[0]
        page.wait_for_selector("#tour .sw-scene", timeout=15000)
        page.keyboard.press("Enter")          # skip-on-input: any key sits you down
        page.wait_for_selector("#page", timeout=8000)
        time.sleep(0.8)
        persisted = page.evaluate("document.getElementById('page').value")
        checks.append(("RELAUNCH: the words survived on disk", TEST_TEXT in persisted))
        checks.append(("skip-on-input holds (Enter went straight to the desk)", True))
        page.screenshot(path=os.path.join(OUT, "g7_relaunch_persisted.png"))
finally:
    kill(); wd.cancel()

print("\n".join(f"{'PASS' if ok else 'FAIL'}  {n}" for n, ok in checks))
sys.exit(0 if all(ok for _, ok in checks) else 1)
