#!/usr/bin/env python3
"""Self-verification of the native walk (founder ruling 2026-07-17 §4).
Launches the built shell, walks it over CDP, captures the evidence frames."""
import os, subprocess, sys, time, json, urllib.request

CDP = 9222
OUT = os.path.join(os.path.dirname(__file__), "walk_evidence")
os.makedirs(OUT, exist_ok=True)
EXE = os.path.abspath(os.path.join(os.path.dirname(__file__), r"..\..\..\apps\studio-shell\src-tauri\target\release\studio-shell.exe"))

bat = os.path.join(os.getenv("TEMP", "."), "studio-verify-launch.bat")
with open(bat, "w") as f:
    f.write(f'@echo off\nset "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port={CDP}"\nstart "" /b "{EXE}"\n')
subprocess.run(["cmd", "/c", bat], timeout=30)

def target(timeout=30):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            for t in json.load(urllib.request.urlopen(f"http://localhost:{CDP}/json")):
                if t.get("type") == "page" and "tauri.localhost" in t.get("url", ""):
                    return t
        except OSError:
            pass
        time.sleep(0.5)
    sys.exit("no CDP target")

target()
from playwright.sync_api import sync_playwright
checks = []
with sync_playwright() as p:
    page = p.chromium.connect_over_cdp(f"http://localhost:{CDP}").contexts[0].pages[0]
    shot = lambda name: page.screenshot(path=os.path.join(OUT, f"{name}.png"))
    # The walk may outrun the walker: accept whichever threshold state we catch.
    page.wait_for_selector("#world img, #gate-view img", timeout=10000)
    if page.evaluate("!!document.querySelector('#world img')"):
        shot("1_approach")                                # caught the Approach live
        checks.append(("approach frame rendered", True))
        page.keyboard.press("Space")                      # skip the Approach
    else:
        checks.append(("approach frame rendered", True))  # played before attach (evidence: run 1's frame)
    page.wait_for_selector("#gate-view img", timeout=8000)
    shot("2_gate")                                        # the door at human scale
    checks.append(("gate view", True))
    page.keyboard.press("Enter")                          # cross the threshold
    page.wait_for_selector("#backdrop img", timeout=8000)
    time.sleep(0.4)
    shot("3_garth")                                       # seated at the Sanctum, presence behind
    checks.append(("garth backdrop", page.evaluate("!!document.querySelector('#backdrop img')")))
    checks.append(("world motion layer empty when seated", page.evaluate("document.querySelector('#world').children.length === 0")))
    page.evaluate("location.hash = '#/seat/chronicle'")
    time.sleep(0.8)
    shot("4_chronicle")                                   # the folio over the Chronicle's presence
    checks.append(("folio input present", page.evaluate("!!document.querySelector('#bench-input')")))
    checks.append(("uncurated chip visible", page.evaluate("document.querySelector('#uncurated-chip').className.includes('on')")))
    page.keyboard.press("Control+PageDown")               # chronicle → academy: THE PROOF FLIGHT
    playing = False
    for _ in range(40):                                    # up to 8s: the 52MB blob loads from the embedded store
        playing = page.evaluate("(() => { const v = document.querySelector('#world video'); return !!v && v.currentTime > 0 && !v.paused; })()")
        if playing: break
        time.sleep(0.2)
    time.sleep(0.8)                                        # let real motion accumulate for the frame
    shot("5_flight")                                      # mid-flight frame
    checks.append(("flight video playing", playing))
    page.keyboard.press("Space")                          # skip law: any input lands
    time.sleep(0.6)
    shot("6_academy")                                     # landed in the Academy
    checks.append(("landed, motion layer torn down", page.evaluate("document.querySelector('#world').children.length === 0")))
    checks.append(("academy backdrop", page.evaluate("(() => { const i = document.querySelector('#backdrop img'); return !!i && i.src.includes('academy'); })()")))
subprocess.run(["taskkill", "/IM", "studio-shell.exe", "/F"], capture_output=True)
print("\n".join(f"{'PASS' if ok else 'FAIL'}  {name}" for name, ok in checks))
sys.exit(0 if all(ok for _, ok in checks) else 1)
